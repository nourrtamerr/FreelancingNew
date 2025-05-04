import { Component, OnInit,viewChild,ElementRef, ViewChild } from '@angular/core';
import { BiddingProjectService } from '../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetById } from '../../Shared/Interfaces/BiddingProject/bidding-project-get-by-id';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { TimeAgoPipe } from '../../Pipes/time-ago.pipe';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { map } from 'rxjs/operators';
import { TimeLeftPipe } from '../../Pipes/time-left.pipe';
import { GetReviewsByRevieweeIdDto } from '../../Shared/Interfaces/get-reviews-by-reviewee-id-dto';
import { ReviewService } from '../../Shared/Services/Review/review.service';
import { FixedPriceProjectService } from '../../Shared/Services/FixedPriceProject/fixed-price-project.service';

import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../Shared/Services/wishlist.service';
import { AuthService } from '../../Shared/Services/Auth/auth.service';
import { ProjectsService } from '../../Shared/Services/Projects/projects.service';

@Component({
  selector: 'app-bidding-project-details',
  imports: [RouterModule, TimeAgoPipe, FormsModule, CommonModule, TimeLeftPipe,ReactiveFormsModule],
  templateUrl: './bidding-project-details.component.html',
  styleUrl: './bidding-project-details.component.css'
})
export class BiddingProjectDetailsComponent implements OnInit {
  editReviewForm!: FormGroup;
  selectedReview: any = null;
  constructor(private biddingProjectDetailsService:BiddingProjectService,
     private route:ActivatedRoute,
    private ReviewsService:ReviewService,
    private FixedService:FixedPriceProjectService,
    private wishlistService:WishlistService,
    private toaster:ToastrService,
    private authService:AuthService,
    private fb: FormBuilder,
    private reviewservice:ReviewService,
    private projectsService: ProjectsService
    ){

      this.initializeEditForm();


    }
    isowner:boolean=false;
    role:string="";
    currentuserid:string|null="";
project: BiddingProjectGetById={
  id: 0,
  title: '',
  description: '',
  projectType: '',
  bidAveragePrice: 0,
  minimumPrice: 0,
  maximumprice: 0,
  currency: '',
  experienceLevel: '',
  projectSkills:[],
  postedFrom: 0,
  clientTotalNumberOfReviews: 0,
  clientRating: 0,
  biddingEndDate: '',
  clientIsverified: false,
  clientCountry: '',
  clientCity: '',
  clinetAccCreationDate: '',
  freelancersubscriptionPlan: '',
  freelancerTotalNumber: 0,
  freelancerRemainingNumberOfBids: 0,
  clientOtherProjectsIdsNotAssigned:[],
  numOfBids:0,
  clientProjectsTotalCount:0,
  clientId:'',
  expectedDuration:0,
  endDate:'',
  biddingStartDate:''
};


  clientOtherProjNameId: {id:number, title:string, projectType:string} []=[];



  clientReviews: GetReviewsByRevieweeIdDto[]=[];
  

  ngOnInit(): void {
    // const code = +this.route.snapshot.paramMap.get('id')!;
    this.route.paramMap.subscribe(params => {
      const id = +params.get('id')!;
      this.clientOtherProjNameId=[];
      this.loadNgOnIt(id);
    });
    this.currentuserid=this.authService.getUserId();
  console.log(this.currentuserid);

  const roles = this.authService.getRoles();
            this.role = roles?.includes("Freelancer") ? "Freelancer":roles?.includes("Client")? "Client" :roles?.includes("Admin")?"Admin": "";
            console.log(this.role);

  }

  isBiddingExpired(): boolean {
    return new Date(this.project.biddingEndDate) < new Date();
  }
  

