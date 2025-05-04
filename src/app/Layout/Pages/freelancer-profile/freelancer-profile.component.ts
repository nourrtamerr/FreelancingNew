import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { CountriesService } from '../../../Shared/Services/Countries/countries.service';
import { CitiesService } from '../../../Shared/Services/Cities/cities.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EducationService } from '../../../Shared/Services/Educations/education.service';
import { ExperienceService } from '../../../Shared/Services/Experiences/experience.service';
import { PortfolioProjectService } from '../../../Shared/Services/Portfolio/portfolio-project.service';
import { PortfolioImageService } from '../../../Shared/Services/PortfolioImage/portfolio-image.service';
import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { CommonModule } from '@angular/common';
import { FixedPriceProject } from '../../../Shared/Interfaces/FixedPriceProject';
import { BiddingProjectGetAll } from '../../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { Files, projectImages } from '../../../base/environment';
import { Country } from '../../../Shared/Interfaces/Country';
import { SingularFreelancer } from '../../../Shared/Interfaces/Account';
import { FreelancerSkill, nonrecommendedSkill, Skill } from '../../../Shared/Interfaces/Skill';
import { City } from '../../../Shared/Interfaces/City';
import { Education } from '../../../Shared/Interfaces/education';
import { Experience } from '../../../Shared/Interfaces/experience';
import { freelancerportofolioproject, freelancerportofolioprojects } from '../../../Shared/Interfaces/PortfolioProject';
import { Certificate } from '../../../Shared/Interfaces/certificate';
import { ReviewService } from '../../../Shared/Services/Review/review.service';
import { GetReviewsByRevieweeIdDto } from '../../../Shared/Interfaces/get-reviews-by-reviewee-id-dto';
import { FreelancerLanguage } from '../../../Shared/Interfaces/freelancer-language';
import { FreelancerlanguageService } from '../../../Shared/Services/FreelancerLanguages/freelancerlanguage.service';
import { SentimentService } from '../../../Shared/Services/AI/Sentimentservice.service';

