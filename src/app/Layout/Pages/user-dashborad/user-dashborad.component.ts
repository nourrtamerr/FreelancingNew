
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { ProposalService } from '../../../Shared/Services/Proposal/proposal.service';
import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';

import { MilestoneService } from '../../../Shared/Services/Milestone/milestone.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { FixedPriceProject, ProjectsResponse } from '../../../Shared/Interfaces/FixedPriceProject';
import { Certificate } from '../../../Shared/Interfaces/certificate';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetAll, BiddingProjectsResponse } from '../../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { ProjectsService } from '../../../Shared/Services/Projects/projects.service';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './user-dashborad.component.html',
  styleUrls: ['./user-dashborad.component.css']
})
export class UserDashboradComponent implements OnInit {
  lastUpdated: Date = new Date();
  isLoading = {
    users: true,
    projects: true,
    proposals: true,
    certificates: true,
    revenue: true
  };

  hasError = {
    users: false,
    projects: false,
    proposals: false,
    certificates: false,
    revenue: false
  };

  userCounts = {
    clients: 0,
  };

  projectStats = {
    total: 0,
    completed: 0,
    Working :0,
    Bidding :0,
    Fixed:0
  };

  proposalStats = {
    total: 0,
    averagePerProject: 0
  };

  pendingCertificates = 0;



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
    labels: ['Working', 'Completed'],
    datasets: [{
      data: [],
      backgroundColor: ['#4CAF50','#4BC0C0']
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
    private projectService: FixedPriceProjectService,
    private proposalService: ProposalService,
    private certificateService: CertificateService,
    private toastr: ToastrService,
    // private biddingProjectService: BiddingProjectService,
    private cdr: ChangeDetectorRef,
    private projectcount:ProjectsService,
    private auth:AuthService
  ) {}

  total: number = 0;

  ngOnInit(): void {
    this.lastUpdated = new Date();
    this.loadDashboardData();
   
  }

  loadDashboardData(): void {
    forkJoin([
      this.loadUserStatistics(),
      this.loadProjectStatistics(),
      this.loadProposalStatistics(),
      this.loadCertificateStatistics(),
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
    console.log('started loading google statistics');
    return this.projectcount.getclientsnumber().pipe(
      map((response: any) => {
        console.log('User Counts Response:', response);
        this.userCounts.clients = response.clients || 0;
        this.projectStats.completed = response.completed || 0; // there is a problem here in binding with html
        this.projectStats.Working = response.Working || 0;
        console.log('working is like that after it',response)
        // this.projectStats.total = response.Working + response.completed || 0;
        this.cdr.detectChanges();
      }));
  }

  private loadProjectStatistics(): Observable<void> {
    this.isLoading.projects = true;
    this.hasError.projects = false;

    const fixedProjects$ = this.projectcount.MyProjects().subscribe({
      next: (data: any) => {
        this.total = data.length;
        let pending = 0;
        let completed = 0;
        let Working = 0;
        let Bidding=0;
        let Fixed=0;
        console.log('userprojectsare',data);
        data.forEach((project: any) => {
          if (project.status === "Working") Working++;
          else if (project.status === "Pending") pending++;
          else completed++;

          if(project.projectType=="bidding") Bidding++;
          else Fixed++;
        });
    
        this.projectStats = {
          total: this.total,
          completed,
          Working,
          Bidding,
          Fixed
        };
    
        this.projectStatusChartData = {
          ...this.projectStatusChartData,
          datasets: [{
            ...this.projectStatusChartData.datasets[0],
            data: [completed ,Working]
          }]
        };
    
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.hasError.projects = true;
        this.toastr.error('Failed to load project statistics');
        this.projectStats = { total: 0, completed: 0, Working: 0, Bidding:0,Fixed:0 };
        this.projectStatusChartData = {
          ...this.projectStatusChartData,
          datasets: [{ ...this.projectStatusChartData.datasets[0], data: [0, 0, 0] }]
        };
        this.cdr.detectChanges();
      }
    });
    

    return new Observable<void>;

    
  }

  private loadProposalStatistics(): Observable<void> {
    this.isLoading.proposals = true;
    this.hasError.proposals = false;
    let freelancerId = this.auth.getRole();
    return this.proposalService.Getproposalbyfreelancerid().pipe(
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
    return this.certificateService.getfreelancerCertificate().pipe(
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

  private loadRevenueData(): Observable<void> {
    this.isLoading.revenue = true;
    this.hasError.revenue = false;

    const fixedProjects$ = this.projectcount.MyProjects().subscribe({
      next: (data: any) => {
        console.log(data);
        const monthlyRevenue = new Map<string, number>();
        data.forEach((project:any) => {
          project.milestones.forEach((milestone:any) => {
            const month = new Date(milestone.startdate).toLocaleString('default', { month: 'short', year: 'numeric' });
            const revenue = monthlyRevenue.get(month) || 0;
            monthlyRevenue.set(month, revenue + milestone.amount);
          });
        });
        console.log(monthlyRevenue);
    
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
      },
      error: (err) => {
        this.hasError.projects = true;
        this.toastr.error('Failed to load project statistics');
        this.projectStats = { total: 0, completed: 0, Working: 0, Bidding:0,Fixed:0 };
        this.projectStatusChartData = {
          ...this.projectStatusChartData,
          datasets: [{ ...this.projectStatusChartData.datasets[0], data: [0, 0, 0] }]
        };
        this.cdr.detectChanges();
      }
    });
    

    return new Observable<void>;

    
  }
}
