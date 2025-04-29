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

@Component({
  selector: 'app-proposal2',
  imports: [RouterModule,RouterOutlet, TimeAgoPipe, FormsModule, CommonModule, TimeLeftPipe],

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
  currentForm?: NgForm;


  submitError: string | null = null;

  constructor(
    private biddingProjectDetailsService: BiddingProjectService,
    private route: ActivatedRoute,
    private fixedPriceService: FixedPriceProjectService,
    private proposalService: ProposalService
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
        if (data.id === id) {
          this.project = data;
          this.proposal.projectId = data.id;
          this.projectType = 'Bidding';
          this.proposal.type = ProjectType.Bidding;
        } 
        else {
          this.fixedPriceService.getProjectById(id).subscribe({
            next: (data) => {
              this.project = data;
              this.proposal.projectId = data.id;
              this.projectType = 'Fixed Price';
              this.proposal.type = ProjectType.FixedPrice;
            },
            error: (err) => console.log(err)
          });
        }
      },
      error: (err) => console.log(err)
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
    // this.validateCurrentMilestone();
    
    if (this.isCurrentMilestoneValid()) {
      this.proposal.suggestedMilestones.push(this.createEmptyMilestone());
      this.clearMilestoneErrors();
    } else {
      this.showMilestoneError("Please complete all fields in the current milestone before adding a new one");
    }
  }

  removeMilestone(index: number): void {
    if (index > 0) {
      this.proposal.suggestedMilestones.splice(index, 1);
      this.clearMilestoneErrors();
    }
  }

  // validateCurrentMilestone(): void {
  //   const lastMilestone = this.proposal.suggestedMilestones[this.proposal.suggestedMilestones.length - 1];
  //   this.formErrors.milestone = {};
    
  //   if (!lastMilestone.title.trim()) {
  //     this.formErrors.milestone.title = 'Title is required';
  //   }
  //   if (!lastMilestone.description.trim()) {
  //     this.formErrors.milestone.description = 'Description is required';
  //   }
  //   if (!lastMilestone.amount || lastMilestone.amount <= 0) {
  //     this.formErrors.milestone.amount = 'Price must be greater than 0';
  //   }
  //   if (!lastMilestone.duration || lastMilestone.duration <= 0) {
  //     this.formErrors.milestone.duration = 'Duration must be greater than 0';
  //   }
  // }

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

  createProposal(): void {
    if (!this.validateForm()) {
      this.submitError = 'Please fill all required fields before submitting';
      return;
    }
  
    this.isSubmitting = true;
    this.submitError = null;
  
    this.proposalService.CreateProposal(this.proposal).subscribe({
      next: (data) => {
        this.isSubmitting = false;
        alert('Proposal submitted successfully!');
      },
      error: (err) => {
        this.isSubmitting = false;
        console.log('Full error:', err); // For debugging
        this.submitError = err.error?.message || 'Failed to submit proposal. Please try again.';

        alert(this.submitError);
      }
      
    });
  }

  showMilestoneError(message: string): void {
    this.formErrors.milestone = this.formErrors.milestone || {};
    this.formErrors.milestone.general = message;
  }

  showFormError(message: string): void {
    this.formErrors.general = message;
  }

  showSuccess(message: string): void {
    // You can implement a toast or alert here
    alert(message);
  }

  clearMilestoneErrors(): void {
    this.formErrors.milestone = {};
  }

  hasError(controlName: string, index?: number): boolean {
    if (index !== undefined) {
      return !!this.formErrors[`milestone_${index}_${controlName}`];
    }
    return !!this.formErrors[controlName];
  }

  getError(controlName: string, index?: number): string {
    if (index !== undefined) {
      return this.formErrors[`milestone_${index}_${controlName}`] || '';
    }
    return this.formErrors[controlName] || '';
  }
}