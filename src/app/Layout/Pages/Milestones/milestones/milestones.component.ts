import { Component, OnInit } from '@angular/core';
import { MilestoneService } from '../../../../Shared/Services/Milestone/milestone.service';
import { CommonModule } from '@angular/common';
import { Milestone, MilestoneFile } from '../../../../Shared/Interfaces/milestone';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Environment, Files } from '../../../../base/environment';
import { ProjectsService } from '../../../../Shared/Services/Projects/projects.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../../Shared/Services/Account/account.service';
import { AppUser } from '../../../../Shared/Interfaces/Account';
import { Review } from '../../../../Shared/Interfaces/Reviews';
import { ReviewService } from '../../../../Shared/Services/Review/review.service';
import { GetReviewsByRevieweeIdDto } from '../../../../Shared/Interfaces/get-reviews-by-reviewee-id-dto';
import { SentimentService } from '../../../../Shared/Services/AI/Sentimentservice.service';

@Component({
  selector: 'app-milestones',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './milestones.component.html',
  styleUrl: './milestones.component.css'
})

export class MilestonesComponent implements OnInit{
  projectId: number = 0;
  milestones: Milestone[] = [];
  FilesURL: string = "";
  reviewForm!: FormGroup;
  isProjectReviewed: boolean = false;
  sentiment: string = '';
  sentimentScore: number = 0;
  
  getStatusText(status: any): string {
    switch (status) {
      case 1: return 'Completed';
      case 2: return 'In Progress';
      case 0: return 'Pending';
      default: return 'Unknown';
    }
  }
  