  private loadNgOnIt(id:number):void{
    this.biddingProjectDetailsService.GetBiddingProjectById(id).subscribe({
      next: (data) => {
        this.project = data;

        this.loadWishlist();
        if (this.project.clientId) {
          this.ReviewsService.getRevieweeById(this.project.clientId).subscribe({
            next: (data) => {
              this.clientReviews = data;
              console.log(data);
            },
            error: (err) => console.log(err)
          });
        }


        // Fetch other projects after main project is loaded
        if (this.project.clientOtherProjectsIdsNotAssigned && this.project.clientOtherProjectsIdsNotAssigned.length > 0) {
          console.log('clientOtherProjectsIdsNotAssigned',this.project.clientOtherProjectsIdsNotAssigned)
          for (let projectId of this.project.clientOtherProjectsIdsNotAssigned) {
            // if(projectId !== id){
            //   this.biddingProjectDetailsService.GetBiddingProjectById(projectId)
              
            //   .subscribe({
            //     next: (data) => {
            //       console.log(data)
            //       if(data != null){
            //         this.clientOtherProjNameId.push(data);
            //         // If you want to store multiple, use an array instead
            //         console.log(this.project.clinetAccCreationDate)


            //         if (this.project?.clientId) {
            //           this.ReviewsService.getRevieweeById(this.project.clientId).subscribe({
            //             next: (data) => {
            //               this.clientReviews = data;
            //               console.log(data);
            //               console.log("ddddddddddddddddddddd")
            //             },
            //             error: (err) => {console.log(err), console.log("no reviews")}
            //           });
            //           this.authService.getUserId()==this.project.clientId
            //           {
            //             this.isowner=true;
            //           }
            //           const roles = this.authService.getRoles();
            //           this.role = roles?.includes("Freelancer") ? "Freelancer":roles?.includes("Client")? "Client" :roles?.includes("Admin")?"Admin": "";
            //           console.log(this.role);
            //         }
            //       }
            //       else{
            //         console.log("data is null")
            //         this.FixedService.getProjectById(projectId) .pipe(
            //           map(proj => ({ id: proj.id, title: proj.title, projectType:'Fixed Price' })) // select only id and title (as name)
            //         ).subscribe({
            //           next: (data)=> {
            //             this.clientOtherProjNameId.push(data);
            //           },
            //           error: (err)=> {console.log(err), console.log("niwnfoinewio")}
            //         })
                   
            //       }
            //     },
            //     error: (err) => {
            //       console.log(err);
            //       console.log("Fetching Fixed Price project fallback...");
                
            //       this.FixedService.getProjectById(projectId).pipe(
            //         map(proj => ({ id: proj.id, title: proj.title, projectType: 'Fixed Price' }))
            //       ).subscribe({
            //         next: (data) => {
            //           this.clientOtherProjNameId.push(data);
            //         },
            //         error: (err) => {
            //           console.log("Error in FixedService fallback:", err);
            //         }
            //       });
            //     }

            //   });
            // }

            this.projectsService.getProjectById(projectId).pipe(
              map(proj => ({ id: proj.id, title: proj.title, projectType:proj.projectType })) // select only id and title (as name)
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
      error: (err) => {
        this.FixedService.getProjectById(id) .pipe(
          map(proj => ({ id: proj.id, title: proj.title, projectType:'Fixed Price' })) // select only id and title (as name)
        ).subscribe({
          next: (data)=> {
            this.clientOtherProjNameId.push(data);
          },
          error: (err)=> {console.log(err), console.log("niwnfoinewio")}
        })
        ,console.log(err),console.log("niwnfoinewio")}
    });
  }


  


  editReview(review: any) {
    this.selectedReview = review;
    this.selectedReview.revieweeId=this.project.clientId;
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


  private initializeEditForm() {
    this.editReviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
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


userWishlist:any;




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
    return this.userWishlist.includes(this.project.id);
  }

  toggleWishlist(): void {
    if (this.isInWishlist()) {
      this.RemoveFromWishlist(this.project.id);
    } else {
      this.AddToWishlist(this.project.id);
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

  isBidEndDatePassed(): boolean {
    if (!this.project?.biddingEndDate) return false;
    return new Date(this.project.biddingEndDate) < new Date();
  }
  
  getBidButtonTitle(): string {
    if (this.project?.freelancerId !== null) {
      return 'This project has already been assigned';
    }
    if (this.isBidEndDatePassed()) {
      return 'Bidding period has ended';
    }
    return 'Apply for this project';
  }
}

