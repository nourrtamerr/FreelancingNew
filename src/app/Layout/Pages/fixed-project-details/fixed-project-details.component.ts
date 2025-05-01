import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-fixed-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fixed-project-details.component.html',
  styleUrl: './fixed-project-details.component.css'
})
export class FixedProjectDetailsComponent implements OnInit {
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
    private toaster:ToastrService
  ) {}

  clientReviews: GetReviewsByRevieweeIdDto[]=[];

  clientOtherProjNameId: {id:number, title:string, projectType:string} []=[];
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectid = +params['id'];
      this.loadProjectDetails();
    });

    
  }

  loadProjectDetails(): void {
    this.projectService.getProjectById(this.projectid).subscribe({
      next: (data) => {
        this.project = data;
        console.log('Project details:', data);


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
          for (let projectId of this.project.clientOtherProjectsIdsNotAssigned) {
            this.projectService.getProjectById(projectId).subscribe({
              next: (projectData) => {
                if(projectData!=null){
                  console.log('awl if')
                  this.clientOtherProjNameId.push({ id: projectData.id, title: projectData.title, projectType: projectData.projectType });
                  console.log(this.clientOtherProjNameId)

                }
                else{
                  this.BiddingProjectService.GetBiddingProjectById(projectId).subscribe({
                    next: (projectData) => {
                      this.clientOtherProjNameId.push({ id: projectData.id, title: projectData.title, projectType: projectData.projectType });
                    },
                    error: (error) => {
                      console.error('vvvvvvvvvvvvvvvvv', error);
                    }
                  });
                }
              },
              error: (error) => {
               
                console.error('Error fetching project details:', error);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error fetching project details:', error);
      }
    });

    
  }

  AddToWishlist(projectid:number){
    this.wishlistService.AddToWishlist(projectid).subscribe({
      next:()=>{
        this.toaster.success("Added to wishlist")
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }
}
