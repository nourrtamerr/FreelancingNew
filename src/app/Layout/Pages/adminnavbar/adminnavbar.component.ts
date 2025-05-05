
// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { ChartConfiguration } from 'chart.js';
// import { BaseChartDirective } from 'ng2-charts';
// import { AccountService } from '../../../Shared/Services/Account/account.service';
// import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
// import { ProposalService } from '../../../Shared/Services/Proposal/proposal.service';
// import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';
// import { SkillService } from '../../../Shared/Services/Skill/skill.service';
// import { FreelancerlanguageService } from '../../../Shared/Services/FreelancerLanguages/freelancerlanguage.service';
// import { MilestoneService } from '../../../Shared/Services/Milestone/milestone.service';
// import { ToastrService } from 'ngx-toastr';
// import { Observable, forkJoin, of } from 'rxjs';
// import { map, catchError, finalize, switchMap } from 'rxjs/operators';
// import { AppUsers, UsersRequestingVerificaiton } from '../../../Shared/Interfaces/Account';
// import { FixedPriceProject, ProjectsResponse } from '../../../Shared/Interfaces/FixedPriceProject';
// import { Certificate } from '../../../Shared/Interfaces/certificate';
// import { Skill } from '../../../Shared/Interfaces/Skill';
// import { FreelancerLanguage } from '../../../Shared/Interfaces/freelancer-language';
// import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
// import { BiddingProjectGetAll, BiddingProjectsResponse } from '../../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
// import { UserSkill } from '../../../Shared/Interfaces/UserSkill';
// import { ProjectsService } from '../../../Shared/Services/Projects/projects.service';

// @Component({
//   selector: 'app-adminnavbar',
//   standalone: true,
//   imports: [CommonModule, RouterModule, BaseChartDirective],
//   templateUrl: './adminnavbar.component.html',
//   styleUrl: './adminnavbar.component.css'
// })
// export class AdminnavbarComponent implements OnInit {
//   lastUpdated: Date = new Date();
//   isLoading = {
//     users: true,
//     projects: true,
//     proposals: true,
//     certificates: true,
//     skills: true,
//     languages: true,
//     revenue: true
//   };

//   hasError = {
//     users: false,
//     projects: false,
//     proposals: false,
//     certificates: false,
//     skills: false,
//     languages: false,
//     revenue: false
//   };

//   userCounts = {
//     clients: 0,
//     freelancers: 0,
//     admins: 0
//   };

//   projectStats = {
//     total: 0,
//     pending: 0,
//     completed: 0,
//     Working :0,
//     Fixed:0,
//     Bidding:0,
//   };

//   proposalStats = {
//     total: 0,
//     averagePerProject: 0
//   };

//   pendingCertificates = 0;

//   topSkills: { name: string; count: number }[] = [];

//   languageDistribution: { language: string; count: number }[] = [];

//   revenueChartData: ChartConfiguration<'line'>['data'] = {
//     labels: [],
//     datasets: [{
//       data: [],
//       label: 'Monthly Revenue',
//       fill: true,
//       tension: 0.5,
//       borderColor: 'rgb(75, 192, 192)',
//       backgroundColor: 'rgba(75, 192, 192, 0.3)'
//     }]
//   };

//   projectStatusChartData: ChartConfiguration<'pie'>['data'] = {
//     labels: ['Pending', 'Working', 'Completed'],
//     datasets: [{
//       data: [],
//       backgroundColor: ['#FFA500', '#4CAF50','#4BC0C0']
//     }]
//   };

//   languageChartData: ChartConfiguration<'pie'>['data'] = {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: [
//         '#FF6384',
//         '#36A2EB',
//         '#FFCE56',
//         '#4BC0C0',
//         '#9966FF',
//         '#FF9F40'
//       ]
//     }]
//   };

//   lineChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     plugins: {
//       legend: { display: true },
//       title: {
//         display: true,
//         text: 'Monthly Revenue'
//       }
//     }
//   };

//   pieChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'right',
//       },
//       title: {
//         display: true,
//         text: 'Project Status Distribution'
//       }
//     }
//   };
//   isSidebarCollapsed = false;
//   adminName = 'John Doe'; // Replace with actual admin name
//   adminAvatar = 'assets/images/admin-avatar.jpg'; // Replace with actual avatar path
//   constructor(
//     private accountService: AccountService,
//     private projectService: FixedPriceProjectService,
//     private proposalService: ProposalService,
//     private certificateService: CertificateService,
//     private skillService: SkillService,
//     private languageService: FreelancerlanguageService,
//     private toastr: ToastrService,
//     private biddingProjectService: BiddingProjectService,
//     private cdr: ChangeDetectorRef,
//     private bothTypesprojectservice:ProjectsService
//   ) {}

//   total: number = 0;

//   ngOnInit(): void {
//     this.lastUpdated = new Date();
//     this.loadDashboardData();
//     this.skillService.getUserSkillsForAdmin().subscribe((skills: UserSkill[]) => {
//       console.log('Skills:', skills);
//     });
//     this.biddingProjectService.GetAllBiddingProjects({},10,10).subscribe((bidding:any)=>{
//         console.log('Bidding' , bidding)
//     } )
//   }

//   loadDashboardData(): void {
//     forkJoin([
//       this.loadRevenueData(),
//       this.loadUserStatistics(),
//       this.loadProjectStatistics(),
//       this.loadProposalStatistics(),
//       this.loadCertificateStatistics(),
//       this.loadTopSkills(),
//       this.loadLanguageDistribution(),
//     ]).subscribe({
//       next: () => {
//         this.proposalStats = {
//           ...this.proposalStats,
//           averagePerProject: this.projectStats.total > 0 ? this.proposalStats.total / this.projectStats.total : 0
//         };
//         this.cdr.detectChanges();
//         this.toastr.success('Dashboard data loaded successfully');
//       },
//       error: (error) => {
//         this.toastr.error('Error loading dashboard data');
//         console.error('Error loading dashboard data:', error);
//       }
//     });
//   }

//   private loadUserStatistics(): Observable<void> {
//     this.isLoading.users = true;
//     this.hasError.users = false;
//     return this.accountService.getUsers().pipe(
//       map((response: AppUsers) => {
//         const clients = response?.filter(user => user.role === 'Client').length || 0;
//         const freelancers = response?.filter(user => user.role === 'Freelancer').length || 0;
//         const admins = response?.filter(user => user.role === 'Admin').length || 0;

