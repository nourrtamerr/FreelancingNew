import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../../Shared/Services/Proposal/proposal.service';
import { ProposalsView } from '../../../Shared/Interfaces/Proposal';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Environment, Files } from '../../../base/environment';

@Component({
  selector: 'app-my-proposals',
  imports: [CommonModule,RouterModule],
  templateUrl: './my-proposals.component.html',
  styleUrl: './my-proposals.component.css'
})
export class MyProposalsComponent implements OnInit {
  proposals: ProposalsView = [];
  loading: boolean = false;
  error: string = '';
  Filesurl=Files.filesUrl;

  constructor(private proposalService: ProposalService) {}

  ngOnInit() {
    this.loadProposals();
  }

  loadProposals() {
    this.loading = true;
    this.proposalService.Getproposalbyfreelancerid().subscribe({
      next: (response) => {
        this.proposals = response;
        console.log(this.proposals)
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load proposals';
        this.loading = false;
        console.error('Error loading proposals:', err);
      }
    });
  }
}
