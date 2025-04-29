import { Component } from '@angular/core';
import { ProposalService } from '../../../../Shared/Services/Proposal/proposal.service';
import { ProposalsView, ProposalView } from '../../../../Shared/Interfaces/Proposal';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Params, Router } from '@angular/router';


@Component({
  selector: 'app-proposal',
  imports: [CommonModule],
  templateUrl: './proposals.component.html',
  styleUrl: './proposals.component.css'
})
export class ProposalsComponent {
projectId: number = 0;
proposals: ProposalView[] = [];
proposalId: number = 0;
  
  constructor(private proposalService:ProposalService, private route: ActivatedRoute,private router: Router) { }

  ngOnInit(): void
   {
   
    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      console.log('Project ID:', this.projectId);
      this.loadProposals();
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
 
}