//         this.userCounts = {
//           clients,
//           freelancers,
//           admins
//         };
//       }),
//       catchError(error => {
//         console.error('Error fetching user statistics:', error);
//         this.hasError.users = true;
//         this.toastr.error('Failed to load user statistics');
//         return of(void 0);
//       }),
//       map(() => {
//         this.isLoading.users = false;
//       })
//     );
//   }

//   private loadProjectStatistics(): Observable<void> {
//     this.isLoading.projects = true;
//     this.hasError.projects = false;

//     this.bothTypesprojectservice.getProjects().subscribe({
//       next: (data: any) => {
//         this.total = data.length;
//         let pending = 0;
//         let completed = 0;
//         let Working = 0;
//         let Bidding=0;
//         let Fixed=0;
//         console.log(data);
//         data.forEach((project: any) => {
//           if (project.status === "Working") Working++;
//           else if (project.status === "Pending") pending++;
//           else completed++;

//           if(project.projectType=="bidding") Bidding++;
//           else Fixed++;
//         });

//         this.projectStats = {
//           total: this.total,
//           pending,
//           completed,
//           Working,
//           Bidding,
//           Fixed
//         };

//         this.projectStatusChartData = {
//           ...this.projectStatusChartData,
//           datasets: [{
//             ...this.projectStatusChartData.datasets[0],
//             data: [pending, completed, Working]
//           }]
//         };

//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         this.hasError.projects = true;
//         this.toastr.error('Failed to load project statistics');
//         this.projectStats = { total: 0, pending: 0, completed: 0, Working: 0, Bidding:0,Fixed:0 };
//         this.projectStatusChartData = {
//           ...this.projectStatusChartData,
//           datasets: [{ ...this.projectStatusChartData.datasets[0], data: [0, 0, 0] }]
//         };
//         this.cdr.detectChanges();
//       }
//     });


//     return new Observable<void>;

//   }

//   private loadProposalStatistics(): Observable<void> {
//     this.isLoading.proposals = true;
//     this.hasError.proposals = false;
//     return this.proposalService.GetAllProposals().pipe(
//       map(proposals => {
//         console.log('Proposals Response:', proposals);
//         this.proposalStats = {
//           total: proposals.length,
//           averagePerProject: 0
//         };
//         this.cdr.detectChanges();
//       }),
//       catchError(error => {
//         console.error('Error fetching proposals:', error);
//         this.hasError.proposals = true;
//         this.toastr.error('Failed to load proposal statistics');
//         this.proposalStats = { total: 0, averagePerProject: 0 };
//         return of(void 0);
//       }),
//       finalize(() => {
//         this.isLoading.proposals = false;
//       })
//     );
//   }

//   private loadCertificateStatistics(): Observable<void> {
//     this.isLoading.certificates = true;
//     this.hasError.certificates = false;

//     return this.accountService.getUsersRequestingVerifications().pipe(
//       map((certificates: UsersRequestingVerificaiton) => {
//         this.pendingCertificates = certificates.length;
//         this.cdr.detectChanges();
//       }),
//       catchError(error => {
//         console.error('Error fetching certificates:', error);
//         this.hasError.certificates = true;
//         this.toastr.error('Failed to load certificate statistics');
//         this.pendingCertificates = 0;
//         return of(void 0);
//       }),
//       map(() => {
//         this.isLoading.certificates = false;
//       })
//     );

//     return this.certificateService.getAllCertificates().pipe(
//       map((certificates: Certificate[]) => {
//         this.pendingCertificates = certificates.length;
//         this.cdr.detectChanges();
//       }),
//       catchError(error => {
//         console.error('Error fetching certificates:', error);
//         this.hasError.certificates = true;
//         this.toastr.error('Failed to load certificate statistics');
//         this.pendingCertificates = 0;
//         return of(void 0);
//       }),
//       map(() => {
//         this.isLoading.certificates = false;
//       })
//     );
//   }

//   private loadTopSkills(): Observable<void> {
//     this.isLoading.skills = true;
//     this.hasError.skills = false;
//     return this.skillService.getUserSkillsForAdmin().pipe(
//       map((skills: UserSkill[]) => {
//         const skillCounts = new Map<string, number>();
//         skills.forEach(skill => {
//           const count = skillCounts.get(skill.skillName??"") || 0;
//           skillCounts.set(skill.skillName??"", count + 1);
//         });
// //changed
//         this.topSkills = Array.from(skillCounts.entries())
//           .map(([name, count]) => ({ name, count }))
//           .sort((a, b) => b.count - a.count)
//           .slice(0, 5);
//         this.cdr.detectChanges();
//       }),
//       catchError(error => {
//         console.error('Error fetching skills:', error);
//         this.hasError.skills = true;
//         this.toastr.error('Failed to load top skills');
//         this.topSkills = [];
//         return of(void 0);
//       }),
//       map(() => {
//         this.isLoading.skills = false;
//       })
//     );
//   }

//   private loadLanguageDistribution(): Observable<void> {
//     this.isLoading.languages = true;
//     this.hasError.languages = false;
//     return this.languageService.getAllFreelancerLanguages().pipe(
//       map((languages: FreelancerLanguage[]) => {
//         console.log('Languages Response:', languages);
//         const languageCounts = new Map<string, number>();
//         languages.forEach(lang => {
//           if (!lang.isDeleted) {
//             const count = languageCounts.get(lang.language) || 0;
//             languageCounts.set(lang.language, count + 1);
//           }
//         });

//         this.languageDistribution = Array.from(languageCounts.entries())
//           .map(([language, count]) => ({ language, count }));

//         this.languageChartData = {
//           ...this.languageChartData,
//           labels: this.languageDistribution.map(l => l.language),
//           datasets: [{
//             ...this.languageChartData.datasets[0],
//             data: this.languageDistribution.map(l => l.count)
//           }]
//         };

//         this.cdr.detectChanges();
//       }),
//       catchError(error => {
//         console.error('Error fetching languages:', error);
//         this.hasError.languages = true;
//         this.toastr.error('Failed to load language distribution');
//         this.languageDistribution = [];
//         this.languageChartData = {
//           ...this.languageChartData,
//           labels: [],
//           datasets: [{ ...this.languageChartData.datasets[0], data: [] }]
//         };
//         this.cdr.detectChanges();
//         return of(void 0);
//       }),
//       map(() => {
//         this.isLoading.languages = false;
//       })
//     );
//   }

//   private loadRevenueData(): Observable<void> {
//     this.isLoading.revenue = true;
//     this.hasError.revenue = false;

