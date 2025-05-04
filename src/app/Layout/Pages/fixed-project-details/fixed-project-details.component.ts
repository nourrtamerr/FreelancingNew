import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { FixedPriceProjectById } from '../../../Shared/Interfaces/FixedPriceProject';
import { ReviewService } from '../../../Shared/Services/Review/review.service';
import { GetReviewsByRevieweeIdDto } from '../../../Shared/Interfaces/get-reviews-by-reviewee-id-dto';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { WishlistService } from '../../../Shared/Services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../../Shared/Services/Projects/projects.service';
import { map } from 'rxjs';
import { TimeAgoPipe } from '../../../Pipes/time-ago.pipe';

@Component({
  selector: 'app-fixed-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule,ReactiveFormsModule, TimeAgoPipe],
  templateUrl: './fixed-project-details.component.html',
  styleUrl: './fixed-project-details.component.css'
})
export class FixedProjectDetailsComponent implements OnInit {
  editReviewForm!: FormGroup;
  selectedReview: any = null;
  project: FixedPriceProjectById | null = null;
  projectid: number = 0;
  isowner:boolean=false;
  role:string="";
  constructor(
    private route: ActivatedRoute,
    private projectService: FixedPriceProjectService,
    private ReviewsService:ReviewService,
    private BiddingProjectService:BiddingProjectService,
    private wishlistService:WishlistService,
    private authService:AuthService,
    private toaster:ToastrService,
    private fb:FormBuilder,
    private projectsService:ProjectsService
  ) {}

  clientReviews: GetReviewsByRevieweeIdDto[]=[];

