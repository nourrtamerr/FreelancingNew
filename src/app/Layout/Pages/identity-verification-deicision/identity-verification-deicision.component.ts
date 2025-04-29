import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsersRequestingVerificaiton, VerificationDecision } from '../../../Shared/Interfaces/Account';
import { Environment, Files } from '../../../base/environment';

@Component({
  selector: 'app-identity-verification-deicision',
  imports: [CommonModule,RouterModule,ReactiveFormsModule,FormsModule],
  templateUrl: './identity-verification-deicision.component.html',
  styleUrl: './identity-verification-deicision.component.css'
})
export class IdentityVerificationDeicisionComponent implements OnInit {
  constructor(private accountservice:AccountService
    ,private route: ActivatedRoute
    ,private router: Router
    ,private fb: FormBuilder
    ,private toastr: ToastrService
  )
  {

  }
  ngOnInit(): void {
    this.loadusers();
    this.decisionForm = this.fb.group({
      isAccepted: [null, Validators.required],
      userId: [''],
      reason: ['']
    });
  }
  users:UsersRequestingVerificaiton=[]
  error:string="";
  isImagePreviewOpen = false;
  isDecisionModalOpen = false;
  selectedImage: string | null = null;
  selectedUser: any = null;
  decisionForm!: FormGroup;
  filesurl:string=Files.filesUrl;
  loadusers()
  {
    this.accountservice.getUsersRequestingVerifications().subscribe({
          next:(data:UsersRequestingVerificaiton)=>{
            this.users=data;
            this.toastr.success("users loaded successfully");
          },
          error:(err)=>{
            this.error=err;
            this.toastr.error("failed to load bidding projects");
          }
        })
  }



  openImagePreview(imageUrl: string|undefined) {
    if(imageUrl){
    this.selectedImage = imageUrl;
    }
    else
    {
      this.selectedImage="./images/default.jpg"
    }
    this.isImagePreviewOpen = true;
  }

  closeImagePreview() {
    this.isImagePreviewOpen = false;
    this.selectedImage = null;
  }

  openDecisionModal(user: any) {
    this.selectedUser = user;
    this.decisionForm.patchValue({
      userId: user.id,
      isAccepted: null,
      reason: ''
    });
    this.isDecisionModalOpen = true;
  }

  closeDecisionModal() {
    this.isDecisionModalOpen = false;
    this.selectedUser = null;
    this.decisionForm.reset();
  }

  setDecision(isAccepted: boolean) {
    this.decisionForm.patchValue({ isAccepted });
    if (isAccepted) {
      this.decisionForm.get('reason')?.clearValidators();
    } else {
      this.decisionForm.get('reason')?.setValidators([Validators.required]);
    }
    this.decisionForm.get('reason')?.updateValueAndValidity();
  }

  submitDecision() {
    if (this.decisionForm.valid) {
      console.log(this.selectedUser);
      const decision: VerificationDecision = {
        isAccepted: this.decisionForm.get('isAccepted')?.value,
        userId: this.selectedUser.id,
        reason: this.decisionForm.get('isAccepted')?.value ? null : this.decisionForm.get('reason')?.value
      };
      console.log("decision is",decision);
      this.accountservice.VerifyIdentity(decision).subscribe({
        next: () => {
          this.toastr.success('Decision submitted successfully');
          this.closeDecisionModal();
          this.loadusers(); // Reload the users list
        },
        error: (err) => {
          this.toastr.error('Failed to submit decision');
          console.log(err);
          this.error = err;
        }
      });
    }
  }

  getImageUrl(path: string): string {
    console.log(`${this.filesurl}/+${path}`);
    return `${this.filesurl}/${path}`; // Adjust this based on your image storage setup
  }
}