//     const fixedProjects$ = this.bothTypesprojectservice.getProjects().subscribe({
//       next: (data: any) => {
//         console.log(data);
//         const monthlyRevenue = new Map<string, number>();
//         data.forEach((project:any) => {
//           project.milestones.forEach((milestone:any) => {
//             const month = new Date(milestone.startdate).toLocaleString('default', { month: 'short', year: 'numeric' });
//             const revenue = monthlyRevenue.get(month) || 0;
//             monthlyRevenue.set(month, revenue + milestone.amount);
//           });
//         });
//         console.log(monthlyRevenue);

//         const sortedMonths = Array.from(monthlyRevenue.keys()).sort((a, b) => {
//           const dateA = new Date(`01 ${a}`);
//           const dateB = new Date(`01 ${b}`);
//           return dateA.getTime() - dateB.getTime();
//         });

//         this.revenueChartData = {
//           ...this.revenueChartData,
//           labels: sortedMonths,
//           datasets: [{
//             ...this.revenueChartData.datasets[0],
//             data: sortedMonths.map(month => monthlyRevenue.get(month) || 0)
//           }]
//         };

//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         this.hasError.projects = true;
//         this.toastr.error('Failed to load project statistics');
//         this.projectStats = { total: 0, pending: 0, completed: 0, Working: 0, Bidding:0,Fixed:0 };
//         this.projectStatusChartData = {
//           ...this.projectStatusChartData,
//           datasets: [{ ...this.projectStatusChartData.datasets[0], data: [0, 0, 0] }]
//         };
//         this.cdr.detectChanges();
//       }
//     });


//     return new Observable<void>;


//   }
//   toggleSidebar() {
//     this.isSidebarCollapsed = !this.isSidebarCollapsed;
//   }
// }
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { AppUser, EditProfileDTO, IdentityVerificationRequest, LanguageEnum } from '../../../Shared/Interfaces/Account';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Country } from '../../../Shared/Interfaces/Country';
import { City } from '../../../Shared/Interfaces/City';
import { CountriesService } from '../../../Shared/Services/Countries/countries.service';
import { CitiesService } from '../../../Shared/Services/Cities/cities.service';
import { Environment, Files, projectImages } from '../../../base/environment';
import { UserSkill } from '../../../Shared/Interfaces/UserSkill';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { FreelancerSkill, nonrecommendedSkill, Skill } from '../../../Shared/Interfaces/Skill';
import { EducationService } from '../../../Shared/Services/Educations/education.service';
import { Education } from '../../../Shared/Interfaces/education';
import { ToastrService } from 'ngx-toastr';
import { ExperienceService } from '../../../Shared/Services/Experiences/experience.service';
import { Experience } from '../../../Shared/Interfaces/experience';
import { freelancerportofolioproject, freelancerportofolioprojects, portfolioProject } from '../../../Shared/Interfaces/PortfolioProject';
import { PortfolioProjectService } from '../../../Shared/Services/Portfolio/portfolio-project.service';
// import { NgbCarouselModule, NgbModule,NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioImageService } from '../../../Shared/Services/PortfolioImage/portfolio-image.service';
import { forkJoin } from 'rxjs';
import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';
import { Certificate } from '../../../Shared/Interfaces/certificate';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetAll } from '../../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { TimeAgoPipe } from '../../../Pipes/time-ago.pipe';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { FixedPriceProject } from '../../../Shared/Interfaces/FixedPriceProject';
import { FreelancerLanguage } from '../../../Shared/Interfaces/freelancer-language';
import { FreelancerlanguageService } from '../../../Shared/Services/FreelancerLanguages/freelancerlanguage.service';
import { BannedUsersComponent } from "../banned-users/banned-users.component";
import { AllusersComponent } from "../AllUsers/allusers.component";
import { AddAdminComponent } from "../add-admin/add-admin.component";
import { IdentityVerificationDeicisionComponent } from "../identity-verification-deicision/identity-verification-deicision.component";
import { AllPaymentsComponent } from "../AllPayments/all-payments/all-payments.component";
import { AdminDashboardComponent } from "../admin-dashboard/admin-dashboard.component";
import { DisputesystemComponent } from "../disputesystem/disputesystem.component";
import { AdminDataManagementComponent } from "../admin-data-management/admin-data-management.component";


@Component({

  selector: 'app-adminnavbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TimeAgoPipe, RouterModule, BannedUsersComponent, AllusersComponent, AddAdminComponent, IdentityVerificationDeicisionComponent, AllPaymentsComponent, AdminDashboardComponent, DisputesystemComponent, AdminDataManagementComponent],
  providers:[FormBuilder],
  templateUrl: './adminnavbar.component.html',
  styleUrl: './adminnavbar.component.css'
//   standalone: true,
//   imports: [CommonModule, RouterModule, BaseChartDirective],
//
})
export class AdminnavbarComponent {
  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.activeTab = fragment;
      }
    });
    this.loadCountries();
    this.picturesurl=Files.filesUrl;
    this.loadProfile();
    this.initializeForm();
    this.initializeskills();
    this.initializeNonrecommendedskills();
    // this.loadEducation();
    this.initializeEducationForm();
    this.initializeExperienceForm();
    this.initProjectForm();
    this.initCertificateForm();
    this.initLanguageForm();

  }

  constructor(private route: ActivatedRoute
    ,private router: Router
    ,private account:AccountService
    ,private authservice:AuthService
    ,private Countryservice:CountriesService
    ,private CityService:CitiesService
    ,private SkillService:SkillService
    ,private fb: FormBuilder
    ,private educationservice:EducationService
    ,private toastr: ToastrService
    ,private experienceservice:ExperienceService
    ,private portfolioprojectservice:PortfolioProjectService
    ,private Portfolioprojectimageservice:PortfolioImageService
    ,private certificatservice:CertificateService
    ,private BiddingProjects:BiddingProjectService
    ,private fixedprojects:FixedPriceProjectService
    ,private freelancerlanguages:FreelancerlanguageService
    ,private cdr: ChangeDetectorRef
  ) {


  }


  mylanguages:FreelancerLanguage[]=[];
  missinglanguages:LanguageEnum[]=[];

  loadLanguages(){
    this.freelancerlanguages.getFreelancerLanguageByUserName(this.profile.userName).subscribe(
      {
        next:(data:FreelancerLanguage[])=>{
          this.mylanguages=data;
          this.missinglanguages = allLanguages.filter(lang =>
            !this.mylanguages.some(myLang =>
                myLang.language === lang && !myLang.isDeleted
            )
        );
        },
        error:(err)=>{
          this.error=err;
          this.toastr.error("failed to load languages");
        }
      }
    )
    const allLanguages = Object.values(LanguageEnum);

    // Filter out languages that the freelancer already has


  }


  fixedProjects:FixedPriceProject[]=[]
  biddingprojects:BiddingProjectGetAll[]=[]
  isLanguageModalOpen = false;
