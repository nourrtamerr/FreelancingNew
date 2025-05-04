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

  filteredProposals: ProposalsView = [];
  currentFilter: string = 'All';
  currentSortOption: string = 'lastAdded';

  constructor(private proposalService: ProposalService) {}

  ngOnInit() {
    this.loadProposals();
  }

  loadProposals() {
    this.loading = true;
    this.proposalService.Getproposalbyfreelancerid().subscribe({
      next: (response) => {
        this.proposals = response;
        this.filteredProposals = [...this.proposals];
        console.log(this.proposals)
        console.log('Proposals loaded successfully:', this.proposals);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading proposals:', err);
        this.error = err.message || 'Failed to load proposals. Please try again later.';
        this.loading = false;
      }
    });
  }


  filterProposals(status: string) {
    this.currentFilter = status;
    
    if (status === 'All') {
      this.filteredProposals = [...this.proposals];
    } else {
      this.filteredProposals = this.proposals.filter(
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

      default:  
        this.filteredProposals = [...this.filteredProposals];
        break;
    }
  }

  // Count methods for proposal statuses
  getPendingCount(): number {
    return this.proposals.filter(p => p.proposalStatus.toString() === 'Pending').length;
  }

  getAcceptedCount(): number {
    return this.proposals.filter(p => p.proposalStatus.toString() === 'Accepted').length;
  }

  getRejectedCount(): number {
    return this.proposals.filter(p => p.proposalStatus.toString() === 'Rejected').length;
  }



}
