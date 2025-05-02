import { Component } from '@angular/core';
import { BiddingProjectService } from '../../Shared/Services/BiddingProject/bidding-project.service';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { FixedPriceProjectService } from '../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { ProposalService } from '../../Shared/Services/Proposal/proposal.service';
import { CreateProposalDTO, CreateSuggestedMilestoneDTO, ProjectType } from '../../Shared/Interfaces/Proposal';
import { FormsModule, NgForm } from '@angular/forms';
import { TimeAgoPipe } from '../../Pipes/time-ago.pipe';
import { CommonModule } from '@angular/common';
import { TimeLeftPipe } from '../../Pipes/time-left.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-proposal2',
  standalone: true,
  imports: [RouterModule, RouterOutlet, TimeAgoPipe, FormsModule, CommonModule, TimeLeftPipe],
  templateUrl: './proposal2.component.html',
  styleUrls: ['./proposal2.component.css']
})
export class Proposal2Component {
  proposal: CreateProposalDTO = {
    coverLetter: '',
    projectId: 0,
    suggestedMilestones: [this.createEmptyMilestone()],
    type: ProjectType.Bidding
  };

  project: any;
  projectType: string = '';
  isSubmitting: boolean = false;
  formErrors: any = {};
  formSubmitted: boolean = false;

  constructor(
    private biddingProjectDetailsService: BiddingProjectService,
    private route: ActivatedRoute,
    private fixedPriceService: FixedPriceProjectService,
    private proposalService: ProposalService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = +params.get('id')!;
      this.proposal.projectId = id;
      this.loadProjectDetails(id);
    });
  }

  private loadProjectDetails(id: number): void {
    this.biddingProjectDetailsService.GetBiddingProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.proposal.projectId = data.id;
        this.projectType = 'Bidding';
        this.proposal.type = ProjectType.Bidding;
      },
      error: (err) => {
        this.fixedPriceService.getProjectById(id).subscribe({
          next: (data) => {
            this.project = data;
            this.proposal.projectId = data.id;
            this.projectType = 'Fixed Price';
            this.proposal.type = ProjectType.FixedPrice;
          },
          error: (err) => {
            this.toastr.error('Failed to load project details', 'Error');
            console.error(err);
          }
        });
      }
    });
  }

  private createEmptyMilestone(): CreateSuggestedMilestoneDTO {
    return {
      title: '',
      description: '',
      amount: 0,
      duration: 0
    };
  }

  addMilestone(): void {
    if (!this.isCurrentMilestoneValid()) {
      this.toastr.warning('Please complete all fields in the current milestone before adding a new one', 'Incomplete Milestone');
      this.markCurrentMilestoneAsTouched();
      return;
    }
    
    this.proposal.suggestedMilestones.push(this.createEmptyMilestone());
    this.clearMilestoneErrors();
  }

  private markCurrentMilestoneAsTouched(): void {
    const lastIndex = this.proposal.suggestedMilestones.length - 1;
    this.formErrors[`milestone_${lastIndex}_title`] = this.formErrors[`milestone_${lastIndex}_title`] || '';
    this.formErrors[`milestone_${lastIndex}_description`] = this.formErrors[`milestone_${lastIndex}_description`] || '';
    this.formErrors[`milestone_${lastIndex}_amount`] = this.formErrors[`milestone_${lastIndex}_amount`] || '';
    this.formErrors[`milestone_${lastIndex}_duration`] = this.formErrors[`milestone_${lastIndex}_duration`] || '';
  }

  removeMilestone(index: number): void {
    if (index > 0 && this.proposal.suggestedMilestones.length > 1) {
      this.proposal.suggestedMilestones.splice(index, 1);
      this.clearMilestoneErrors();
    }
  }

  isCurrentMilestoneValid(): boolean {
    const lastMilestone = this.proposal.suggestedMilestones[this.proposal.suggestedMilestones.length - 1];
    return lastMilestone.title.trim() !== '' && 
           lastMilestone.description.trim() !== '' &&
           lastMilestone.amount > 0 &&
           lastMilestone.duration > 0;
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validate cover letter
    if (!this.proposal.coverLetter.trim()) {
      this.formErrors.coverLetter = 'Cover letter is required';
      isValid = false;
    }

    // Validate milestones
    this.proposal.suggestedMilestones.forEach((milestone, index) => {
      if (!milestone.title.trim()) {
        this.formErrors[`milestone_${index}_title`] = 'Title is required';
        isValid = false;
      }
      if (!milestone.description.trim()) {
        this.formErrors[`milestone_${index}_description`] = 'Description is required';
        isValid = false;
      }
      if (!milestone.amount || milestone.amount <= 0) {
        this.formErrors[`milestone_${index}_amount`] = 'Amount must be greater than 0';
        isValid = false;
      }
      if (!milestone.duration || milestone.duration <= 0) {
        this.formErrors[`milestone_${index}_duration`] = 'Duration must be greater than 0';
        isValid = false;
      }
    });

    return isValid;
  }

  createProposal(form: NgForm): void {
    this.formSubmitted = true;
    
    if (!this.validateForm()) {
      this.toastr.error('Please fill all required fields correctly', 'Form Errors');
      return;
    }
  
    this.isSubmitting = true;
    
    this.proposalService.CreateProposal(this.proposal).subscribe({
      next: (data) => {
        this.isSubmitting = false;
        this.toastr.success('Proposal submitted successfully!', 'Success');
        // Optionally navigate away or reset form
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMessage = err.error?.message || 'Failed to submit proposal. Please try again.';
        this.toastr.error(errorMessage, 'Submission Error');
        console.error('Submission error:', err);
      }
    });
  }

  clearMilestoneErrors(): void {
    this.formErrors.milestone = {};
  }

  hasError(controlName: string, index?: number): boolean {
    if (this.formSubmitted || (index !== undefined && this.proposal.suggestedMilestones[index])) {
      if (index !== undefined) {
        return !!this.formErrors[`milestone_${index}_${controlName}`];
      }
      return !!this.formErrors[controlName];
    }
    return false;
  }

  getError(controlName: string, index?: number): string {
    if (index !== undefined) {
      return this.formErrors[`milestone_${index}_${controlName}`] || '';
    }
    return this.formErrors[controlName] || '';
  }
}