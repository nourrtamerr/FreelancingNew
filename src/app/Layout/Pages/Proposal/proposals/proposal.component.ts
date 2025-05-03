import { Component } from '@angular/core';
import { ProposalService } from '../../../../Shared/Services/Proposal/proposal.service';
import { ProposalsView, ProposalView } from '../../../../Shared/Interfaces/Proposal';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Params, Router, RouterModule } from '@angular/router';
import { ProjectsService } from '../../../../Shared/Services/Projects/projects.service';
import { FixedPriceProjectById } from '../../../../Shared/Interfaces/FixedPriceProject';
import { AuthService } from '../../../../Shared/Services/Auth/auth.service';
import { BiddingProjectService } from '../../../../Shared/Services/BiddingProject/bidding-project.service';
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
Files:string=Files.filesUrl;
isBidEnded:boolean=false;


  
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




  LoadProjectDetails(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        console.log('Project details:', data);

    this.isBidEndDatePassed();



        if (this.project?.clientId) {
         
          this.authService.getUserId()==this.project.clientId
          {
            this.isowner=true;
          }
          const roles = this.authService.getRoles();
          this.role = roles?.includes("Freelancer") ? "Freelancer":roles?.includes("Client")? "Client" :roles?.includes("Admin")?"Admin": "";
          console.log(this.role);
        }


        
      },
      error: (error) => {
        console.error('Error fetching project details:', error);
      }
    });



    
  }

  
  isBidEndDatePassed(): void {
    if(this.project.projectType=='bidding'){
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

  // isBiddingExpired(): boolean {
  //   return new Date(this.project.biddingEndDate) < new Date();
  // }
 
}