languageForm!: FormGroup;


initLanguageForm() {
  this.languageForm = this.fb.group({
      language: ['', Validators.required]
  });
}

openAddLanguageModal() {
  // this.loadLanguages(); // Make sure to get updated list
  this.initLanguageForm();
  this.isLanguageModalOpen = true;
}

closeLanguageModal() {
  this.isLanguageModalOpen = false;
  this.languageForm.reset();
}

submitLanguage() {
  if (this.languageForm.valid) {
      const newLanguage: FreelancerLanguage = {
          language: this.languageForm.value.language,
          isDeleted: false
      };

      this.freelancerlanguages.addFreelancerLanguage(newLanguage).subscribe({
          next: () => {
              this.toastr.success('Language added successfully');
              this.loadLanguages(); // Refresh the languages list
              this.closeLanguageModal();
          },
          error: (err) => {
              this.toastr.error('Failed to add language');
              console.error(err);
          }
      });
  }
}

deleteLanguage(language: FreelancerLanguage) {
  this.freelancerlanguages.deleteFreelancerLanguage(language.id?? 0).subscribe({
      next: () => {
          this.toastr.success('Language removed successfully');
          this.loadLanguages(); // Refresh the languages list
      },
      error: (err) => {
          this.toastr.error('Failed to remove language');
          console.error(err);
      }
  });
}


loadBiddingProjects(){
  this.BiddingProjects.GetmyBiddingprojects().subscribe(
    {
      next:(data:BiddingProjectGetAll[])=>{
        this.biddingprojects=data;
      },
      error:(err)=>{
        this.error=err;
        this.toastr.error("failed to load bidding projects");
      }
    }
  )
  this.fixedprojects.getmyprojects().subscribe(
    {
      next:(data:FixedPriceProject[])=>{
        this.fixedProjects=data;
      },
      error:(err)=>{
        this.error=err;
        this.toastr.error("failed to load bidding projects");
      }
    }
  )

}

//#region allprevious
//#region  percentage

// Add this property to your component class
public profileCompletionPercentage: number = 0;

// Add this method to calculate completion percentage
calculateProfileCompletion(): void {
  let percentage = 0;

  // Basic profile data (40%)
  if (this.profile) {
    const requiredFields = [
      this.profile.firstname,
      this.profile.lastname,
      this.profile.email,
      this.profile.city,
      this.profile.phoneNumber,
      this.profile.dateOfBirth,
      this.profile.description
    ];

    const filledFields = requiredFields.filter(field => field !== null && field !== undefined && field !== '').length;
    percentage += Math.round((filledFields / requiredFields.length) * 40);
console.log(percentage,"before education")
    // Education (10%)
    if (this.userEducation && Object.keys(this.userEducation).length > 0) {
      percentage += 10;
    }
    console.log(percentage,"before experience and after education")

    // Experience (10%)
    if (Array.isArray(this.userExperiences) && this.userExperiences.length > 0) {
      percentage += 10;
    }
    console.log(percentage,"before certificaties and after experience")

    // Certificates (10%)
    if (Array.isArray(this.userCertificates) && this.userCertificates.length > 0) {
      percentage += 10;
    }
    console.log(percentage,"before verification and after certificates")

    // Verification (10%)
    if (this.profile.isVerified === true) {
      percentage += 10;
    }
    console.log(percentage,"total")

    // Projects (20%)
    if (Array.isArray(this.userPortfolioproject) && this.userPortfolioproject.length > 0) {
      const projectPercentage = Math.min(this.userPortfolioproject.length, 3) * (20/3);
      percentage += Math.round(projectPercentage);
    }
    console.log(percentage,"total after skills")

  }

  this.profileCompletionPercentage = Math.min(100, Math.round(percentage));
}
//#endregion

 //#region certificat
 userCertificates: Certificate[] = [];
 isCertificateModalOpen: boolean = false;
 editingCertificate: any = null;
 certificateForm!: FormGroup;

 private initCertificateForm() {
  this.certificateForm = this.fb.group({
    name: ['', Validators.required],
    issuer: ['', Validators.required],
    issueDate: ['', Validators.required]
  });
}

openAddCertificateModal() {
  this.editingCertificate = null;
  this.certificateForm.reset();
  this.isCertificateModalOpen = true;
}

openEditCertificateModal(certificate: Certificate) {
  this.editingCertificate = certificate;
  this.certificateForm.patchValue({
    name: certificate.name,
    issuer: certificate.issuer,
    issueDate: new Date(certificate.issueDate).toISOString().split('T')[0]
  });
  this.isCertificateModalOpen = true;
}

closeCertificateModal() {
  this.isCertificateModalOpen = false;
  this.editingCertificate = null;
  this.certificateForm.reset();
}

submitCertificate() {
  if (this.certificateForm.valid) {
    const certificateData: Omit<Certificate, 'id'> = this.certificateForm.value;

    if (this.editingCertificate) {
      this.updateCertificate(this.editingCertificate.id, certificateData);
    } else {
      this.addCertificate(certificateData);
    }
  }
}

private addCertificate(certificateData: Omit<Certificate, 'id'>) {
  this.certificatservice.addCertificate(certificateData)
    .subscribe({
      next: () => {
        this.loadCertificates();
        this.closeCertificateModal();
        ////this.calculateProfileCompletion();
        this.toastr.success('Certificate added successfully');
      },
      error: (error) => {
        this.toastr.error('Failed to add certificate');
        console.error('Error adding certificate:', error);
      }
    });
}

private updateCertificate(id: number, certificateData: Omit<Certificate, 'id'>) {
  this.certificatservice.updateCertificate(id, certificateData)
    .subscribe({
      next: () => {
        this.loadCertificates();
        this.closeCertificateModal();

        this.toastr.success('Certificate updated successfully');
      },
      error: (error) => {
        this.toastr.error('Failed to update certificate');
        console.error('Error updating certificate:', error);
      }
    });
}

deleteCertificate(id: number) {
  if (confirm('Are you sure you want to delete this certificate?')) {
    this.certificatservice.deleteCertificate(id)
      .subscribe({
        next: () => {
          this.loadCertificates();
          ////this.calculateProfileCompletion();
          this.toastr.success('Certificate deleted successfully');
        },
        error: (error) => {
          this.toastr.error('Failed to delete certificate');
          console.error('Error deleting certificate:', error);
        }
      });
  }
}

