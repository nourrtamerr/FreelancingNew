// ... existing imports ...

import { Component, NgModule, OnInit, ViewEncapsulation } from '@angular/core';
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
import { filter } from 'rxjs';
import { BiddingProjectFilter } from '../../Shared/Interfaces/BiddingProject/bidding-project-filter';
import { BiddingProjectGetAll } from '../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../Pipes/filter.pipe';
import { TimeAgoPipe } from '../../Pipes/time-ago.pipe';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bidding-project-new',
  imports:[CommonModule, FormsModule,FilterPipe,TimeAgoPipe, RouterOutlet, RouterModule],
  templateUrl: './bidding-project-new.component.html',
  styleUrls: ['./bidding-project-new.component.css']
})
export class BiddingProjectNewComponent implements OnInit {
  // Add these properties for toggling

  constructor(private CategoryService:CategoryService,
    private CountryService: CountriesService,
    private SubCategoryService:SubCategoryService,
    private SkillsService:SkillService,
    private BiddingProjectService:BiddingProjectService
  ){}


  categoryDropdownOpen = false;
  expOpen = false;
  jobTypeOpen = false;
  proposalsOpen = false;
  clientCountry = false;
  currencyOpen = false;
  projectSkillsOpen = false;
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


  ngOnInit(): void {
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

    this.BiddingProjectService.GetAllBiddingProjects(this.BiddingProjectFilter,1,12).subscribe({
      next:(data)=>{this.projectsBeforeAnyFilters=data, this.projects=data,console.log(data)},
      error: (err)=> console.log(err)

    })
   

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


}