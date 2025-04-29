import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { ProposalService } from '../../../Shared/Services/Proposal/proposal.service';
import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { FreelancerlanguageService } from '../../../Shared/Services/FreelancerLanguages/freelancerlanguage.service';
import { MilestoneService } from '../../../Shared/Services/Milestone/milestone.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { AppUsers } from '../../../Shared/Interfaces/Account';
import { FixedPriceProject, ProjectsResponse } from '../../../Shared/Interfaces/FixedPriceProject';
import { Certificate } from '../../../Shared/Interfaces/certificate';
import { Skill } from '../../../Shared/Interfaces/Skill';
import { FreelancerLanguage } from '../../../Shared/Interfaces/freelancer-language';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetAll, BiddingProjectsResponse } from '../../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { UserSkill } from '../../../Shared/Interfaces/UserSkill';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  lastUpdated: Date = new Date();
  isLoading = {
    users: true,
    projects: true,
    proposals: true,
    certificates: true,
    skills: true,
    languages: true,
    revenue: true
  };

  hasError = {
    users: false,
    projects: false,
    proposals: false,
    certificates: false,
    skills: false,
    languages: false,
    revenue: false
  };

  userCounts = {
    clients: 0,
    freelancers: 0,
    admins: 0
  };

  projectStats = {
    total: 0,
    pending: 0,
    completed: 0,
    Working :0,
  };

  proposalStats = {
    total: 0,
    averagePerProject: 0
  };

  pendingCertificates = 0;

  topSkills: { name: string; count: number }[] = [];

  languageDistribution: { language: string; count: number }[] = [];

  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Revenue',
      fill: true,
      tension: 0.5,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.3)'
    }]
  };

  projectStatusChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Pending', 'Working', 'Completed'],
    datasets: [{
      data: [],
      backgroundColor: ['#FFA500', '#4CAF50','#4BC0C0']
    }]
  };

  languageChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Monthly Revenue'
      }
    }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Project Status Distribution'
      }
    }
  };

  constructor(
    private accountService: AccountService,
    private projectService: FixedPriceProjectService,
    private proposalService: ProposalService,
    private certificateService: CertificateService,
    private skillService: SkillService,
    private languageService: FreelancerlanguageService,
    private toastr: ToastrService,
    private biddingProjectService: BiddingProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  total: number = 0;

  ngOnInit(): void {
    this.lastUpdated = new Date();
    this.loadDashboardData();
    this.skillService.getUserSkillsForAdmin().subscribe((skills: UserSkill[]) => {
      console.log('Skills:', skills);
    });
    this.biddingProjectService.GetAllBiddingProjects({},10,10).subscribe((bidding:any)=>{
        console.log('Bidding' , bidding)
    } )
  }

  loadDashboardData(): void {
    forkJoin([
      this.loadUserStatistics(),
      this.loadProjectStatistics(),
      this.loadProposalStatistics(),
      this.loadCertificateStatistics(),
      this.loadTopSkills(),
      this.loadLanguageDistribution(),
      this.loadRevenueData()
    ]).subscribe({
      next: () => {
        this.proposalStats = {
          ...this.proposalStats,
          averagePerProject: this.projectStats.total > 0 ? this.proposalStats.total / this.projectStats.total : 0
        };
        this.cdr.detectChanges();
        this.toastr.success('Dashboard data loaded successfully');
      },
      error: (error) => {
        this.toastr.error('Error loading dashboard data');
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  private loadUserStatistics(): Observable<void> {
    this.isLoading.users = true;
    this.hasError.users = false;
    return this.accountService.getUsers().pipe(
      map((response: AppUsers) => {
        const clients = response?.filter(user => user.role === 'Client').length || 0;
        const freelancers = response?.filter(user => user.role === 'Freelancer').length || 0;
        const admins = response?.filter(user => user.role === 'Admin').length || 0;

        this.userCounts = {
          clients,
          freelancers,
          admins
        };
      }),
      catchError(error => {
        console.error('Error fetching user statistics:', error);
        this.hasError.users = true;
        this.toastr.error('Failed to load user statistics');
        return of(void 0);
      }),
      map(() => {
        this.isLoading.users = false;
      })
    );
  }

  private loadProjectStatistics(): Observable<void> {
    this.isLoading.projects = true;
    this.hasError.projects = false;

    const fixedProjects$ = this.projectService.getProjectsFixedDashBoard().pipe(
      map((response: ProjectsResponse) => {
        console.log('Fixed Projects Response:', response);
        return response.projects || [];
      }),
      catchError(error => {
        console.error('Error fetching fixed projects:', error);
        return of([] as FixedPriceProject[]);
      })
    );

    const biddingProjects$ = this.biddingProjectService.GetAllBiddingProjectsDashBoard({}, 10, 10).pipe(
      map((response: BiddingProjectsResponse) => {
        console.log('Bidding Projects Response:', response);
        return response.projects || [];
      }),
      catchError(error => {
        console.error('Error fetching bidding projects:', error);
        return of([] as BiddingProjectGetAll[]);
      })
    );

    return forkJoin([fixedProjects$, biddingProjects$]).pipe(
      map(([fixedProjects, biddingProjects]) => {
        let pending = 0;
        let completed = 0;
        let Working =0;

        fixedProjects.forEach(project => {
          const latestMilestone = project.milestones[project.milestones.length - 1];
          if (latestMilestone) {
            console.log('Fixed Project Milestone Status:', latestMilestone.status);
            const status = latestMilestone.status.toString().toLowerCase();
            if (status.includes('pending')) pending++;
            else if (status.includes('completed')) completed++;
            else if (status.includes('working')) Working++;
          }
        });

        // biddingProjects.forEach(project => {
        //   console.log('Bidding Project Status:', project.status);
        //   if (project.status) {
        //     const status = project.status.toString().toLowerCase();
        //     if (status.includes('pending')) pending++;
        //     else if (status.includes('completed')) completed++;
        //     else if (status.includes('working')) Working++;
        //   } else {
        //     pending++;
        //   }
        // });

        this.total = fixedProjects.length + biddingProjects.length;

        this.projectStats = {
          total: this.total,
          pending,
          completed,
          Working
        };

        this.projectStatusChartData = {
          ...this.projectStatusChartData,
          datasets: [{
            ...this.projectStatusChartData.datasets[0],
            data: [pending, completed ,Working]
          }]
        };

        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error combining project statistics:', error);
        this.hasError.projects = true;
        this.toastr.error('Failed to load project statistics');
        this.projectStats = { total: 0, pending: 0, completed: 0 ,Working :0};
        this.projectStatusChartData = {
          ...this.projectStatusChartData,
          datasets: [{ ...this.projectStatusChartData.datasets[0], data: [0, 0] }]
        };
        this.cdr.detectChanges();
        return of(void 0);
      }),
      map(() => {
        this.isLoading.projects = false;
      })
    );
  }

  private loadProposalStatistics(): Observable<void> {
    this.isLoading.proposals = true;
    this.hasError.proposals = false;
    return this.proposalService.GetAllProposals().pipe(
      map(proposals => {
        console.log('Proposals Response:', proposals);
        this.proposalStats = {
          total: proposals.length,
          averagePerProject: 0
        };
        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error fetching proposals:', error);
        this.hasError.proposals = true;
        this.toastr.error('Failed to load proposal statistics');
        this.proposalStats = { total: 0, averagePerProject: 0 };
        return of(void 0);
      }),
      finalize(() => {
        this.isLoading.proposals = false;
      })
    );
  }

  private loadCertificateStatistics(): Observable<void> {
    this.isLoading.certificates = true;
    this.hasError.certificates = false;
    return this.certificateService.getAllCertificates().pipe(
      map((certificates: Certificate[]) => {
        this.pendingCertificates = certificates.length;
        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error fetching certificates:', error);
        this.hasError.certificates = true;
        this.toastr.error('Failed to load certificate statistics');
        this.pendingCertificates = 0;
        return of(void 0);
      }),
      map(() => {
        this.isLoading.certificates = false;
      })
    );
  }

  private loadTopSkills(): Observable<void> {
    this.isLoading.skills = true;
    this.hasError.skills = false;
    return this.skillService.getUserSkillsForAdmin().pipe(
      map((skills: UserSkill[]) => {
        const skillCounts = new Map<string, number>();
        skills.forEach(skill => {
          const count = skillCounts.get(skill.skillName??"") || 0;
          skillCounts.set(skill.skillName??"", count + 1);
        });
//changed
        this.topSkills = Array.from(skillCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error fetching skills:', error);
        this.hasError.skills = true;
        this.toastr.error('Failed to load top skills');
        this.topSkills = [];
        return of(void 0);
      }),
      map(() => {
        this.isLoading.skills = false;
      })
    );
  }

  private loadLanguageDistribution(): Observable<void> {
    this.isLoading.languages = true;
    this.hasError.languages = false;
    return this.languageService.getAllFreelancerLanguages().pipe(
      map((languages: FreelancerLanguage[]) => {
        console.log('Languages Response:', languages);
        const languageCounts = new Map<string, number>();
        languages.forEach(lang => {
          if (!lang.isDeleted) {
            const count = languageCounts.get(lang.language) || 0;
            languageCounts.set(lang.language, count + 1);
          }
        });

        this.languageDistribution = Array.from(languageCounts.entries())
          .map(([language, count]) => ({ language, count }));

        this.languageChartData = {
          ...this.languageChartData,
          labels: this.languageDistribution.map(l => l.language),
          datasets: [{
            ...this.languageChartData.datasets[0],
            data: this.languageDistribution.map(l => l.count)
          }]
        };

        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error fetching languages:', error);
        this.hasError.languages = true;
        this.toastr.error('Failed to load language distribution');
        this.languageDistribution = [];
        this.languageChartData = {
          ...this.languageChartData,
          labels: [],
          datasets: [{ ...this.languageChartData.datasets[0], data: [] }]
        };
        this.cdr.detectChanges();
        return of(void 0);
      }),
      map(() => {
        this.isLoading.languages = false;
      })
    );
  }

  private loadRevenueData(): Observable<void> {
    this.isLoading.revenue = true;
    this.hasError.revenue = false;

    const fixedProjects$ = this.projectService.getProjectsFixedDashBoard().pipe(
      map((response: ProjectsResponse) => {
        console.log('Fixed Projects Response (Revenue):', response);
        return response.projects || [];
      }),
      catchError(error => {
        console.error('Error fetching fixed projects for revenue:', error);
        return of([] as FixedPriceProject[]);
      })
    );

    const biddingProjects$ = this.biddingProjectService.GetAllBiddingProjectsDashBoard({}, 1, 10).pipe(
      map((response: BiddingProjectsResponse) => {
        console.log('Bidding Projects Response (Revenue):', response);
        return response.projects || [];
      }),
      catchError(error => {
        console.error('Error fetching bidding projects for revenue:', error);
        return of([] as BiddingProjectGetAll[]);
      })
    );

    return forkJoin([fixedProjects$, biddingProjects$]).pipe(
      map(([fixedProjects, biddingProjects]) => {
        const monthlyRevenue = new Map<string, number>();

        fixedProjects.forEach(project => {
          project.milestones.forEach(milestone => {
            const month = new Date(milestone.startdate).toLocaleString('default', { month: 'short', year: 'numeric' });
            const revenue = monthlyRevenue.get(month) || 0;
            monthlyRevenue.set(month, revenue + milestone.amount);
          });
        });

        // biddingProjects.forEach(project => {
        //   if (project.status && project.status.toLowerCase().includes('completed')) {
        //     const date = new Date(project.postedFrom);
        //     const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        //     const revenue = monthlyRevenue.get(month) || 0;
        //     monthlyRevenue.set(month, revenue + project.bidAveragePrice);
        //   }
        // });

        const sortedMonths = Array.from(monthlyRevenue.keys()).sort((a, b) => {
          const dateA = new Date(`01 ${a}`);
          const dateB = new Date(`01 ${b}`);
          return dateA.getTime() - dateB.getTime();
        });

        this.revenueChartData = {
          ...this.revenueChartData,
          labels: sortedMonths,
          datasets: [{
            ...this.revenueChartData.datasets[0],
            data: sortedMonths.map(month => monthlyRevenue.get(month) || 0)
          }]
        };

        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error combining revenue data:', error);
        this.hasError.revenue = true;
        this.toastr.error('Failed to load revenue data');
        this.revenueChartData = {
          ...this.revenueChartData,
          labels: [],
          datasets: [{ ...this.revenueChartData.datasets[0], data: [] }]
        };
        this.cdr.detectChanges();
        return of(void 0);
      }),
      map(() => {
        this.isLoading.revenue = false;
      })
    );
  }
}