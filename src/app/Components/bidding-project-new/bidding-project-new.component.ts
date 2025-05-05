// ... existing imports ...

import { ChangeDetectorRef, Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { CategoryService } from '../../Shared/Services/Category/category.service';
import { Category } from '../../Shared/Interfaces/category';
import { Country } from '../../Shared/Interfaces/Country';
import { CountriesService } from '../../Shared/Services/Countries/countries.service';
import { SubCategoryService } from '../../Shared/Services/SubCategory/sub-category.service';
import { Currency } from '../../Shared/Enums/currency';
import { ExperienceLevel } from '../../Shared/Enums/experience-level';
import { Skill } from '../../Shared/Interfaces/Skill';
import { SkillService } from '../../Shared/Services/Skill/skill.service';
import { FormsModule } from '@angular/forms';
import { SubCategory2 } from '../../Shared/Interfaces/sub-category2';
import { BiddingProjectService } from '../../Shared/Services/BiddingProject/bidding-project.service';
import { filter, map } from 'rxjs';
import { BiddingProjectFilter } from '../../Shared/Interfaces/BiddingProject/bidding-project-filter';
import { BiddingProjectGetAll } from '../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FilterPipe } from '../../Pipes/filter.pipe';
import { TimeAgoPipe } from '../../Pipes/time-ago.pipe';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { WishlistService } from '../../Shared/Services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Wishlist } from '../../Shared/Interfaces/wishlist';
import { AuthService } from '../../Shared/Services/Auth/auth.service';

@Component({
  selector: 'app-bidding-project-new',
  imports:[CommonModule, FormsModule,FilterPipe,TimeAgoPipe, RouterOutlet, RouterModule, CurrencyPipe],
  templateUrl: './bidding-project-new.component.html',
  styleUrls: ['./bidding-project-new.component.css']
})
export class BiddingProjectNewComponent implements OnInit,OnDestroy {
  // Add these properties for toggling
  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  constructor(private CategoryService:CategoryService,
    private CountryService: CountriesService,
    private SubCategoryService:SubCategoryService,
    private SkillsService:SkillService,
    private BiddingProjectService:BiddingProjectService,
    private wishlistService:WishlistService,
    private toaster: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ){}


  categoryDropdownOpen = true;
  expOpen = true;
  jobTypeOpen = true;
  proposalsOpen = true;
  clientCountry = true;
  currencyOpen = true;
  projectSkillsOpen = true;
  currentSort: string = 'featured';

  countrySearch:string=''
  currencySearch:string=''
  categorySearch:string=''
  skillsSearch:string=''

  Categories: Category[] = []; 
  Countries: Country[]=[];
  SubCategories: SubCategory2[] = []; 
 
  Currencies=Currency
  ExperienceLeveles= ExperienceLevel
  Skills: Skill[]=[];

  BiddingProjectFilter: BiddingProjectFilter={
    SubCategory: [],
  Skills: [],
  Currency: [],
  ExperienceLevel: [],
  ClientCountry: [],
  ProposalRange: []
  }
  
  manualProposalMin: number | null = null;
  manualProposalMax: number | null = null;

  projects:BiddingProjectGetAll[]=[];
  projectsBeforeAnyFilters:BiddingProjectGetAll[]=[];


  expandedSections = {
    category: true,
    
  };

  userWishlist:Wishlist[]=[];

  userWishlist2: number[]=[];


  selectedCategoryId: number | null = null;
  selectedCategoryName: string = '';
  loading = true;


  role: string=''

  searchTerm: string = '';

  private timerInterval: any;
  ngOnInit(): void {

    const roles = this.authService.getRoles();
    this.role = roles?.includes("Freelancer") ? "Freelancer":roles?.includes("Client")? "Client" :roles?.includes("Admin")?"Admin": "";
    
    this.timerInterval = setInterval(() => {
      // Force view update
      this.cd.detectChanges();
    }, 1000);
     // Load all necessary data first
     this.loadInitialData().then(() => {
      // Then handle route parameters
      this.route.paramMap.subscribe(params => {
        const categoryId = params.get('categoryId') ? +params.get('categoryId')! : null;
        
        if (categoryId) {
          this.handleCategorySelection(categoryId);
        } else {
          // No category selected - load all projects
          this.loadAllProjects();
        }
      });
    });

    this.BiddingProjectService.GetAllBiddingProjects(this.BiddingProjectFilter,1,12).subscribe({
      next:(data)=>{this.projectsBeforeAnyFilters=data, this.projects=data,console.log(data)},
      error: (err)=> console.log(err)

    })

   

  }


  private loadAllProjects(): void {
  
    this.filterProject();
  }

  private async loadInitialData(): Promise<void> {
    try {
      // Load all necessary data in parallel
      const [categories, subcategories] = await Promise.all([
        this.CategoryService.GetAllCategories().toPromise(),
        this.SubCategoryService.getAllSubcategories().toPromise()
      ]);

      this.Categories = categories || [];
      this.SubCategories = subcategories || [];

      // Load other data that doesn't affect initial filtering
      this.loadAdditionalData();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }


  private loadAdditionalData(): void {
    // Load other data that doesn't affect initial filtering




    
    this.wishlistService.GetWishList().subscribe({
      next: (data: Wishlist[]) => {
        this.userWishlist2 = data.map(item => item.projectId); // Extract all project IDs
        console.log("Loaded wishlist:", this.userWishlist2);
      },
      error: (err) => console.log(err)
    });



    
    this.CategoryService.GetAllCategories().subscribe({
      next: (data)=> this.Categories=data,
      error: (err) => console.log(err)
    });
  

    this.SubCategoryService.getAllSubcategories().subscribe({
      next: (data)=> {this.SubCategories=data; console.log(data)},
      error: (err)=> console.log(err)
    });

    
    

    this.CountryService.getCountries().subscribe({
      next: (data)=> this.Countries=data,
      error: (err)=> console.log(err)
    });


    this.SkillsService.getSkills().subscribe({
      next: (data)=> this.Skills=data,
      error: (err)=> console.log(err)
    });
  }


  private handleCategorySelection(categoryId: number): void {
    // Find the category
    const category = this.Categories.find(c => c.id === categoryId);
    if (!category) {
      this.router.navigate(['/new']); // Redirect if invalid category
      return;
    }

    this.selectedCategoryId = categoryId;
    this.selectedCategoryName = category.name;

    // Get all subcategories for this category
    const subcategoryIds = this.SubCategories
      .filter(sc => sc.categoryId === categoryId)
      .map(sc => sc.id);

    // Apply filter
    this.BiddingProjectFilter = {
      ...this.BiddingProjectFilter,
      SubCategory: subcategoryIds
    };

    this.filterProject();
  }







  sortProducts(sortOption: string) {
    this.currentSort = sortOption;
    switch (sortOption) {
      case 'price-low-high':
        this.projects.sort((a, b) => a.bidAveragePrice - b.bidAveragePrice);
        // this.ApplyPagination();
        console.log("entered low to high")
        break;
      case 'price-high-low':
        console.log("entered high to low")

        this.projects.sort((a, b) => b.bidAveragePrice - a.bidAveragePrice);
        // this.ApplyPagination();
        break;

        case 'Latest':
          this.projects.sort((a, b) => a.postedFrom - b.postedFrom);
          // this.ApplyPagination();
          break;

          case 'Oldest':
          this.projects.sort((a, b) => b.postedFrom - a.postedFrom);
          // this.ApplyPagination();
          break;

          case 'remaining-low-high':
        this.projects.sort((a, b) => {
          const timeA = new Date(a.biddingEndDate).getTime() - new Date().getTime();
          const timeB = new Date(b.biddingEndDate).getTime() - new Date().getTime();
          return timeA - timeB;
        });
        break;
      case 'remaining-high-low':
        this.projects.sort((a, b) => {
          const timeA = new Date(a.biddingEndDate).getTime() - new Date().getTime();
          const timeB = new Date(b.biddingEndDate).getTime() - new Date().getTime();
          return timeB - timeA;
        });
        break;

      default:
        console.log("didnt enter")
        this.projects;
        break;
    }
  }


  filterProject(){
    this.BiddingProjectService.GetAllBiddingProjects(this.BiddingProjectFilter,1,12).subscribe({
      next:(data)=>{this.projects=data, console.log(data)},
      error: (err)=> console.log(err)

    })
  }


  getEnumValues(enumObj: any): number[] {
    return Object.values(enumObj).filter(value => typeof value === 'number') as number[];
    }


    toggleSection(section: keyof typeof this.expandedSections) {
      this.expandedSections[section] = !this.expandedSections[section];
    }
  
    getSubcategoriesOfCategory(categoryId:number):SubCategory2[]{
      return this.SubCategories.filter(sc=>sc.categoryId==categoryId);
    }

    selectSubCategory(subcategoryid:number){

      if(this.BiddingProjectFilter.SubCategory==null){
        this.BiddingProjectFilter.SubCategory=[];
      }

      const index = this.BiddingProjectFilter.SubCategory.indexOf(subcategoryid);
      if (index > -1) {
        this.BiddingProjectFilter.SubCategory.splice(index, 1);
      } else {
        this.BiddingProjectFilter.SubCategory.push(subcategoryid);
      }

      this.filterProject();
    }


    selectMinPrice(minPrice:number){
      this.BiddingProjectFilter.minprice=minPrice;
      this.filterProject();
    }

    selectMaxPrice(maxPrice:number){
      this.BiddingProjectFilter.maxPrice=maxPrice;
      this.filterProject();
    }

    selectSkills(skillId:number){
      if(this.BiddingProjectFilter.Skills==null){
        this.BiddingProjectFilter.Skills=[];
      }
      const index= this.BiddingProjectFilter.Skills.indexOf(skillId);
      if(index > -1){
        this.BiddingProjectFilter.Skills.splice(index,1);
      }
      else{
        this.BiddingProjectFilter.Skills?.push(skillId);
        
      }
      this.filterProject();
    }

    selectCurrency(currencyId:number){
      if(this.BiddingProjectFilter.Currency==null){
        this.BiddingProjectFilter.Currency=[];
      }
      const index= this.BiddingProjectFilter.Currency.indexOf(currencyId);
      if(index > -1){
        this.BiddingProjectFilter.Currency.splice(index,1);
      }
      else{
        this.BiddingProjectFilter.Currency?.push(currencyId);
      }

      this.filterProject();
    }

    selectExpLevel(expLevelId:number){
      if (this.BiddingProjectFilter.ExperienceLevel ==null) {
        this.BiddingProjectFilter.ExperienceLevel = [];
      }
      const index= this.BiddingProjectFilter.ExperienceLevel?.indexOf(expLevelId);
      if(index === -1){
        this.BiddingProjectFilter.ExperienceLevel?.push(expLevelId);
      }
      else{
        this.BiddingProjectFilter.ExperienceLevel?.splice(index,1);      
        }      
      console.log(this.BiddingProjectFilter.ExperienceLevel);
      this.filterProject();

    }


    selectClientCountry(clientCountryId:number){
      if (this.BiddingProjectFilter.ClientCountry ==null) {
        this.BiddingProjectFilter.ClientCountry = []; 
      }
      const index= this.BiddingProjectFilter.ClientCountry.indexOf(clientCountryId);
      if(index === -1){
        this.BiddingProjectFilter.ClientCountry?.push(clientCountryId);
         }
        else{
          this.BiddingProjectFilter.ClientCountry?.splice(index,1);
        }

      this.filterProject();
    }

    selectMinExpectedDuration(minExpectedDuration:number){
      this.BiddingProjectFilter.MinExpectedDuration=minExpectedDuration;
      this.filterProject();
    }

    selectMaxExpectedDuration(maxExpectedDuration:number){
      this.BiddingProjectFilter.MaxExpectedDuration=maxExpectedDuration;
      this.filterProject();
    }

    // selectProposalRange(min:number, max:number){
    //   if(this.BiddingProjectFilter.ProposalRange==null){
    //         this.BiddingProjectFilter.ProposalRange=[];
    //       }
    //   if (min !== null && max !== null) {
    //     const rangeIndex = this.BiddingProjectFilter.ProposalRange?.findIndex(
    //       range => range.min === min && range.max === max
    //     );
    
    //     if (rangeIndex > -1) {
    //       this.BiddingProjectFilter.ProposalRange?.splice(rangeIndex, 1); 
    //     } else {
    //       this.BiddingProjectFilter.ProposalRange?.push({ min, max }); 
    //     }
    //   }
    //   else {
    //      if (min != null) {

    //       this.manualProposalMin = min;
    //       this.BiddingProjectFilter.ProposalRange?.push({ min, max: Infinity });
    //     }
    //     else if (max != null ) {

    //       this.manualProposalMax = max;
    //       this.BiddingProjectFilter.ProposalRange?.push({ min: 0, max });
    //     } 
    //   }
    //       this.filterProject();
        
    // }

    // selectProposalRange(min: number, max: number, isManual: boolean = false) {
    //   if (!this.BiddingProjectFilter.ProposalRange) {
    //     this.BiddingProjectFilter.ProposalRange = [];
    //   }
    
    //   const existsIndex = this.BiddingProjectFilter.ProposalRange.findIndex(
    //     range => range.min === min && range.max === max
    //   );
    
    //   if (!isManual) {
    //     if (existsIndex > -1) {
    //       this.BiddingProjectFilter.ProposalRange.splice(existsIndex, 1); // Uncheck
    //     } else {
    //       this.BiddingProjectFilter.ProposalRange.push({ min, max }); // Check
    //     }
    //   } else {
    //     // For manual input - just update or replace the last manual entry
    //     const manualIndex = this.BiddingProjectFilter.ProposalRange.findIndex(
    //       r => r.isManual === true
    //     );
    //     const manualRange = { min, max, isManual: true };
    
    //     if (manualIndex > -1) {
    //       this.BiddingProjectFilter.ProposalRange[manualIndex] = manualRange;
    //     } else {
    //       this.BiddingProjectFilter.ProposalRange.push(manualRange);
    //     }
    //   }
    
    //   this.filterProject();
    // }



    selectProposalRange(min: number, max: number, isManual: boolean = false) {
      if (!this.BiddingProjectFilter.ProposalRange) {
        this.BiddingProjectFilter.ProposalRange = [];
      }
    
      // For manual input only — replace any existing manual range
      if (isManual) {
        if ((this.manualProposalMin == null || this.manualProposalMin === undefined) && 
            (this.manualProposalMax == null || this.manualProposalMax === undefined)) {
          // Remove only the manual range
          this.BiddingProjectFilter.ProposalRange = this.BiddingProjectFilter.ProposalRange.filter(
            r => !r.isManual
          );
        } else {
          const manualIndex = this.BiddingProjectFilter.ProposalRange.findIndex(r => r.isManual);
          const manualRange = { min, max, isManual: true };
    
          if (manualIndex > -1) {
            this.BiddingProjectFilter.ProposalRange[manualIndex] = manualRange;
          } else {
            this.BiddingProjectFilter.ProposalRange.push(manualRange);
          }
        }
    
        this.filterProject();
        return;
    }
    
    
      // For checkbox ranges
      const index = this.BiddingProjectFilter.ProposalRange.findIndex(r => r.min === min && r.max === max);
      if (index > -1) {
        this.BiddingProjectFilter.ProposalRange.splice(index, 1);
      } else {
        this.BiddingProjectFilter.ProposalRange.push({ min, max });
      }
    
      this.filterProject();
    }
    
    // isProposalRangeSelected(min: number, max: number): boolean {
    //   return this.BiddingProjectFilter.ProposalRange?.some(
    //     r => r.min === min && r.max === max && !r.isManual
    //   ) ?? false;
    // }

    AddToWishlist(projectid:number){
      this.wishlistService.AddToWishlist(projectid).subscribe({
        next:()=>{
          this.toaster.success("Added to wishlist")
        },
        error:(err)=>{
          console.log(err)
        }
      })
    }


    RemoveFromWishlist(projectid:number){
      this.wishlistService.RemoveFromWishList(projectid).subscribe({
        next:()=>{
          this.toaster.success("Removed from wishlist")
        },
        error:(err)=>{
          console.log(err)
        }
      })
    }


    calculateRemainingTime(endDate: string): string {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
    
      if (diff <= 0) {
        return 'Bidding Ended';
      }
    
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
      if (days > 0) {
        return `${days}d ${hours}h remaining`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      } else {
        return `${minutes}m remaining`;
      }
    }


    toggleWishlist(projectid:number){
     const index= this.userWishlist2.indexOf(projectid);
     if(index > -1){
      this.RemoveFromWishlist(projectid);
      this.userWishlist2.splice(index,1);
     }
     else{
      this.AddToWishlist(projectid);
      this.userWishlist2.push(projectid);
     }

    }


    onSearch() {
      if (!this.searchTerm?.trim()) {
        this.projects = [...this.projectsBeforeAnyFilters];
        return;
      }
  
      const searchTermLower = this.searchTerm.toLowerCase();
      this.projects = this.projectsBeforeAnyFilters.filter(project => 
        project.title.toLowerCase().includes(searchTermLower) ||
        project.description.toLowerCase().includes(searchTermLower)
      );
    }



    // getBiddingStatus(startDate: string, endDate: string): { text: string; class: string } {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);
    //   const now = new Date();
    
    //   if (now < start) {
    //     // Bidding hasn't started yet
    //     const diff = start.getTime() - now.getTime();
    //     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    //     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //     return {
    //       text: `Starts in ${days}d ${hours}h`,
    //       class: 'bidding-soon'
    //     };
    //   } else if (now > end) {
    //     // Bidding has ended
    //     return {
    //       text: 'Bidding Ended',
    //       class: 'bidding-ended'
    //     };
    //   } else {
    //     // Bidding is active
    //     const diff = end.getTime() - now.getTime();
    //     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    //     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //     return {
    //       text: `${days}d ${hours}h remaining`,
    //       class: 'bidding-active'
    //     };
    //   }
    // }

    getCountdownTime(endDate: string): string {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
    
      if (diff <= 0) return '00:00:00';
    
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    // Add these methods to your component class

// Check if the auction is ending soon (less than 12 hours)
isUrgent(endDateStr: string): boolean {
  if (!endDateStr) return false;
  
  const endDate = new Date(endDateStr);
  const now = new Date();
  const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursLeft > 0 && hoursLeft < 12;
}

// Get countdown days
getCountdownDays(endDateStr: string): string {
  if (!endDateStr) return '00';
  
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return '00';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days.toString().padStart(2, '0');
}

// Get countdown hours
getCountdownHours(endDateStr: string): string {
  if (!endDateStr) return '00';
  
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return '00';
  
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return hours.toString().padStart(2, '0');
}

// Get countdown minutes
getCountdownMinutes(endDateStr: string): string {
  if (!endDateStr) return '00';
  
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return '00';
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return minutes.toString().padStart(2, '0');
}

// Get countdown seconds
getCountdownSeconds(endDateStr: string): string {
  if (!endDateStr) return '00';
  
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return '00';
  
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return seconds.toString().padStart(2, '0');
}

// Existing getBiddingStatus method should remain as is
getBiddingStatus(startDateStr: string, endDateStr: string): { text: string, class: string } {
  const now = new Date();
  const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
  const endDate = endDateStr ? new Date(endDateStr) : new Date(0);
  
  if (now < startDate) {
    return { text: 'Bidding Soon', class: 'bidding-soon' };
  } else if (now >= startDate && now < endDate) {
    return { text: 'Bidding Active', class: 'bidding-active' };
  } else {
    return { text: 'Bidding Ended', class: 'bidding-ended' };
  }
}


bidStatusOpen = true;
selectedBidStatuses: string[] = [];
bidStatusOptions = [
  { value: 'upcoming', label: 'Not Started' },
  { value: 'active', label: 'Currently Active' },
  { value: 'ended', label: 'Ended' }
];

toggleBidStatus(status: string) {
  const index = this.selectedBidStatuses.indexOf(status);
  if (index > -1) {
    this.selectedBidStatuses.splice(index, 1);
  } else {
    this.selectedBidStatuses.push(status);
  }
  this.filterProjectsByBidStatus();
}

filterProjectsByBidStatus() {
  if (this.selectedBidStatuses.length === 0) {
    this.projects = [...this.projectsBeforeAnyFilters];
  } else {
    this.projects = this.projectsBeforeAnyFilters.filter(project => {
      const now = new Date();
      const startDate = new Date(project.biddingStartDate);
      const endDate = new Date(project.biddingEndDate);

      if (this.selectedBidStatuses.includes('upcoming') && now < startDate) {
        return true;
      }
      if (this.selectedBidStatuses.includes('active') && now >= startDate && now <= endDate) {
        return true;
      }
      if (this.selectedBidStatuses.includes('ended') && now > endDate) {
        return true;
      }
      return false;
    });
  }
}
}