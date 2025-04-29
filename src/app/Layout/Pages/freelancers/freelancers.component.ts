import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { CountriesService } from '../../../Shared/Services/Countries/countries.service';
import { CitiesService } from '../../../Shared/Services/Cities/cities.service';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { EducationService } from '../../../Shared/Services/Educations/education.service';
import { ExperienceService } from '../../../Shared/Services/Experiences/experience.service';
import { PortfolioProjectService } from '../../../Shared/Services/Portfolio/portfolio-project.service';
import { PortfolioImageService } from '../../../Shared/Services/PortfolioImage/portfolio-image.service';
import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { FixedPriceProject } from '../../../Shared/Interfaces/FixedPriceProject';
import { ReviewService } from '../../../Shared/Services/Review/review.service';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { filter } from 'rxjs';
import { Files } from '../../../base/environment';
import { FilteredFreelancers, FreelancersFilter, FreelancersFilterationResult, LanguageEnum, RankEnum } from '../../../Shared/Interfaces/Account';
import { Country } from '../../../Shared/Interfaces/Country';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-freelancers',
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './freelancers.component.html',
  styleUrl: './freelancers.component.css'
})
export class FreelancersComponent implements OnInit{
  constructor(
       private route: ActivatedRoute
      ,private router: Router
      ,private fb: FormBuilder
      ,private toastr: ToastrService
      ,private account:AccountService
      ,private authservice:AuthService
      ,private Countryservice:CountriesService
      ,private CityService:CitiesService
      ,private SkillService:SkillService
      ,private educationservice:EducationService
      ,private experienceservice:ExperienceService
      ,private portfolioprojectservice:PortfolioProjectService
      ,private Portfolioprojectimageservice:PortfolioImageService
      ,private certificatservice:CertificateService
      ,private BiddingProjects:BiddingProjectService
      ,private fixedprojects:FixedPriceProjectService
      ,private reviewservice:ReviewService
  ){
  
  }
  filter: FreelancersFilter = {
    pageSize: 10,
    pageNum: 1
  };
  freelancers!:FreelancersFilterationResult
  currentPage:number = 1;
  totalPages:number = 1;
  languages = Object.values(LanguageEnum);
  ranks = Object.values(RankEnum);
  countries: Country[] = []; // Assuming you have a countries list
  picturesurl:string=Files.filesUrl;
  ngOnInit(): void {
      
        this.initializeFilter();
        this.InitialieCountries();
        this.loadFreelancers();
        
      
          
    
  
    }

    InitialieCountries()
    {
      this.Countryservice.getCountries().subscribe({ next: (response: Country[]) => {
        this.countries = response;
        
      },
      error: (error) => {
        this.toastr.error('Failed to load countries');
      }
    }

      )
    }
    initializeFilter() {
      this.filter = {
        isAvailable: false,
        languages: [],
        ranks: [],
        name: '',
        countryIDs: [],
        isVerified: false,
        paymentVerified: false,
        pageSize: 10,
        pageNum: 1
      };
    }

    loadFreelancers()
    {
      this.account.getFreeAgentsFiltered(this.filter).subscribe({
        next: (response: FilteredFreelancers) => {
          this.freelancers = response.result;
          this.totalPages = response.response.numofpages;
          this.currentPage = this.filter.pageNum!;
        },
        error: (error) => {
          this.toastr.error('Failed to load freelancers');
        }
      });
    }


    updateFilter(filterChanges: Partial<FreelancersFilter>) {
      this.filter = { ...this.filter, ...filterChanges, pageNum: 1 }; // Reset to first page on filter change
      this.loadFreelancers();
    }
    
    onPageChange(page: number) {
      this.filter.pageNum = page;
      this.loadFreelancers();
    }
    
    clearFilters() {
      this.initializeFilter();
      this.loadFreelancers();
    }
    
    // Optional: Methods for specific filter updates
    toggleAvailability(isAvailable: boolean) {
      this.updateFilter({ isAvailable });
    }
    
    updateLanguages(languages: LanguageEnum[]) {
      this.updateFilter({ languages });
    }
    
    updateRanks(ranks: RankEnum[]) {
      this.updateFilter({ ranks });
    }
    
    searchByName(name: string) {
      this.updateFilter({ name });
    }
    
    updateCountries(countryIDs: number[]) {
      this.updateFilter({ countryIDs });
    }
    
    toggleVerification(isVerified: boolean) {
      this.updateFilter({ isVerified });
    }
    
    togglePaymentVerification(paymentVerified: boolean) {
      this.updateFilter({ paymentVerified });
    }

    toggleLanguage(language: LanguageEnum) {
      const currentLanguages = this.filter.languages || [];
      if (currentLanguages.includes(language)) {
        this.updateLanguages(currentLanguages.filter(l => l !== language));
      } else {
        this.updateLanguages([...currentLanguages, language]);
      }
    }
    
    toggleRank(rank: RankEnum) {
      const currentRanks = this.filter.ranks || [];
      if (currentRanks.includes(rank)) {
        this.updateRanks(currentRanks.filter(r => r !== rank));
      } else {
        this.updateRanks([...currentRanks, rank]);
      }
    }
    
    isLanguageSelected(language: LanguageEnum): boolean {
      return this.filter.languages?.includes(language) || false;
    }
    
    isRankSelected(rank: RankEnum): boolean {
      return this.filter.ranks?.includes(rank) || false;
    }
}