  clientOtherProjNameId: {id:number, title:string, projectType:string} []=[];
  currentuserid:string|null=""
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectid = +params['id'];
      this.clientOtherProjNameId=[]
      this.loadProjectDetails();
      this.initializeEditForm();
      this.currentuserid=this.authService.getUserId();
    });


  }
  private initializeEditForm() {
    this.editReviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadProjectDetails(): void {
    this.projectService.getProjectById(this.projectid).subscribe({
      next: (data) => {
        this.project = data;
        console.log('Project details:', data);

        this.loadWishlist();
        if (this.project?.clientId) {
          this.ReviewsService.getRevieweeById(this.project.clientId).subscribe({
            next: (data) => {
              this.clientReviews = data;
              console.log(data);
              console.log("ddddddddddddddddddddd")
            },
            error: (err) => {console.log(err), console.log("no reviews")}
          });
          this.authService.getUserId()==this.project.clientId
          {
            this.isowner=true;
          }
          const roles = this.authService.getRoles();
          this.role = roles?.includes("Freelancer") ? "Freelancer":roles?.includes("Client")? "Client" :roles?.includes("Admin")?"Admin": "";
          console.log(this.role);
        }


        if (this.project.clientOtherProjectsIdsNotAssigned && this.project.clientOtherProjectsIdsNotAssigned.length > 0) {
          console.log("ClientOtherProjectsIdsNotAssigned",this.project.clientOtherProjectsIdsNotAssigned);
          for (let projectId of this.project.clientOtherProjectsIdsNotAssigned) {
            
            
            // this.projectService.getProjectById(projectId).subscribe({
            //   next: (projectData) => {
            //     if(projectData!=null){
            //       console.log('awl if')
            //       this.clientOtherProjNameId.push({ id: projectData.id, title: projectData.title, projectType: projectData.projectType });
            //       console.log(this.clientOtherProjNameId)

            //     }
                
            //   },
            //   error: (error) => {
            //     this.BiddingProjectService.GetBiddingProjectById(projectId).subscribe({
            //       next: (projectData) => {
            //         this.clientOtherProjNameId.push({ id: projectData.id, title: projectData.title, projectType: projectData.projectType });
            //       },
            //       error: (error) => {
            //         console.error('vvvvvvvvvvvvvvvvv', error);
            //       }
            //     });
            //     console.error('Error fetching project details:', error);
            //   }
            // });
          

            this.projectsService.getProjectById(projectId).pipe(
              map((proj:any) => ({ id: proj.id, title: proj.title, projectType:proj.projectType })) // select only id and title (as name)
              ).subscribe({
              next: (data) => {
                this.clientOtherProjNameId.push(data);
              },
              error:(err)=>{
                console.log(err)
              }
            })
          
          
          }
        }
      },
      error: (error) => {
        console.error('Error fetching project details:', error);
      }
    });


  }
  userWishlist:any;




  
  
  
    RemoveFromWishlist(projectid:number){
      this.wishlistService.RemoveFromWishList(projectid).subscribe({
        next:()=>{
          this.toaster.success("Removed from wishlist")
        },
        error:(err)=>{
          this.toaster.error(err.error.message)
          console.log(err)
        }
      })
    }
  
  
    isInWishlist(): boolean {
      return this.userWishlist.includes(this.projectid);
    }
  
    toggleWishlist(): void {
      if (this.isInWishlist()) {
        this.RemoveFromWishlist(this.projectid);
      } else {
        this.AddToWishlist(this.projectid);
      }
    }
  
  
  loadWishlist(): void {
      this.wishlistService.GetWishList().subscribe({
        next: (data: any[]) => {
          // Ensure we're getting an array of project IDs
          this.userWishlist = data.map(item => item.projectId);
          console.log('Wishlist loaded:', this.userWishlist);
        },
        error: (err) => {
          console.log('Error loading wishlist:', err);
          this.userWishlist = []; // Initialize empty array on error
        }
      });
    }

    AddToWishlist(projectId: number) {
      if (this.userWishlist.includes(projectId)) {
        // Remove from wishlist
        this.wishlistService.RemoveFromWishList(projectId).subscribe({
          next: () => {
            const index = this.userWishlist.indexOf(projectId);
            if (index > -1) {
              this.userWishlist.splice(index, 1);
            this.toaster.success("Removed to wishlist");
  
            }
          }
        });
      } else {
        // Add to wishlist
        this.wishlistService.AddToWishlist(projectId).subscribe({
          next: () => {
            this.userWishlist.push(projectId);
            this.toaster.success("Added to wishlist");
          }
        });
      }
    }
  

  showDeleteModal = false;
reviewToDelete: any = null;

deleteReview(review: number) {
  this.reviewToDelete = review;
  console.log(review);
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.showDeleteModal = false;
  this.reviewToDelete = null;
}
@ViewChild('carousel') carouselElement!: ElementRef;
confirmDelete() {
  if (this.reviewToDelete) {
    this.ReviewsService.deleteReview(this.reviewToDelete).subscribe({
      next: () => {
        // Remove the review from the array
        this.clientReviews = this.clientReviews.filter(review => review.id !== this.reviewToDelete);
        
        // Force carousel refresh
        setTimeout(() => {
          const carousel = document.querySelector('#clientReviewsCarousel');
          if (carousel) {
            // Remove all active classes first
            carousel.querySelectorAll('.carousel-item').forEach(item => {
              item.classList.remove('active');
            });
            
            // Add active class to first item if exists
            const firstItem = carousel.querySelector('.carousel-item');
            if (firstItem) {
              firstItem.classList.add('active');
            }
          }
        });

        this.closeDeleteModal();
        this.toaster.success('Review deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.toaster.error('Failed to delete review');
        this.closeDeleteModal();
      }
    });
  }
}
editReview(review: any) {
  this.selectedReview = review;
  this.selectedReview.revieweeId=this.project?.clientId;
  console.log(this.selectedReview,'asfafffffffffffffffffffffffffffffffffffffffffffffff')
  this.editReviewForm.patchValue({
    rating: review.rating,
    comment: review.comment
  });
}

updateReview() {
  if (this.editReviewForm.valid && this.selectedReview) {
    const updatedReview = {
      ...this.selectedReview,
      rating: this.editReviewForm.get('rating')?.value,
      comment: this.editReviewForm.get('comment')?.value
      
    };

    // Call your review service to update
    this.ReviewsService.updateReview(updatedReview.id,updatedReview).subscribe({
      next: () => {
        // Update the review in the list
        const index = this.clientReviews.findIndex(r => r.id === this.selectedReview.id);
        if (index !== -1) {
          this.clientReviews[index] = updatedReview;
        }
        this.closeEditModal();
        this.toaster.success('Review updated successfully');
      },
      error: (error) => {
        console.error('Error updating review:', error);
        this.toaster.error('Failed to update review');
      }
    });
  }
}

closeEditModal() {
  this.selectedReview = null;
  this.editReviewForm.reset();
}
}