private loadCertificates() {
  this.certificatservice.getCertificateByUserName(this.profile.userName)
    .subscribe({
      next: (response: any) => {
        this.userCertificates = response;

        this.calculateProfileCompletion();

      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.toastr.error('Failed to load certificates');
      }
    });


    this.calculateProfileCompletion()
}
 //#endregion


//#region portofolio project

  isProjectModalOpen: boolean = false;
  projectForm!: FormGroup;
  selectedProjectImages: File[] = [];
  imagePreviewUrls: string[] = [];
  userPortfolioproject:freelancerportofolioprojects=[]
  editingProject: freelancerportofolioproject | null = null;
  projectimagesurl:string=projectImages.filesUrl;
  loadPortofolioProjects(){

  this.portfolioprojectservice.getMyPortfolioProjects().subscribe(
    {
      next:(data) =>{
        console.log("got hereeeee")
          this.userPortfolioproject = data
          console.log(data);
          data.forEach(project => {
            if (project.images?.length > 1) {
              this.startCarouselInterval(project);
            }
          });
          this.toastr.success('Portofolioprojects loaded successfully');
          this.calculateProfileCompletion();

      } ,
      error:(err)=>{this.error=err
        console.log("got hereeeee")

        this.toastr.error('Error loading experiences');
      console.log(err)}
    }
  )
}
carouselIntervals: { [key: number]: any } = {};

private startCarouselInterval(project: any) {
  // Clear existing interval if any
  if (this.carouselIntervals[project.id]) {
    clearInterval(this.carouselIntervals[project.id]);
  }

  // Set new interval
  this.carouselIntervals[project.id] = setInterval(() => {
    // Create a mock event object for the carousel
    const mockEvent = new Event('autoplay');
    this.nextImage(project, mockEvent);
  }, 3000); // Change image every 3 seconds
}

private stopCarouselInterval(projectId: number) {
  if (this.carouselIntervals[projectId]) {
    clearInterval(this.carouselIntervals[projectId]);
    delete this.carouselIntervals[projectId];
  }
}

currentImageIndex: { [key: number]: number } = {};

nextImage(project: any, event: Event) {
  event.stopPropagation();
  if (!this.currentImageIndex[project.id]) {
    this.currentImageIndex[project.id] = 0;
  }
  this.currentImageIndex[project.id] =
    (this.currentImageIndex[project.id] + 1) % project.images.length;
  this.currentImageIndex = { ...this.currentImageIndex };

  // Reset the interval
  this.startCarouselInterval(project);
}

previousImage(project: any, event: Event) {
  event.stopPropagation();
  if (!this.currentImageIndex[project.id]) {
    this.currentImageIndex[project.id] = 0;
  }
  this.currentImageIndex[project.id] =
    (this.currentImageIndex[project.id] - 1 + project.images.length) % project.images.length;
  this.currentImageIndex = { ...this.currentImageIndex };

  // Reset the interval
  this.startCarouselInterval(project);
}
ngOnDestroy() {
  // Clear all intervals when component is destroyed
  Object.keys(this.carouselIntervals).forEach(projectId => {
    this.stopCarouselInterval(Number(projectId));
  });
}
private initProjectForm() {
  this.projectForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    createdAt: ['', Validators.required],
    images: []
  });
}

selectedFiles: File[] = [];

resetProjectForm() {
  this.initProjectForm();
  this.imagePreviewUrls = [];
  this.selectedFiles = [];
}
deleteProjectImage(id2:number)
{
  this.Portfolioprojectimageservice.deletePortfolioProjectImage(id2).subscribe({
    next: (response) => {
      // Remove the deleted image from the editingProject
      if (this.editingProject) {
        this.editingProject.images = this.editingProject.images.filter(img => img.id !== id2);
      }
      // Refresh the project list to reflect changes
      this.loadPortofolioProjects();
      this.toastr.success('Project image deleted successfully');
    },
    error: (error) => {
      console.error('Error deleting project image:', error);
      this.toastr.error('Failed to delete project image');
    }
  });
}
openAddProjectModal() {
  this.editingProject=null;
  this.isProjectModalOpen = true;
  this.projectForm.reset();
  this.selectedProjectImages = [];
  this.imagePreviewUrls = [];
}

closeProjectModal() {
  this.isProjectModalOpen = false;
}

onProjectImageSelected(event: any) {
  const files = event.target.files;
  if (files) {
    this.selectedFiles = Array.from(files);
    this.selectedProjectImages = Array.from(files);
    this.imagePreviewUrls = [];

    this.selectedProjectImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
        console.log("hiii");
      };
      reader.readAsDataURL(file);
    });
  }
}



deleteProject(projectId: number) {
  if (confirm('Are you sure you want to delete this project?')) {
    this.portfolioprojectservice.deletePortfolioProject(projectId).subscribe({
      next: () => {
        this.toastr.success('Project deleted successfully');
        ////this.calculateProfileCompletion();
        this.loadPortofolioProjects();
      },
      error: (error) => {
        this.toastr.error('Error deleting project');
        console.error(error);
      }
    });
  }
}

editProject(project: freelancerportofolioproject) {
  this.projectForm.patchValue({
    title: project.title,
    description: project.description,
    createdAt: new Date(project.createdAt).toISOString().split('T')[0]
  });

  this.imagePreviewUrls = project.images.map(img => img.image);
  this.isProjectModalOpen = true;
}
openEditProjectModal(project: freelancerportofolioproject) {
  this.editingProject = project;
  this.isProjectModalOpen = true;

  // Populate form with project data
  this.projectForm.patchValue({
    title: project.title,
    description: project.description,
    createdAt: new Date(project.createdAt).toISOString().split('T')[0]
  });

  // Set image previews
  this.imagePreviewUrls = project.images.map(img => img.image);
}

removeImage(index: number) {
  this.imagePreviewUrls.splice(index, 1);
  if (this.selectedProjectImages.length > index) {
    this.selectedProjectImages.splice(index, 1);
  }
}