@Component({
  selector: 'app-freelancer-profile',
  imports: [CommonModule,RouterModule,ReactiveFormsModule],
  templateUrl: './freelancer-profile.component.html',
  styleUrl: './freelancer-profile.component.css'
})
export class FreelancerProfileComponent implements OnInit  {
  currentuserid:string|null=""
constructor(
  private route: ActivatedRoute
    ,private router: Router
    ,private fb: FormBuilder
    ,private toastr: ToastrService
    ,private account:AccountService
    ,private authservice:AuthService
    ,private Countryservice:CountriesService
    ,private CityService:CitiesService
    ,private SkillService:SkillService
    ,private educationservice:EducationService
    ,private experienceservice:ExperienceService
    ,private portfolioprojectservice:PortfolioProjectService
    ,private Portfolioprojectimageservice:PortfolioImageService
    ,private certificatservice:CertificateService
    ,private BiddingProjects:BiddingProjectService
    ,private fixedprojects:FixedPriceProjectService
    ,private reviewservice:ReviewService
    ,private freelancerlanguages:FreelancerlanguageService,
    private sentimentService: SentimentService
){

}

showDeleteModal = false;
username: string = '';
picturesurl:string='';
error:string='';
profile!:SingularFreelancer;
freelancerskills:FreelancerSkill[]=[];
userEducation!:Education
mylanguages:FreelancerLanguage[]=[]

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.username = params['username'];
      // Now load the profile with username
      this.initializeForm();
      this.loadProfile();
      this.initializeskills();
      this.initializeNonrecommendedskills();
    });
        this.picturesurl=Files.filesUrl;
  this.currentuserid=this.authservice.getUserId();

  }
  userCertificates:Certificate[]=[]
  private loadCertificates() {
    this.certificatservice.getCertificateByUserName(this.profile.userName)
      .subscribe({
        next: (response: any) => {
          this.userCertificates = response;
  
        },
        error: (error) => {
          console.error('Error loading certificates:', error);
          this.toastr.error('Failed to load certificates');
        }
      });
  
  
  }

  private initializeForm() {
    this.editReviewForm = this.fb.group({
      rating: ['', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
nonrecommendedskills:nonrecommendedSkill[]=[]
  allskills:Skill[]=[]
  private initializeNonrecommendedskills(){
    this.SkillService.getnonRecommendedUserSkills().subscribe(
      {

        next:(data)=>this.nonrecommendedskills=data,
        error:(error)=>this.error=error
      }
    )
  }
  private initializeskills()
  {
   this.SkillService.getSkills().subscribe(
      {
        next:(data)=>{this.allskills=data;
        //   this.allskills = this.allskills.filter(s => 
        //     !this.freelancerskills.some(fs => fs.skillName === s.name)
        // );
        //   console.log(data);
        },
        error:(error)=>{
          this.error=error;
        }

      }
    )
  }


  loadLanguages(){
      this.freelancerlanguages.getFreelancerLanguageByUserName(this.profile.userName).subscribe(
        {
          next:(data:FreelancerLanguage[])=>{
            this.mylanguages=data;
           
          
          },
          error:(err:string)=>{
            this.error=err;
            this.toastr.error("failed to load languages");
          }
        }
      )
      // const allLanguages = Object.values(LanguageEnum);
      
      // Filter out languages that the freelancer already has
     
      
    }
  loadProfile() {
    this.account.getFreelancerByUsername(this.username).subscribe({
      next: (data) => {
        this.profile = data;
       console.log(data);
        Promise.all([
         
          this.loadEducation(),
          this.loadLanguages(),
          this.loadExperience(),
          this.loadPortofolioProjects(),
          this.loadCertificates(),
          this.loadBiddingProjects(),
          this.loadReviews()
        ]).catch(error => {
          console.error('Error loading profile data:', error);
        });
  

      console.log(this.profile,'hh');

      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.error=error;
      }
    }
    );



        this.SkillService.getUserSkills().subscribe(
          {
            next: (data) => {
        console.log(data);
        this.freelancerskills=data;
      },
      error: (error) => {
        console.error('Error fetching user skills:', error);
        // Handle error - maybe show a notification to user
      },
      complete: () => {
        // Optional: Handle completion
      }
    }
        )
      
  }


isProjectModalOpen: boolean = false;
  userPortfolioproject:freelancerportofolioprojects=[]
  editingProject: freelancerportofolioproject | null = null;
  imagePreviewUrls: string[] = [];
  projectimagesurl:string=projectImages.filesUrl;
  selectedProjectImages: File[] = [];
  carouselIntervals: { [key: number]: any } = {};
  loadPortofolioProjects(){

  this.portfolioprojectservice.getUserPortfolioProjects(this.profile.id).subscribe(
    {
      next:(data) =>{
        console.log("got hereeeee")
          this.userPortfolioproject = data
          console.log(data);
          data.forEach(project => {
            if (project.images?.length > 1) {
              this.startCarouselInterval(project);
            }
          });
          this.toastr.success('Portofolioprojects loaded successfully');

      } ,
      error:(err)=>{this.error=err
        console.log("got hereeeee")

        this.toastr.error('Error loading experiences');
      console.log(err)}
    }
  )
}
private startCarouselInterval(project: any) {
  // Clear existing interval if any
  if (this.carouselIntervals[project.id]) {
    clearInterval(this.carouselIntervals[project.id]);
  }
  
  // Set new interval
  this.carouselIntervals[project.id] = setInterval(() => {
    // Create a mock event object for the carousel
    const mockEvent = new Event('autoplay');
    this.nextImage(project);
  }, 3000); // Change image every 3 seconds
}

private stopCarouselInterval(projectId: number) {
  if (this.carouselIntervals[projectId]) {
    clearInterval(this.carouselIntervals[projectId]);
    delete this.carouselIntervals[projectId];
  }
}

currentImageIndex: { [key: number]: number } = {};

nextImage(project: any) {
  const currentIndex = this.currentImageIndex[project.id] || 0;
  this.currentImageIndex[project.id] = (currentIndex + 1) % project.images.length;
}

previousImage(project: any) {
  const currentIndex = this.currentImageIndex[project.id] || 0;
  this.currentImageIndex[project.id] = (currentIndex - 1 + project.images.length) % project.images.length;
}
ngOnDestroy() {
  // Clear all intervals when component is destroyed
  Object.keys(this.carouselIntervals).forEach(projectId => {
    this.stopCarouselInterval(Number(projectId));
  });
}

userExperiences:Experience[]=[]
  loadExperience(){
    if (!this.username) {
      this.toastr.error('Unable to load experience: User profile not available');
      return;
    }
    console.log(this.profile.userName)
  this.experienceservice.getExperienceByUserName(this.username).subscribe(
    {
      next:(data:Experience[]) =>{
        
        this.userExperiences = data
          this.toastr.success('Experiences loaded successfully');
        
      } ,
      error:(err)=>{this.error=err
        this.toastr.error('Error loading experiences');
        ////this.calculateProfileCompletion();
      console.log(err)}
    }
  )
}
  loadEducation(){
    if (!this.profile?.userName) {
      this.toastr.error('Unable to load education: User profile not available');
      return;
    }
  
    console.log("loading educationnnnnnnnnnnnnnnnnnn");
    console.log(this.profile.userName)
  this.educationservice.getEducationByUserName(this.username).subscribe(
    {
      next:(data:Education[]) =>{
        if (data && data.length > 0) {
          this.userEducation = data[0];
          this.toastr.success('Education loaded successfully');
        
      }
        console.log(data);
      }
      ,
      error:(err)=>{this.error=err
      console.log(err)}
    }
  )
  }
  countries:Country[]=[]
  cities:City[]=[]
  fixedProjects:FixedPriceProject[]=[]
  biddingprojects:BiddingProjectGetAll[]=[]



loadBiddingProjects(){
  this.BiddingProjects.GetuserBiddingprojects(this.profile.id).subscribe(
    {
      next:(data:BiddingProjectGetAll[])=>{
        this.biddingprojects=data;
      },
      error:(err)=>{
        this.error=err;
        this.toastr.error("failed to load bidding projects");
      }
    }
  )
  this.fixedprojects.getuserprojects(this.profile.id).subscribe(
    {
      next:(data:FixedPriceProject[])=>{
        this.fixedProjects=data;
      },
      error:(err)=>{
        this.error=err;
        this.toastr.error("failed to load bidding projects");
      }
    }
  )
  
}

setImage(projectId: number, index: number) {
  this.currentImageIndex[projectId] = index;
}

reviews:GetReviewsByRevieweeIdDto[]=[];
// loadReviews()
// {
//   this.reviewservice.getRevieweeById(this.profile.id).subscribe(
//     {
//       next:(data:GetReviewsByRevieweeIdDto[])=>{
//         this.reviews=data;
//       },
//       error:(err)=>{
//         this.error=err;
//         this.toastr.error("failed to load reviews");
//       }
//     }
//   )
// }
loadReviews() {
  this.reviewservice.getRevieweeById(this.profile.id).subscribe({
    next: (data: GetReviewsByRevieweeIdDto[]) => {
      // Process each review's sentiment
      const reviewPromises = data.map(review => 
        new Promise<GetReviewsByRevieweeIdDto>((resolve) => {
          if (review.comment) {
            this.sentimentService.analyze(review.comment).subscribe({ 
              next: (sentimentResponse) => {
                console.log('Sentiment:', sentimentResponse.prediction, 'Score:', sentimentResponse.probability)
                console.log('review:', review,)
                resolve({
                  ...review,
                  sentiment: sentimentResponse.prediction,
                  sentimentScore: sentimentResponse.probability,
                 
                });
              },
              error: () => resolve(review) // Keep original review if sentiment analysis fails
            });
          } else {
            resolve(review);
          }
        })
      );

      // Wait for all sentiment analyses to complete
      Promise.all(reviewPromises).then(analyzedReviews => {
        this.reviews = analyzedReviews;
      });
    },
    error: (err) => {
      this.error = err;
      this.toastr.error("Failed to load reviews");
    }
  });
}










getSentimentLabel(sentimentPrediction: string): string {
  if (!sentimentPrediction) return 'Unknown';
  
  const sentiment = sentimentPrediction.toLowerCase().trim();
  switch (sentiment) {
    case 'positive':
      return 'Positive';
    case 'negative':
      return 'Negative';
    case 'neutral':
      return 'Neutral';
    default:
      return 'Unknown';
  }
}


editReview(review: any) {
  this.selectedReview = review;
  this.selectedReview.revieweeId=this.profile.id;
  console.log(this.selectedReview,'asfafffffffffffffffffffffffffffffffffffffffffffffff')
  this.editReviewForm.patchValue({
    rating: review.rating,
    comment: review.comment
  });
}

// updateReview() {
//   if (this.editReviewForm.valid && this.selectedReview) {
//     const updatedReview = {
//       ...this.selectedReview,
//       rating: this.editReviewForm.get('rating')?.value,
//       comment: this.editReviewForm.get('comment')?.value
      
//     };

//     // Call your review service to update
//     this.reviewservice.updateReview(updatedReview.id,updatedReview).subscribe({
//       next: () => {
//         // Update the review in the list
//         const index = this.reviews.findIndex(r => r.id === this.selectedReview.id);
//         if (index !== -1) {
//           this.reviews[index] = updatedReview;
//         }
//         this.closeEditModal();
//         this.toastr.success('Review updated successfully');
//       },
//       error: (error) => {
//         console.error('Error updating review:', error);
//         this.toastr.error('Failed to update review');
//       }
//     });
//   }
// }

updateReview() {
  if (this.editReviewForm.valid && this.selectedReview) {
    // First analyze sentiment
    this.sentimentService.analyze(this.editReviewForm.get('comment')?.value).subscribe({
      next: (response) => {
        if (response && response.prediction !== undefined) {
          const updatedReview = {
            ...this.selectedReview,
            rating: this.editReviewForm.get('rating')?.value,
            comment: this.editReviewForm.get('comment')?.value,
            sentiment: response.prediction,
            sentimentScore: response.probability
          };

          this.reviewservice.updateReview(updatedReview.id, updatedReview).subscribe({
            next: () => {
              // Update the review in the reviews array
              const index = this.reviews.findIndex(r => r.id === updatedReview.id);
              if (index !== -1) {
                this.reviews[index] = updatedReview;
              }
              this.closeEditModal();
              this.toastr.success('Review updated successfully');
            },
            error: (error) => {
              console.error('Error updating review:', error);
              this.toastr.error('Failed to update review');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error analyzing sentiment:', error);
        this.toastr.error('Failed to analyze sentiment');
      }
    });
  }
}

closeEditModal() {
  this.selectedReview = null;
  this.editReviewForm.reset();
}


editReviewForm!: FormGroup;
selectedReview: any = null;
private initializeEditForm() {
  this.editReviewForm = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });
}



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
  this.reviewservice.deleteReview(this.reviewToDelete).subscribe({
    next: () => {
      // Remove the review from the array
      this.reviews = this.reviews.filter(review => review.id !== this.reviewToDelete);
      
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
      this.toastr.success('Review deleted successfully');
    },
    error: (error) => {
      console.error('Error deleting review:', error);
      this.toastr.error('Failed to delete review');
      this.closeDeleteModal();
    }
  });
}
}
}
