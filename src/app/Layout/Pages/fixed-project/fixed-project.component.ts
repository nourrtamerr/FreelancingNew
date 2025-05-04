import { Component, OnInit } from '@angular/core';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { FixedPriceProject } from '../../../Shared/Interfaces/FixedPriceProject';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Currency, ExperienceLevel } from '../../../Shared/Enums/FixedPriceProjectEnum';
import { FixedProjectFilters } from '../../../Shared/Interfaces/FixedPriceProjectFilters';
import { FilterPipe } from '../../../Pipes/filter.pipe';
import { WishlistService } from '../../../Shared/Services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Wishlist } from '../../../Shared/Interfaces/wishlist';
import { CategoryService } from '../../../Shared/Services/Category/category.service';
import { SubCategoryService } from '../../../Shared/Services/SubCategory/sub-category.service';
import { SubCategory2 } from '../../../Shared/Interfaces/sub-category2';
import { Category } from '../../../Shared/Interfaces/category';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { TimeAgoPipe } from '../../../Pipes/time-ago.pipe';

@Component({
  selector: 'app-fixed-project',
  templateUrl: './fixed-project.component.html',
  styleUrls: ['./fixed-project.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, FilterPipe, TimeAgoPipe],
  standalone: true,
})
export class FixedProjectComponent implements OnInit {
  projects: FixedPriceProject[] = [];
  currentPage = 1;
  totalPages = 9; 
  itemsPerPage = 4;

  filters: {
    pageNumber?: number;
    pageSize?: number;
    experienceLevels?: ExperienceLevel[];
    minProposals?: number;
    maxProposals?: number;
    categoryIds?: number[];
    subcategoryIds?: number[];
    currency?: Currency[];
    minPrice?: number;
    maxPrice?: number;
    minDuration?: number;
    maxDuration?: number;
    skillIds?: number[];
  } = {pageNumber: 1,
    pageSize: 10000};

  ExperienceLevel = ExperienceLevel;
  Currency = Currency;

  projectsBeforeAnyFilters:FixedPriceProject[]=[];

  // Available currencies for dropdown
  currencies = Object.values(Currency);

  // Available experience levels for checkboxes
  experienceLevels = Object.values(ExperienceLevel);


  
  categoryDropdownOpen = true;
  expOpen = true;
  jobTypeOpen = true;
  proposalsOpen = true;
  clientCountry = true;
  currencyOpen = true;
  projectSkillsOpen = true;
  durationOpen=true;
  priceOpen=true;
  currentSort: string = 'featured';

  
  countrySearch:string=''
  currencySearch:string=''
  categorySearch:string=''
  skillsSearch:string=''

  userWishlist2: number[]=[];
  subCategories:SubCategory2[]=[];

  role: string='' // Initialize role to null or an empty string

  searchTerm: string = '';

  constructor(private projectService: FixedPriceProjectService,
    private wishlistService:WishlistService,
    private toaster: ToastrService,
    private categoryService: CategoryService,
    private subcategoryService: SubCategoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();

    const roles = this.authService.getRoles();
    this.role = roles?.includes("Freelancer") ? "Freelancer":roles?.includes("Client")? "Client" :roles?.includes("Admin")?"Admin": "";
    
  }
  getExperienceLevelLabel(level: ExperienceLevel): string {
    switch (level) {
      case ExperienceLevel.Entry:
        return 'Entry Level';
      case ExperienceLevel.Intermediate:
        return 'Intermediate';
      case ExperienceLevel.Expert:
        return 'Expert';
      default:
        return level;
    }
  }

  expandedSections = {
    category: true,
    
  };

  Categories: Category[] = [];

  sortProducts(sortOption: string) {
    this.currentSort = sortOption;
    switch (sortOption) {
      case 'price-low-high':
        this.projects.sort((a, b) => a.price - b.price);
        // this.ApplyPagination();
        console.log("entered low to high")
        break;
      case 'price-high-low':
        console.log("entered high to low")

        this.projects.sort((a, b) => b.price - a.price);
        // this.ApplyPagination();
        break;

        // case 'Latest':
        //   this.projects.sort((a, b) => a.postedFrom - b.postedFrom);
        //   // this.ApplyPagination();
        //   break;

        //   case 'Oldest':
        //   this.projects.sort((a, b) => b.postedFrom - a.postedFrom);
        //   // this.ApplyPagination();
        //   break;

      default:
        console.log("didnt enter")
        this.projects;
        break;
    }
  }

  toggleSection(section: keyof typeof this.expandedSections) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  onExperienceLevelChange(level: ExperienceLevel, checked: boolean): void {
    if (!this.filters.experienceLevels) {
      this.filters.experienceLevels = [];
    }
  
    if (checked) {
      if (!this.filters.experienceLevels.includes(level)) {
        this.filters.experienceLevels.push(level); // ✅ Prevent duplicates
      }
    } else {
      this.filters.experienceLevels = this.filters.experienceLevels.filter(
        (l) => l !== level
      );
    }
    this.applyFilters(); // Apply filters automatically after change

  }

  getCurrencyLabel(currency: Currency): string {
    switch (currency) {
      case Currency.USD:
        return 'US Dollar';
      case Currency.EUR:
        return 'Euro';
      case Currency.GBP:
        return 'British Pound';
      case Currency.JPY:
        return 'Japanese Yen';
      case Currency.AUD:
        return 'Australian Dollar';
      case Currency.CAD:
        return 'Canadian Dollar';
      case Currency.CHF:
        return 'Swiss Franc';
      case Currency.CNY:
        return 'Chinese Yuan';
      case Currency.SEK:
        return 'Swedish Krona';
      case Currency.NZD:
        return 'New Zealand Dollar';
      default:
        return currency;
    }
  }
  
  


  onCurrencyChange(currency: Currency, checked: boolean): void {
    if (!this.filters.currency) {
      this.filters.currency = [];
    }
  
    if (checked) {
      if (!this.filters.currency.includes(currency)) {
        this.filters.currency.push(currency); // ✅ Prevent duplicates
      }
    } else {
      this.filters.currency = this.filters.currency.filter(
        (c) => c !== currency
      );
    }
    this.applyFilters(); // Apply filters automatically after change

  }

  selectSubCategory(subcategoryid:number){

    if(this.filters.subcategoryIds==null){
      this.filters.subcategoryIds=[];
    }

    const index = this.filters.subcategoryIds.indexOf(subcategoryid);
    if (index > -1) {
      this.filters.subcategoryIds.splice(index, 1);
    } else {
      this.filters.subcategoryIds.push(subcategoryid);
    }

    this.applyFilters();
  }
  
  onMinProposalsChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.value !== '') {  // Ensure that input is not null and the value is not empty
      this.filters.minProposals = input.valueAsNumber;
      this.applyFilters();
    }
  }
  
  onMaxProposalsChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.value !== '') {
      this.filters.maxProposals = input.valueAsNumber;
      this.applyFilters();
    }
  }
  
  onMinPriceChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.value !== '') {
      this.filters.minPrice = input.valueAsNumber;
      this.applyFilters();
    }
  }
  
  onMaxPriceChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.value !== '') {
      this.filters.maxPrice = input.valueAsNumber;
      this.applyFilters();
    }
  }
  
  
  onMinDurationChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.value !== '') {
      this.filters.minDuration = input.valueAsNumber;
      this.applyFilters();
    }
  }
  
  onMaxDurationChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input && input.value !== '') {
      this.filters.maxDuration = input.valueAsNumber;
      this.applyFilters();
    }
  }
  
  

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




  

  applyFilters(): void {
    const cleanedFilters = this.cleanFilters(); // ✅ Fixed function call
    this.loadProjects(cleanedFilters);
  }

  clearFilters(): void {
    this.filters = {};
    this.loadProjects();
  }


  private cleanFilters() {
    const cleanedFilters = { ...this.filters } as FixedProjectFilters;
    
    // Type-safe way to handle object keys
    (Object.keys(cleanedFilters) as Array<keyof FixedProjectFilters>).forEach((key) => {
      const value = cleanedFilters[key];
      if (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete cleanedFilters[key];
      }
    });

    return cleanedFilters;
  }

  private loadProjects(filters = this.filters): void {
    this.projectService.getProjects(filters).subscribe({
      next: (data: FixedPriceProject[]) => {
        console.log('Projects received:', data);
        this.projects = data;
        if (!Object.keys(filters).length || (Object.keys(filters).length === 2 && filters.pageNumber && filters.pageSize)) {
          this.projectsBeforeAnyFilters = data;
        }
      },
      error: (error) => {
        console.error('Error fetching projects:', error);
      },
    });

    this.wishlistService.GetWishList().subscribe({
      next: (data: Wishlist[]) => {
        this.userWishlist2 = data.map(item => item.projectId); // Extract all project IDs
        console.log("Loaded wishlist:", this.userWishlist2);
      },
      error: (err) => console.log(err)
    });

    this.categoryService.GetAllCategories().subscribe({
      next: (data: any) => {
        this.Categories = data;
        console.log("Loaded categories:", this.Categories);
      },
      error: (err) => console.log(err)
    });

    this.subcategoryService.getAllSubcategories().subscribe({
      next: (data: any) => {
        this.subCategories = data;
        console.log("Loaded subcategories:", this.subCategories);
      },
      error: (err) => console.log(err)
    });
  }

  getSubcategoriesOfCategory(categoryId:number):SubCategory2[]{
    return this.subCategories.filter(sc=>sc.categoryId==categoryId);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}
onPageChange(page: number): void {
  if (page < 1 || page > this.totalPages) {
      return;
  }
  this.currentPage = page;
  this.filters.pageNumber = page;
  this.filters.pageSize = this.itemsPerPage;
  this.loadProjects(this.filters);
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

  
}
