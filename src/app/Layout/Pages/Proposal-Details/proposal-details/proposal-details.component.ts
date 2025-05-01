import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../../../Shared/Services/Proposal/proposal.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProposalView, SuggestedMilestone } from '../../../../Shared/Interfaces/Proposal';
import { MilestoneService } from '../../../../Shared/Services/Milestone/milestone.service';
import { AccountService } from '../../../../Shared/Services/Account/account.service';
import { AppUser } from '../../../../Shared/Interfaces/Account';
import { CardPaymentDTO, PaymentMethod } from '../../../../Shared/Interfaces/payment-method';
import { ProposalPaymentService } from '../../../../Shared/Services/proposal-payment.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectsService } from '../../../../Shared/Services/Projects/projects.service';
import { ProjectStatus } from '../../../../Shared/Interfaces/AllProjects';
import { Files } from '../../../../base/environment';

@Component({
  selector: 'app-proposal-details',
  imports: [CommonModule,ReactiveFormsModule, FormsModule,RouterModule],
  templateUrl: './proposal-details.component.html',
  styleUrl: './proposal-details.component.css'
})
export class ProposalDetailsComponent implements OnInit {
  ProposalId: number = 0;
  proposal!: ProposalView;
  milestones: SuggestedMilestone[] = [];
  projectstatus:ProjectStatus=ProjectStatus.Pending;
  getStatusClass(status: any): string {
    return status ? status.toString().toLowerCase() : 'pending';
  }
  constructor(private proposalService: ProposalService,
    private route: ActivatedRoute,
    private milestoneService:MilestoneService,
    private AccountService:AccountService,
    private fb: FormBuilder,
    private paymentService:ProposalPaymentService,
    private toaster:ToastrService,
    private projectservice:ProjectsService,
    
    // private location:Location
  ) { 
    
  }

  // balance:number=0;


  PaymentMethod =PaymentMethod;
  showPaymentModal = false;
  selectedMethod: PaymentMethod | null = null;
  cardForm!: FormGroup;
  currentBalance = 0;
  isOwner:boolean=false;
  currentid:string="";
  filesurl=Files.filesUrl;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ProposalId = +params['proposalId'];

      
     }
    );


    this.AccountService.myPorfile().subscribe({
          next:(data:AppUser)=>{
        this.currentBalance=data.balance!;
        this.currentid=data.id;
        console.log(this.currentBalance);
        console.log(data);
        this.loadProposalDetails(this.ProposalId);
        //  this.loadSubmitMilestone(this.projectId);
          console.log(this.ProposalId);
        },
        error:(err)=>console.log(err)
        });



        this.cardForm = this.fb.group({
          cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
          cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
        });
    
    }

  
  loadProposalDetails(proposalId: number) {
    this.proposalService.GetProposalById(proposalId).subscribe({
      next: (data: any) => {
        this.proposal = data;
        // console.log('Proposal details loaded:', this.proposals); 
        // this.proposals.forEach(proposal => {
        //   if (proposal.suggestedMilestones) {
        //     console.log('Milestones:', proposal.suggestedMilestones);
        //   }
        this.projectservice.getProjectById(this.proposal.projectId).subscribe(
          {next:(data)=>{this.projectstatus=data.status
            console.log(this.projectstatus);
              this.isOwner=data.clientId==this.currentid;
              console.log(this.isOwner);
          },
          error:(err)=>this.toaster.error("An error occured loading project",err)
        }
        )
        },
    error:(err)=>this.toaster.error(err)
      }
  );
        
     
}

//  loadSubmitMilestone(projectId: number) {
//     this.milestoneService.GetMilestoneByProjectId(projectId).subscribe({
//       next: (data: any) => {
//         this.milestones = Array.isArray(data) ? data : [data];
//         console.log('Milestones loaded:', this.milestones);
//       },
//       error: (error) => {
//         console.error('Error submitting milestone:', error);
//       }
//     });
//   }


openPaymentModal() {
  this.showPaymentModal = true;
}

closePaymentModal() {
  this.showPaymentModal = false;
  this.selectedMethod = null;
  this.cardForm.reset();
}

selectPaymentMethod(method: PaymentMethod) {
  this.selectedMethod = method;
}

isPaymentValid(): boolean {
  switch (this.selectedMethod) {
    case PaymentMethod.CreditCard:
      return this.cardForm.valid;
    case PaymentMethod.Stripe:
      return true;
    case PaymentMethod.Balance:
      return this.currentBalance >= this.proposal.price!;
    default:
      return false;
  }
}

confirmPayment() {
  if (!this.isPaymentValid()) return;

  switch (this.selectedMethod) {
    case PaymentMethod.CreditCard:
      const card: CardPaymentDTO = {
        amount: this.proposal.price!,
        cardNumber: this.cardForm.value.cardNumber,
        cvv: this.cardForm.value.cvv
      };
      this.paymentService.ClientPayFromcard(this.ProposalId, card).subscribe({
        next: (data: any) => {
          this.toaster.success('Payment successful');
          this.closePaymentModal();
        }, 
        error: (err)=>{ this.toaster.error('Payment failed',err), console.log(err)}
      })
      
      const cardData = this.cardForm.value;
      break;



    case PaymentMethod.Stripe:
      const authToken = localStorage.getItem('token');
      this.paymentService.ClientPayFromStrip(this.ProposalId).subscribe({
        next: (data: any) => {
          this.toaster.success('Redirecting to stripe');
          this.closePaymentModal();
          window.location.href=data.url;

        }, 
        error: (err)=>{this.toaster.error('Payment failed',err), console.log(err)}
      })
      break;




    case PaymentMethod.Balance:
     this.paymentService.ClientPayFromBalance(this.ProposalId).subscribe({
        next: (data: any) => {
          this.toaster.success('Payment successful');
          this.closePaymentModal();
        }, 
        error: (err)=>{this.toaster.error('Payment failed',err),console.log(err)}
      })
      break;
  }
}


 }
  

