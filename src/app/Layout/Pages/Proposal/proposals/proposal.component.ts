import { Component } from '@angular/core';
import { ProposalService } from '../../../../Shared/Services/Proposal/proposal.service';
import { ProposalsView, ProposalView } from '../../../../Shared/Interfaces/Proposal';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Params, Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../../../Shared/Services/Projects/projects.service';
import { FixedPriceProjectById } from '../../../../Shared/Interfaces/FixedPriceProject';
import { AuthService } from '../../../../Shared/Services/Auth/auth.service';
import { BiddingProjectService } from '../../../../Shared/Services/BiddingProject/bidding-project.service';
import { RankEnum } from '../../../../Shared/Interfaces/Account';
import { Environment, Files } from '../../../../base/environment';


@Component({
  selector: 'app-proposal',
  imports: [CommonModule,RouterModule],
  templateUrl: './proposals.component.html',
  styleUrl: './proposals.component.css'
})
export class ProposalsComponent {
projectId: number = 0;
proposals: ProposalView[] = [];
proposalId: number = 0;
isowner:boolean=false;
role:string="";
project: any;
isBiddingStarted: boolean = false;

Files:string=Files.filesUrl;
isBidEnded:boolean=false;

ranks=RankEnum

currentFilter: string = 'All';
filteredProposals: ProposalView[] = [];
originalProposals: ProposalView[] = [];
currentSortOption: string = 'lastAdded';


  
  constructor(private proposalService:ProposalService, private route: ActivatedRoute,private router: Router,
    private projectService:ProjectsService,
    private authService:AuthService,
    private BiddingService: BiddingProjectService
  ) { }

  ngOnInit(): void
   {
   
    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      console.log('Project ID:', this.projectId);
      this.loadProposals();
      this.LoadProjectDetails();
    });

    

}
loadProposals(){
  this.proposalService.GetProposalsByprojectid(this.projectId).subscribe(
    (data) => {
      this.proposals = Array.isArray(data) ? data : [data];
      console.log('Proposal details loaded:', this.proposals);

      this.originalProposals = [...this.proposals];
      this.filteredProposals = [...this.proposals];
    },
    (error) => {
      console.error('Error loading proposals:', error);
    }
  );


 
  }
  getprojectById(proposalId: number) {
    this.router.navigate(['/proposaldetails', proposalId]);
    console.log('Navigating to project details for ID:', this.proposalId);
  }

  isEligibleToApply: boolean = false;

  LoadProjectDetails(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        console.log('Project details:', data);

        if (this.project && this.project.projectType && 
            this.project.projectType.toLowerCase() === 'bidding') {
          
          // Load bidding project details to get bidding dates
          this.BiddingService.GetBiddingProjectById(this.projectId).subscribe({
            next: (biddingData) => {
              // Update project with bidding-specific data
              this.project = {...this.project, ...biddingData};
              
              // Now check bidding start date
              if (this.project.biddingStartDate) {
                const biddingStartDate = new Date(this.project.biddingStartDate);
                const currentDate = new Date();
                this.isBiddingStarted = currentDate >= biddingStartDate;
                console.log('Is bidding started:', this.isBiddingStarted);
              }
              
              // Check if bidding has ended
              if (this.project.biddingEndDate) {
                this.isBidEnded = new Date(this.project.biddingEndDate) < new Date();
                console.log('Bid End Date Passed:', this.isBidEnded);
              }
            },
            error: (error) => {
              console.error('Error fetching bidding project details:', error);
            }
          });
        }

        if (this.project?.clientId) {
          // Fix the condition - you're missing an if statement here
          if (this.authService.getUserId() == this.project.clientId) {
            this.isowner = true;
          }
          
          const roles = this.authService.getRoles();
          this.role = roles?.includes("Freelancer") ? "Freelancer" : 
                     roles?.includes("Client") ? "Client" : 
                     roles?.includes("Admin") ? "Admin" : "";
          console.log(this.role);
        }
      },
      error: (error) => {
        console.error('Error fetching project details:', error);
      }
    });
  }


  
  private calculateEligibility(): void {
    const isFreelancer = this.role === 'Freelancer';
    const isProjectAvailable = this.project?.freelancerId === null;
    
    if (this.project?.projectType === 'Bidding') {
      this.isEligibleToApply = isFreelancer && 
                             isProjectAvailable && 
                             this.isBiddingStarted && 
                             !this.isBidEnded;
    } else if (this.project?.projectType === 'Fixed') {
      this.isEligibleToApply = isFreelancer && isProjectAvailable;
    } else {
      this.isEligibleToApply = false;
    }
  }
  
  isBidEndDatePassed(): void {
    if(this.project.projectType=='Bidding'){
      this.BiddingService.GetBiddingProjectById(this.projectId).subscribe({
        next: (data) => {
          if( new Date(data.biddingEndDate) < new Date() ){
            this.isBidEnded=true;
            console.log('Bid End Date Passed:', this.isBidEnded);
          }
          this.project = data;
          console.log('Project details:', data);
          console.log('Bid End Date Passed:', this.isBidEnded);

          

        },
        error: (error) => {
          console.error('Error fetching project details:', error);
          console.log('Bid End Date Passed:', this.isBidEnded);

          
        }
      });
    }

    // if (!this.project?.biddingEndDate) return false;
    // return new Date(this.project.biddingEndDate) < new Date();
  }


  filterProposals(status: string) {
    this.currentFilter = status;
    
    if (status === 'All') {
      this.filteredProposals = [...this.originalProposals];
    } else {
      this.filteredProposals = this.originalProposals.filter(
        proposal => proposal.proposalStatus.toString() === status
      );
    }
    
    // Re-apply current sort after filtering
    this.applySorting(this.currentSortOption);
  }
  
  // Sort proposals
  sortProposals(event: any) {
    const sortOption = event.target.value;
    this.currentSortOption = sortOption;
    this.applySorting(sortOption);
  }
  
  // Apply sorting logic
  applySorting(sortOption: string) {
    switch (sortOption) {
      case 'priceLow':
        this.filteredProposals.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        this.filteredProposals.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        this.filteredProposals.sort((a, b) => a.suggestedDuration - b.suggestedDuration);
        break;
      case 'lastAdded':
      default:
        // Assuming the proposals are already sorted by last added in the original array
        // If you have a timestamp or ID that indicates order, use that instead
        this.filteredProposals = [...this.filteredProposals];
        break;
    }
  }
  
  // Count methods for proposal statuses
  getPendingCount(): number {
    return this.originalProposals.filter(p => p.proposalStatus.toString() === 'Pending').length;
  }
  
  getAcceptedCount(): number {
    return this.originalProposals.filter(p => p.proposalStatus.toString() === 'Accepted').length;
  }
  
  getRejectedCount(): number {
    return this.originalProposals.filter(p => p.proposalStatus.toString() === 'Rejected').length;
  }

  // isBiddingExpired(): boolean {
  //   return new Date(this.project.biddingEndDate) < new Date();
  // }
 
}


