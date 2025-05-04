import { Component, OnInit,viewChild,ElementRef, ViewChild, OnDestroy } from '@angular/core';
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
import { bidchange, BiddinghubService } from '../../Shared/Services/bidding/biddinghub.service';
import { HubConnection } from '@microsoft/signalr';

@Component({
  selector: 'app-bidding-project-details',
  imports: [RouterModule, TimeAgoPipe, FormsModule, CommonModule, TimeLeftPipe,ReactiveFormsModule],
  templateUrl: './bidding-project-details.component.html',
  styleUrl: './bidding-project-details.component.css'
})
export class BiddingProjectDetailsComponent implements OnInit,OnDestroy {
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
    private projectsService: ProjectsService,
    private biddinghub:BiddinghubService
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
  biddingStartDate:'',
  currentBid:0
};




previousBid: number = 0;
  previousAvgBid: number = 0;
  previousNumOfBids: number = 0;
  
  // Add animation state flags
  bidAnimationClass: string = '';
  avgBidAnimationClass: string = '';
  numBidsAnimationClass: string = '';

  clientOtherProjNameId: {id:number, title:string, projectType:string} []=[];



  clientReviews: GetReviewsByRevieweeIdDto[]=[];
  private applyAnimations(): void {
    // Current bid animation
    if (this.previousBid !== this.project.currentBid) {
      this.bidAnimationClass = 'highlight-animation';
      if (this.project.currentBid! < this.previousBid) {
        this.bidAnimationClass += ' price-decrease';
      } else if (this.project.currentBid! > this.previousBid) {
        this.bidAnimationClass += ' price-increase';
      }
      
      // Remove animation class after animation completes
      setTimeout(() => {
        this.bidAnimationClass = '';
      }, 1500);
    }
    
    // Average bid animation
    if (this.previousAvgBid !== this.project.bidAveragePrice) {
      this.avgBidAnimationClass = 'highlight-animation';
      if (this.project.bidAveragePrice < this.previousAvgBid) {
        this.avgBidAnimationClass += ' price-decrease';
      } else if (this.project.bidAveragePrice > this.previousAvgBid) {
        this.avgBidAnimationClass += ' price-increase';
      }
      
      setTimeout(() => {
        this.avgBidAnimationClass = '';
      }, 1500);
    }
    
    // Number of bids animation
    if (this.previousNumOfBids !== this.project.numOfBids) {
      this.numBidsAnimationClass = 'pulse-animation';
      
      setTimeout(() => {
        this.numBidsAnimationClass = '';
      }, 1500);
    }
  }

  ngOnInit(): void {
    // const code = +this.route.snapshot.paramMap.get('id')!;
    this.route.paramMap.subscribe(params => {
      const id = +params.get('id')!;
      this.clientOtherProjNameId=[];
      this.loadNgOnIt(id);

      this.biddinghub.joinBidGroup(id).then(() => {
        console.log("Proceeding to next step...");
        // Next steps here
        this.biddinghub.hubConnection.on("BiddingChanged", (bidchange: bidchange) => {
          console.log('New bidchange:', bidchange);
  
          this.previousBid = this.project.currentBid!;
          this.previousAvgBid = this.project.bidAveragePrice;
          this.previousNumOfBids = this.project.numOfBids;
          
          // Update values
          this.project.currentBid = bidchange.price;
          this.project.bidAveragePrice = Math.round(bidchange.average);
          this.project.numOfBids =  this.project.numOfBids + 1;
          
          // Apply animations based on value changes
          this.applyAnimations();
          // const current = this.AllNotificaitions.getValue();
          // this.AllNotificaitions.next([notification, ...current]);
          // if (!notification.isRead) {
          //   this.unreadNotifications.next(this.unreadNotifications.value + 1);
          // }
        });
        
      })
      .catch(err => {
        console.error("Failed to join bid group:", err);
      });
      
      
      

      // if (this.biddinghub.hubConnection.state === 'Connected') {
      //   this.joinBidGroup(id);
      // } else {
      //   this.biddinghub.hubConnection.start().then(() => {
      //     this.joinBidGroup(id);
      //   });
      // }
    


      
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
  
  ngOnDestroy(): void {
    if (this.biddinghub.hubConnection) {
      this.biddinghub.hubConnection.off("BiddingChanged");
    }
  }



showDeleteModal = false;
reviewToDelete: any = null;

@ViewChild('carousel') carouselElement!: ElementRef;



userWishlist:any;





  // Add these properties to your component class
  timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private countdownInterval: any;
  
  // Add this method to your component class
  private startCountdown(): void {
    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  
    // Update countdown immediately
    this.updateCountdown();
  
    // Set interval to update countdown every second
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }
  
  // Add these methods to your component class
  
  // Check if auction has started
  isAuctionStarted(): boolean {
    if (!this.project?.biddingStartDate) return true; // Default to started if no start date
    try {
      const startDate = new Date(this.project.biddingStartDate);
      const now = new Date();
      return startDate <= now;
    } catch (error) {
      console.error('Error parsing BiddingStartDate:', error);
      return true; // Default to started if there's an error
    }
  }
  
  


  
  // Check if auction has ended
  isAuctionEnded(): boolean {
    if (!this.project?.biddingEndDate) return false;
    try {
      const endDate = new Date(this.project.biddingEndDate);
      const now = new Date();
      return endDate < now;
    } catch (error) {
      console.error('Error parsing biddingEndDate:', error);
      return false; // Default to not ended if there's an error
    }
  }

  getAuctionStatusIcon(): string {
    if (this.isBidEndDatePassed()) {
      return 'fa-hourglass-end';
    } else if (this.isAuctionStarted()) {
      return 'fa-hourglass-half';
    } else {
      return 'fa-clock';
    }
  }
  getBidButtonTitle(): string {
    if (this.project?.freelancerId !== null) {
      return 'This project has already been assigned';
    }
    if (!this.isAuctionStarted()) {
      return 'Bidding period has not started yet';
    }
    if (this.isBidEndDatePassed()) {
      return 'Bidding period has ended';
    }
    return 'Apply for this project';
  }
  // Get the appropriate text for the auction status
  getAuctionStatusText(): string {
    if (this.isBidEndDatePassed()) {
      return 'Bidding ended';
    } else if (this.isAuctionStarted()) {
      return 'Bidding ends in';
    } else {
      return 'Bidding starts in';
    }
  }
  getAuctionStatusClass(): string {
    if (this.isBidEndDatePassed()) {
      return 'bidding-ended';
    } else if (this.isAuctionStarted()) {
      return 'bidding-active';
    } else {
      return 'bidding-soon';
    }
  }
  private updateCountdown(): void {
    if (!this.project) return;
    
    const now = new Date().getTime();
    
    // If auction hasn't started yet, count down to start date
    if (!this.isAuctionStarted()) {
      try {
        const startDate = new Date(this.project.biddingStartDate).getTime();
        const distance = startDate - now;
        
        if (distance <= 0) {
          // When start date is reached, switch to counting down to end date
          this.calculateTimeLeft(0);
          return;
        }
        
        this.calculateTimeLeft(distance);
        return; // Important: return here to prevent counting down to end date
      } catch (error) {
        console.error('Error calculating start date countdown:', error);
        this.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return;
      }
    }
    
    // If auction has started, count down to end date
    try {
      const endDate = new Date(this.project.biddingEndDate).getTime();
      const distance = endDate - now;
      
      if (distance <= 0) {
        this.calculateTimeLeft(0);
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
        return;
      }
      
      this.calculateTimeLeft(distance);
    } catch (error) {
      console.error('Error calculating end date countdown:', error);
      this.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }
  
  // Helper method to calculate time units
  private calculateTimeLeft(distance: number): void {
    if (distance <= 0) {
      this.timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
      return;
    }
    
    this.timeLeft = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }
  
  // Add this method to check if bidding end date has passed
  // isBidEndDatePassed(): boolean {
  //   if (!this.project.biddingEndDate) return false;
  //   return new Date(this.project.biddingEndDate) < new Date();
  // }
  
  // Modify your loadNgOnIt method to start the countdown after loading the project
  private loadNgOnIt(id: number): void {
    this.biddingProjectDetailsService.GetBiddingProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        
        // Start countdown after project is loaded
        this.startCountdown();
        
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


// showDeleteModal = false;
// reviewToDelete: any = null;

deleteReview(review: number) {
  this.reviewToDelete = review;
  console.log(review);
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.showDeleteModal = false;
  this.reviewToDelete = null;
}
// @ViewChild('carousel') carouselElement!: ElementRef;
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


// userWishlist:any;




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
  

}