submitProject() {
  if (this.projectForm.valid) {
    const formData = new FormData();

    formData.append('title', this.projectForm.get('title')?.value);
    formData.append('description', this.projectForm.get('description')?.value);
    formData.append('createdAt', this.projectForm.get('createdAt')?.value);
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('images', this.selectedFiles[i]);
      }
    }
    else{
      formData.append('images', JSON.stringify([]));
    }

    if (this.editingProject) {
      // Update existing project
      const updateData = {
        title: this.projectForm.get('title')?.value,
        description: this.projectForm.get('description')?.value,
        createdAt: this.projectForm.get('createdAt')?.value
      };
      this.portfolioprojectservice.updatePortfolioProject(this.editingProject.id,updateData)
      .subscribe({
        next: () => {
          this.toastr.success('Project updated successfully');
          this.loadPortofolioProjects();
          this.closeProjectModal();
          ////this.calculateProfileCompletion();
        },
        error: (error) => {
          this.toastr.error('Error updating project');
          console.error(error);
        }
      });
    } else {
      // Add new project
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      this.portfolioprojectservice.addPortfolioProject(formData).subscribe({
        next: () => {
          this.toastr.success('Project added successfully');
          this.loadPortofolioProjects();
          this.closeProjectModal();
          ////this.calculateProfileCompletion();
        },
        error: (error) => {
          this.toastr.error('Error adding project');
          console.error(error);
        }
      });
    }
  }
}
//#endregion

  //#region
userExperiences:Experience[]=[]
isExperienceModalOpen: boolean = false;
experienceForm!: FormGroup;
isLoadingExperience: boolean = false;
editingExperienceId: number | null = null;
isSubmitting: boolean = false;
  loadExperience(){
    if (!this.profile?.userName) {
      this.toastr.error('Unable to load experience: User profile not available');
      return;
    }
    console.log(this.profile.userName)
  this.experienceservice.getExperienceByUserName(this.profile.userName).subscribe(
    {
      next:(data:Experience[]) =>{

        this.userExperiences = data
        this.calculateProfileCompletion();
          this.toastr.success('Experiences loaded successfully');

      } ,
      error:(err)=>{this.error=err
        this.toastr.error('Error loading experiences');
        ////this.calculateProfileCompletion();
      console.log(err)}
    }
  )
}


addImageToProject(event: any, projectId: number) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const uploadObservables = Array.from(files).map(file =>
      this.Portfolioprojectimageservice.UploadImage(projectId, file as File)
    );

    // Wait for all uploads to complete
    forkJoin(uploadObservables).subscribe({
      next: (responses) => {
        this.toastr.success('All images uploaded successfully');
        this.loadPortofolioProjects(); // Reload after all uploads are complete
      },
      error: (error) => {
        this.toastr.error('Failed to upload one or more images');
        console.error('Error uploading images:', error);
      }
    });
  }
}
private initializeExperienceForm() {
  this.experienceForm = this.fb.group({
    jobTitle: ['', Validators.required],
    company: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    location: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });
}


openAddExperienceModal() {
  this.editingExperienceId = null;
  this.experienceForm.reset();
  this.isExperienceModalOpen = true;
}

openEditExperienceModal(experience: Experience) {
  this.editingExperienceId = experience.id??0;
  this.experienceForm.patchValue({
    jobTitle: experience.jobTitle,
    company: experience.company,
    startDate: new Date(experience.startDate).toISOString().split('T')[0],
    endDate: new Date(experience.endDate).toISOString().split('T')[0],
    location: experience.location,
    description: experience.description
  });
  this.isExperienceModalOpen = true;
}

closeExperienceModal() {
  this.isExperienceModalOpen = false;
  this.experienceForm.reset();
  this.editingExperienceId = null;
}