  constructor(private route: ActivatedRoute,
    private milestoneService: MilestoneService,
  private projectService:ProjectsService,
private toastr:ToastrService,
private accountservice:AccountService
,private fb: FormBuilder
,private reviewservice:ReviewService,private sentimentService:SentimentService) {}

areAllMilestonesCompleted(): boolean {
  return this.milestones.length != 0 && 
         this.milestones.every(milestone => milestone.status === 1);
}

setRating(rating: number): void {
  this.reviewForm.patchValue({ rating });
}

// submitProjectReview(): void {
//   if (this.reviewForm.valid) {
//     const review: Review = {
//       id:this.existingReview?this.existingReview.id:undefined,
//       rating: this.reviewForm.get('rating')?.value,
//       comment: this.reviewForm.get('comment')?.value,
//       revieweeId: this.isProjectClient ? this.projectdata.freelancerId : this.projectdata.clientId,
//       reviewerId: this.isProjectClient ? this.projectdata.clientId : this.projectdata.freelancerId,
//       projectId: this.projectdata.id
//     };
//     console.log(review);
//     if(!this.existingReview){
//     this.reviewservice.addReview(review).subscribe({
//       next: (response) => {
//         this.toastr.success('Review submitted successfully');
//         this.projectdata.isReviewed = true;
//         this.reviewForm.reset();
//       },
//       error: (error) => {
//         this.toastr.error('Failed to submit review');
//         console.error('Error submitting review:', error);
//       }
//     });
//   }
//   else{
//     this.reviewservice.updateReview(this.existingReview.id,review).subscribe({
//       next: (response) => {
//         this.toastr.success('Review submitted successfully');
//         this.projectdata.isReviewed = true;
//         this.reviewForm.reset();
//       },
//       error: (error) => {
//         this.toastr.error('Failed to submit review');
//         console.error('Error submitting review:', error);
//       }
//     });
//   }
//   }
// }

submitProjectReview(): void {
  if (this.reviewForm.valid) {
    // First analyze the sentiment
    this.sentimentService.analyze(this.reviewForm.get('comment')?.value).subscribe({
      next: (response) => {
        if (response && response.prediction !== undefined) {
          this.sentiment = response.prediction;
          this.sentimentScore = response.probability;

          const review: Review = {
            id: this.existingReview ? this.existingReview.id : undefined,
            rating: this.reviewForm.get('rating')?.value,
            comment: this.reviewForm.get('comment')?.value,
            revieweeId: this.isProjectClient ? this.projectdata.freelancerId : this.projectdata.clientId,
            reviewerId: this.isProjectClient ? this.projectdata.clientId : this.projectdata.freelancerId,
            projectId: this.projectdata.id,
            sentiment: this.sentiment,
            sentimentScore: this.sentimentScore
          };

          // Add new review
          if (!this.existingReview) {
            this.reviewservice.addReview(review).subscribe({
              next: (response) => {
                this.toastr.success('Review submitted successfully');
                this.projectdata.isReviewed = true;
                this.reviewForm.reset();
              },
              error: (error) => {
                this.toastr.error('Failed to submit review');
                console.error('Error submitting review:', error);
              }
            });
          } 
          // Update existing review
          else {
            this.reviewservice.updateReview(this.existingReview.id, review).subscribe({
              next: (response) => {
                this.toastr.success('Review updated successfully');
                this.projectdata.isReviewed = true;
                this.reviewForm.reset();
              },
              error: (error) => {
                this.toastr.error('Failed to update review');
                console.error('Error updating review:', error);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error analyzing sentiment:', error);
        this.toastr.error('Failed to analyze sentiment');
      }
    });
  }
}


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      console.log(this.projectId);
      this.initializeReviewForm();
      this.loadMilestones();
      this.loadproject();
 
    });


    this.FilesURL = Files.filesUrl;
    console.log(this.FilesURL);
  }

  private initializeReviewForm() {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  existingReview!:GetReviewsByRevieweeIdDto

  private loadExistingReview() {
    console.log('projectdataid',this.projectdata?.id);
    if (this.projectdata?.id) {
      this.reviewservice.getbyprojectId(this.projectdata.id).subscribe({
        next: (reviews: GetReviewsByRevieweeIdDto[]) => {
          console.log(this.projectdata.clientId,'client')
          console.log(this.projectdata.freelancerId,'freelancer')

          console.log(reviews,'reviews')

          if (reviews.length > 0) {
            const userReview = reviews.find(review => 
              review.reviewerId === (this.isProjectClient ? this.projectdata.clientId : this.projectdata.freelancerId)
            

            );
            userReview?.id
            console.log("this.projectidasddddddddddddddddddddddd",userReview);
            if (userReview) {
              this.existingReview = userReview;
              console.log("existing review is",userReview,this.existingReview);
              this.reviewForm.patchValue({
                rating: userReview.rating,
                comment: userReview.comment
              });
            }
          }
        },
        error: (error) => {
          console.error('Error loading reviews:', error);
          this.toastr.error('Failed to load review data');
        }
      });
    }
  }

  selectedImage: string | null = null;

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  closeImageModal() {
    this.selectedImage = null;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
  


  deleteFile(fileName: string) {
    const fileNameOnly = fileName.split('/').pop(); // Extract filename from URL
    if (fileNameOnly) {
      // Find which milestone this file belongs to
      let milestoneWithFile: Milestone | undefined;
      for (const milestone of this.milestones) {
        if (milestone.files?.includes(fileName)) {
          milestoneWithFile = milestone;
          break;
        }
      }

      this.milestoneService.RemoveMilestoneFilesByName(fileNameOnly).subscribe({
        next: () => {
          this.toastr.success('File deleted successfully');
          
          // If we found the milestone, update only its files instead of reloading everything
          if (milestoneWithFile && milestoneWithFile.id !== undefined) {
            // First remove the file from the current array to give immediate UI feedback
            if (milestoneWithFile.files) {
              milestoneWithFile.files = milestoneWithFile.files.filter(f => f !== fileName);
            }
            
            // Then refresh from server to ensure consistency
            this.milestoneService.GetFilesByMilestoneId(milestoneWithFile.id).subscribe({
              next: (files: MilestoneFile[]) => {
                milestoneWithFile!.files = files.map((f: any) => `${this.FilesURL}${f.fileName}`);
              },
              error: (error) => {
                console.error(`Error reloading files after deletion:`, error);
              }
            });
          } else {
            // Fallback to full reload if milestone not found
            this.loadMilestones();
          }
        },
        error: (error) => {
          this.toastr.error('Error deleting file');
          console.error('Error deleting file:', error);
        }
      });
    }
  }
  loadMilestones() {
    this.milestoneService.GetMilestoneByProjectId(this.projectId).subscribe({
      next: (data: any) => {
        this.milestones = Array.isArray(data) ? data : [data];
        console.log(data);
        
        this.milestones.forEach(milestone => {
          if(milestone.id != undefined) {
            // Clear existing files to prevent duplication
            milestone.files = [];
            
            this.milestoneService.GetFilesByMilestoneId(milestone.id).subscribe({
              next:(files: MilestoneFile[]) => {
                // Assign files array instead of appending
                milestone.files = files.map((f: any) => `${this.FilesURL}${f.fileName}`);
              },
              error: (error) => {
                console.error(`Error loading files for milestone ${milestone.id}:`, error);
                milestone.files = []; 
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error loading milestones:', error);
      }
    });
  }
  isProjectClient:boolean=false;
  isProjectFreelancer:boolean=false;
  projectdata:any;
  
  loadproject()
  {
    
    this.accountservice.myPorfile().subscribe({
      next:(data2:AppUser)=>{
        console.log(data2);
    this.projectService.getProjectById(this.projectId).subscribe(
      {
        next:(data:any)=>{this.projectdata=data,this.toastr.success("project loaded successfully")
            console.log(data),
            console.log(data2)
            // console.log(data\),
          if(data.clientId==data2.id)
          {
            this.isProjectClient=true;
          }
          if(data.freelancerId==data2.id)
          {
            this.isProjectFreelancer=true;
          }
          
          this.loadExistingReview();
        },
        error:(err)=>console.log(err)
      })
  },
  error:(err)=>console.log(err)


})
  }

  isFirstPendingMilestone(milestone: Milestone): boolean {
    const firstPendingIndex = this.milestones.findIndex(m => m.status === 0);
    const currentIndex = this.milestones.findIndex(m => m.id === milestone.id);
    return firstPendingIndex === currentIndex;
  }

  getFileType(files: string): string {
    if (!files) return 'other';
    
    const fileExtension = files.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension || '')) {
      return 'video';
    }
    return 'other';
  }
  confirmMilestone(milestoneId: number) {
    this.milestoneService.UpdateMilestoneStatus(milestoneId,1).subscribe({
      next: (response) => {
        this.toastr.success('Milestone confirmed successfully');
        this.loadMilestones(); // Reload milestones to update the status
      },
      error: (error) => {
        this.toastr.error('Error confirming milestone');
        console.error('Error confirming milestone:', error);
      }
    });
  }

  onFileSelected(event: any, milestoneId: number) {
    const files: File[] = Array.from(event.target.files);
    if (files.length > 0) {
      // Show loading indicator or disable button while uploading
      const uploadButton = document.querySelector('.upload-btn') as HTMLButtonElement;
      if (uploadButton) {
        uploadButton.disabled = true;
        uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      }

      this.milestoneService.UploadMilestoneFile(files, milestoneId).subscribe({
        next: (response) => {
          this.toastr.success('Files uploaded successfully');
          // Reset the file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          
          // Only reload the specific milestone's files rather than all milestones
          const milestone = this.milestones.find(m => m.id === milestoneId);
          if (milestone) {
            milestone.files = [];
            this.milestoneService.GetFilesByMilestoneId(milestoneId).subscribe({
              next: (files: MilestoneFile[]) => {
                milestone.files = files.map((f: any) => `${this.FilesURL}${f.fileName}`);
              },
              error: (error) => {
                console.error(`Error loading files for milestone ${milestoneId}:`, error);
              },
              complete: () => {
                // Re-enable the upload button
                if (uploadButton) {
                  uploadButton.disabled = false;
                  uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
                }
              }
            });
          } else {
            // Fallback to full reload if milestone not found
            this.loadMilestones();
            // Re-enable the upload button
            if (uploadButton) {
              uploadButton.disabled = false;
              uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
            }
          }
        },
        error: (error) => {
          this.toastr.error('Error uploading files');
          console.error('Error uploading files:', error);
          // Re-enable the upload button on error
          if (uploadButton) {
            uploadButton.disabled = false;
            uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
          }
        }
      });
    }
  }





  // Add these properties
showDisputeModal: boolean = false;
disputeReason: string = '';
selectedMilestoneId: number | null = null;

// Add these methods
isLatestMilestone(milestone: Milestone): boolean {
  const pendingMilestones = this.milestones.filter(m => m.status === 0);
  return pendingMilestones.length > 0 && 
         pendingMilestones[0].id === milestone.id;
}

openDisputeModal(milestoneId: number): void {
  this.selectedMilestoneId = milestoneId;
  this.showDisputeModal = true;
  document.body.style.overflow = 'hidden';
}

closeDisputeModal(): void {
  this.showDisputeModal = false;
  this.disputeReason = '';
  this.selectedMilestoneId = null;
  document.body.style.overflow = 'auto';
}

submitDispute(): void {
  if (this.selectedMilestoneId && this.disputeReason.trim()) {
    this.accountservice.Dispute(this.selectedMilestoneId, this.disputeReason).subscribe({
      next: (response) => {
        this.toastr.success('Dispute submitted successfully');
        this.closeDisputeModal();
      },
      error: (error) => {
        this.toastr.error('Failed to submit dispute');
        console.error('Error submitting dispute:', error);
      }
    });
  }
}

// Add to ngOnDestroy
ngOnDestroy() {
  document.body.style.overflow = 'auto';
}
}