submitExperience() {
  if (this.experienceForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;
    const experienceData = {
      ...this.experienceForm.value,
      userName: this.profile.userName
    };

    const request$ = this.editingExperienceId
      ? this.experienceservice.updateExperience(this.editingExperienceId, experienceData)
      : this.experienceservice.addExperience(experienceData);

    request$.subscribe({
      next: () => {
        this.toastr.success(`Experience ${this.editingExperienceId ? 'updated' : 'added'} successfully`);
        this.loadExperience();
        this.closeExperienceModal();
        ////this.calculateProfileCompletion();
      },
      error: (error) => {
        this.toastr.error(`Failed to ${this.editingExperienceId ? 'update' : 'add'} experience`);
        console.error('Experience operation error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}

deleteExperience(experience: Experience) {
  if (confirm('Are you sure you want to delete this experience?')) {
    this.experienceservice.deleteExperience(experience.id??0).subscribe({
      next: () => {
        this.toastr.success('Experience deleted successfully');
        ////this.calculateProfileCompletion();
        this.loadExperience();
      },
      error: (error) => {
        this.toastr.error('Failed to delete experience');
        console.error('Error deleting experience:', error);
      }
    });
  }
}

validateDates() {
  const startDate = new Date(this.experienceForm.get('startDate')?.value);
  const endDate = new Date(this.experienceForm.get('endDate')?.value);

  if (startDate > endDate) {
    this.experienceForm.get('endDate')?.setErrors({ invalidDate: true });
  } else {
    this.experienceForm.get('endDate')?.setErrors(null);
  }
}
  //#endregion

  //#region Education
userEducation:Education|null=null;

loadEducation(){
  if (!this.profile?.userName) {
    this.toastr.error('Unable to load education: User profile not available');
    return;
  }

  console.log("loading educationnnnnnnnnnnnnnnnnnn");
  console.log(this.profile.userName)
this.educationservice.getEducationByUserName(this.profile.userName).subscribe(
  {
    next:(data:Education[]) =>{
      if (data && data.length > 0) {
        this.userEducation = data[0];
        this.calculateProfileCompletion();
        this.toastr.success('Education loaded successfully');

    }
      console.log(data);
    }
    ,
    error:(err)=>{this.error=err
    console.log(err)}
  }
)
}

isEducationModalOpen = false;
editMode = false;
educationForm!: FormGroup;
private initializeEducationForm() {
  this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      fieldOfStudy: ['', Validators.required],
      institution: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      grade: [''],
      description: ['']
  });
}


openAddEducationModal() {
  this.editMode = false;
  this.initializeEducationForm();
  this.isEducationModalOpen = true;
}

openEditEducationModal() {
  this.editMode = true;
  this.initializeEducationForm();

  this.educationForm.patchValue(this.userEducation || {});
  const startDate = this.userEducation?.startDate ? new Date(this.userEducation?.startDate) : new Date();
  const endDate = this.userEducation?.endDate ? new Date(this.userEducation?.endDate) : new Date();

  this.educationForm.patchValue({
    ...this.userEducation,
    startDate: this.formatDate(startDate),
    endDate: this.formatDate(endDate)
  });

  this.isEducationModalOpen = true;
}

private formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}
DeleteEducation(){
  this.educationservice.deleteEducation(this.userEducation?.id??0).subscribe({
    next: () => {
        this.userEducation = null;
        this.calculateProfileCompletion();
        this.toastr.success('Education deleted successfully');
    },
    error: (error) => {
        this.toastr.error('Failed to delete education');
        console.error('Error deleting education:', error);
    }
})

}
closeEducationModal() {
  this.isEducationModalOpen = false;
  this.educationForm.reset();
}

submitEducation() {
    if (this.educationForm.invalid) {
        this.toastr.error('Please fill all required fields');
        return;
    }

    const educationData = this.educationForm.value;

    if (this.editMode) {
        this.educationservice.updateEducation(this.userEducation?.id??0,educationData).subscribe({
            next: (response) => {
                this.loadEducation();
                this.closeEducationModal();
                this.toastr.success('Education updated successfully');
            },
            error: (error) => {
                this.toastr.error('Error updating education');
                console.error(error);
            }
        });
    } else {
        this.educationservice.CreateEducation(educationData).subscribe({
            next: (response) => {
                this.userEducation = response;
                this.closeEducationModal();
                this.toastr.success('Education added successfully');
                this.calculateProfileCompletion();

            },
            error: (error) => {
                this.toastr.error('Error adding education');
                console.log(error);
            }
        });
    }
}
  //#endregion

  //#region My Custom Region
  picturesurl:string ="";
  // activeTab: string = 'wt-skills';
  activeTab: string = 'profile';


  profile!:AppUser
  error:string=""
  countries: Country[] = [];
  cities: City[] = [];
  filteredCities: City[] = [];
  freelancerskills:FreelancerSkill[]=[];
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  profileForm!: FormGroup;
  searchText: string = '';
  filteredSkills: Skill[] = [];

  userskills:FreelancerSkill[]=[]
  nonrecommendedskills:nonrecommendedSkill[]=[]
  allskills:Skill[]=[]
  private initializeNonrecommendedskills(){
    this.SkillService.getnonRecommendedUserSkills().subscribe(
      {

        next:(data)=>this.nonrecommendedskills=data,
        error:(error)=>this.error=error
      }
    )
  }
  private initializeskills()
  {
   this.SkillService.getSkills().subscribe(
      {
        next:(data)=>{this.allskills=data;
        //   this.allskills = this.allskills.filter(s =>
        //     !this.freelancerskills.some(fs => fs.skillName === s.name)
        // );
        //   console.log(data);
        },
        error:(error)=>{
          this.error=error;
        }

      }
    )
  }
  filterSkills() {
    if (!this.searchText.trim()) {
        this.filteredSkills = [];
        return;
    }

    this.filteredSkills = this.allskills.filter(skill =>
        skill.name.toLowerCase().includes(this.searchText.toLowerCase()) &&
        !this.freelancerskills.some(fs => fs.skillName === skill.name) &&
        !this.nonrecommendedskills.some(ns => ns.name === skill.name)
    );
}

addSkill(skillId: number): void {
  const skill: UserSkill = {
    id: skillId,
  };
  console.log("hiasdhoasdhioas")
  this.SkillService.createUserSkill(skill).subscribe({
    next: (response: UserSkill) => {
      console.log(response);
      const freelancerSkill: FreelancerSkill = {
        id: response.id,
        skillId:response.skillId!,
        skillName: response.skillName!,
        freelancerId: response.FreelancerId! // or whatever the appropriate value should be
      };
      this.toastr.success('Skill added successfully', 'Success');
      this.freelancerskills.push(freelancerSkill);
      this.filterSkills();
      this.searchText = '';
    },
    error: (error) => {
      console.log("hiasdhoasdhioas")
      console.error('Error adding skill:', error);
      this.toastr.error('Error adding skill', 'Error');

      this.error = error;
    }
  });
}
  private initializeForm() {
    this.profileForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      country: ['', [Validators.required]],
      city: ['', [Validators.required]],
      UserName: ['', [Validators.required]],
      Description: ['', [Validators.maxLength(500)]],
      DateOfBirth: ['', [Validators.required]],
      title:[''],
      PhoneNumber: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern(/^[0-9]*$/)
      ]],
      Password: ['', [Validators.required]],
      ConfirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('Password')?.value;
    const confirmPassword = g.get('ConfirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }
  activateTab(tabId: string) {
    this.activeTab = tabId;
    this.router.navigate([], { fragment: tabId });
  }


  loadCountries() {
    this.Countryservice.getCountries().subscribe(
      (data: Country[]) => {
        this.countries = data;
      }
    );
  }

  loadCities() {
    this.CityService.getCitiess().subscribe(
      (data: City[]) => {
        this.cities = data;
        // Filter cities based on user's country
        if (this.profile.country) {
          const selectedCountry = this.countries.find(c => c.name === this.profile.country);
          console.log(selectedCountry);
          if (selectedCountry) {
            this.filteredCities = this.cities.filter(
              city => city.countryname === selectedCountry.name
            );
          }
        }
      }
    );
  }
  loadProfile() {
    this.account.myPorfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.profileForm.patchValue({
          firstname: data.firstname,
          lastname: data.lastname,
          country: data.country,
          city: data.city,
          UserName: data.userName,
          Description: data.description,
          DateOfBirth: data.dateOfBirth,
          PhoneNumber: data.phoneNumber,
          title: data.title
        });


          this.loadCities();
          this.loadEducation();
          this.loadBiddingProjects();
          if(this.profile.role==='Freelancer') {
          this.loadExperience();
          this.loadPortofolioProjects();
          this.loadCertificates();
          this.loadLanguages();

          this.calculateProfileCompletion();
          }

      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.error=error;
      }
    }
    );



        this.SkillService.getUserSkills().subscribe(
          {
            next: (data) => {
        console.log(data);
        this.freelancerskills=data;
      },
      error: (error) => {
        console.error('Error fetching user skills:', error);
        // Handle error - maybe show a notification to user
      },
      complete: () => {
        // Optional: Handle completion
      }
    }
        )

  }
  onCountryChange() {
    this.filterCities();




    console.log(this.profileForm.get('city')?.value,"formcity")
    console.log(this.profile.city,"city")
    const selectedCity = this.cities.find(c => c.name === this.profileForm.get('city')?.value);
    console.log(selectedCity,"selectedcity")
  }


  onCityChange(value: string) {
    console.log(value, 'selected city');
    this.profileForm.patchValue({
        city: value
    }, { emitEvent: true });

    console.log(this.profileForm.get('city')?.value,"formcity")
}
  filterCities() {
    if (!this.profile.country) {
      this.filteredCities = [];
      return;
    }

    const selectedCountry = this.countries.find(c => c.name === this.profileForm.get('country')?.value);


    if (selectedCountry) {
      this.filteredCities = this.cities.filter(
        city => city.countryname === selectedCountry.name
      );
      if (this.filteredCities.length > 0) {
        this.profile.city = this.filteredCities[0].name;

      }
      this.profileForm.patchValue({
        city: this.profile.city
    }, { emitEvent: true });
    }

  }

  onProfilePictureChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        this.selectedFile = file;
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.previewUrl = e.target.result;
            // Force change detection if needed
            this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
    } else if (file) {
        this.toastr.error('Please select a valid image file', 'Invalid File');
    }
}
//skills
newSkill: number = 0;

deleteSkill(userskillId: number): void {
  console.log(userskillId);
  this.SkillService.deleteUserSkill(userskillId).subscribe({
    next: () => {
      this.freelancerskills = this.freelancerskills.filter(skill => skill.id !== userskillId);
      this.toastr.success('Skill removed successfully', 'Success');
    },
    error: (error) => {
      this.toastr.error('Error removing skill', 'Error');
      console.error('Error deleting skill:', error);
    }
  });
}

addNewSkill(): void {
  // if (this.newSkill) {
  //   this.SkillService.addUserSkill(this.newSkill).subscribe({
  //     next: (response: any) => {
  //       this.freelancerskills.push(response);
  //       this.newSkill = 0;
  //     },
  //     error: (error) => {
  //       console.error('Error adding skill:', error);
  //     }
  //   });
  // }
}


addNonRecommendedSkill(skillName: string): void {

  this.SkillService.CreatenonRecommendedUserSkills(skillName).subscribe({
    next: (response: nonrecommendedSkill) => {

      this.nonrecommendedskills.push(response);
      this.searchText = '';
      this.filterSkills();
      this.toastr.success('Custom skill added successfully', 'Success');
    },
    error: (error) => {
      console.error('Error adding non-recommended skill:', error);
      this.toastr.error('Error adding custom skill', 'Error');
      this.error = error;
    }
  });
}


password: string = '';
onSubmit() {
  if (this.profileForm.invalid) {
    this.markFormGroupTouched(this.profileForm);
    this.toastr.error('Please check all required fields', 'Form Error');
    return;
  }

  console.log(this.profileForm.get('city')?.value,"formcity")
  console.log(this.profile.city,"city")
  const selectedCity = this.cities.find(c => c.name === this.profileForm.get('city')?.value);
  console.log(selectedCity,"selectedcity")

  const profileDto: EditProfileDTO = {
    firstname: this.profileForm.get('firstname')?.value,
    lastname: this.profileForm.get('lastname')?.value,
    title:this.profileForm.get('title')?.value,
    CityId: selectedCity?.id || 0,
    UserName: this.profileForm.get('UserName')?.value,
    Description: this.profileForm.get('Description')?.value,
    DateOfBirth: new Date(this.profileForm.get('DateOfBirth')?.value),
    PhoneNumber: this.profileForm.get('PhoneNumber')?.value,
    Password: this.profileForm.get('Password')?.value,
    ConfirmPassword: this.profileForm.get('Password')?.value,
    ProfilePicture: this.selectedFile
  };

  // Age validation
  const age = this.calculateAge(profileDto.DateOfBirth);
  if (age < 18 || age > 100) {
    this.error = "Age must be between 18 and 100";
    return;
  }

  this.account.EditProfile(profileDto).subscribe({
    next: (response) => {
      console.log('Profile updated successfully');
      this.toastr.success('Profile updated successfully', 'Success');
      this.loadProfile();
      this.profileForm.get('Password')?.reset();
      this.profileForm.get('ConfirmPassword')?.reset();
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      this.toastr.error(error, 'Error updating profile');
      this.error = error;
    }
  });
}

private markFormGroupTouched(formGroup: FormGroup) {
  Object.values(formGroup.controls).forEach(control => {
    control.markAsTouched();
    if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    }
  });
}

deletenonrecommendedSkill(id:number){

this.SkillService.DeletenonRecommendedUserSkills(id).subscribe({
  next: (response: string) => {

    this.nonrecommendedskills = this.nonrecommendedskills.filter(skill => skill.id !== id);
    this.searchText = '';
    this.filterSkills();
    this.toastr.success('Custom skill removed successfully', 'Success');
  },
  error: (error) => {
    console.error('Error removing non-recommended skill:', error);
    this.toastr.error('Error removing custom skill', 'Error');
    this.error = error;
  }
});
}
isVerificationModalOpen = false;
verificationData: IdentityVerificationRequest = {
  fullName: '',
  nationalId: '',
  idPicture: new File([], '')
};

openVerificationModal(): void {
  this.isVerificationModalOpen = true;
}

closeVerificationModal(): void {
  this.isVerificationModalOpen = false;
  this.verificationData = {
    fullName: '',
    nationalId: '',
    idPicture: new File([], '')
  };
}

onIdPictureSelected(event: any): void {
  if (event.target.files && event.target.files[0]) {
    this.verificationData.idPicture = event.target.files[0];
  }
}

submitVerification(): void {
  this.account.RequestIdentityVerification(this.verificationData).subscribe({
    next: (response) => {
      // Handle success
      this.profile.nationalId="dummystring";
      this.closeVerificationModal();
      // Show success message
      this.toastr.success('Verification request submitted successfully', 'Success');
    },
    error: (error) => {
      // Handle error
      console.error('Error submitting verification:', error);
      this.toastr.error('Error submitting verification request', 'Error');
    }
  });
}

// isVerificationEmailSending: boolean = false;


ToggleAvailability()
{
  this.account.ToggleAvailability().subscribe(
    {
      next:(data)=>{console.log(data),
        this.toastr.success(
          this.profile.isAvailable ? 'You are now available for work' : 'You are now unavailable for work',
          'Status Updated'
      );
      },
      error:(err)=> {
        this.toastr.error('Error updating availability status', 'Error');
        this.error = err;
    }
    }
  )
}

// // Add this method to your class
// sendVerificationEmail(): void {
//   this.isVerificationEmailSending = true;
//   this.account.sendVerificationEmail().subscribe({
//     next: () => {
//       this.isVerificationEmailSending = false;
//       // Optional: Show success message
//     },
//     error: (error) => {
//       this.isVerificationEmailSending = false;
//       this.error = error;
//     }
//   });
// }
  private calculateAge(birthDate: Date): number {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
      }

      return age;
  }



    setActiveTab(tab: string) {
        this.activeTab = tab;
    }
    //#endregion
//#endregion

}
