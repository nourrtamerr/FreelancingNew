import { Component, OnInit } from '@angular/core';
import { BiddingProjectService } from '../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetById } from '../../Shared/Interfaces/BiddingProject/bidding-project-get-by-id';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { TimeAgoPipe } from '../../Pipes/time-ago.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { map } from 'rxjs/operators';
import { TimeLeftPipe } from '../../Pipes/time-left.pipe';
import { GetReviewsByRevieweeIdDto } from '../../Shared/Interfaces/get-reviews-by-reviewee-id-dto';
import { ReviewService } from '../../Shared/Services/Review/review.service';
import { FixedPriceProjectService } from '../../Shared/Services/FixedPriceProject/fixed-price-project.service';

@Component({
  selector: 'app-bidding-project-details',
  imports: [RouterModule, TimeAgoPipe, FormsModule, CommonModule, TimeLeftPipe],
  templateUrl: './bidding-project-details.component.html',
  styleUrl: './bidding-project-details.component.css'
})
export class BiddingProjectDetailsComponent implements OnInit {

  constructor(private biddingProjectDetailsService:BiddingProjectService,
     private route:ActivatedRoute,
    private ReviewsService:ReviewService,
    private FixedService:FixedPriceProjectService
    ){}


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
  endDate:''
};


  clientOtherProjNameId: {id:number, title:string, projectType:string} []=[];

  // ngOnInit(): void {

  //   const code = +this.route.snapshot.paramMap.get('id')!

  //   this.biddingProjectDetailsService.GetBiddingProjectById(code).subscribe({
  //     next:(data)=>{
  //       this.project=data;
  //     },
  //     error:(err)=> console.log(err)
  //   })


  // }

  clientReviews: GetReviewsByRevieweeIdDto[]=[];


  ngOnInit(): void {
    // const code = +this.route.snapshot.paramMap.get('id')!;
    this.route.paramMap.subscribe(params => {
      const id = +params.get('id')!;
      this.loadNgOnIt(id);
    });
  

  }

  private loadNgOnIt(id:number):void{
    this.biddingProjectDetailsService.GetBiddingProjectById(id).subscribe({
      next: (data) => {
        this.project = data;


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
          for (let projectId of this.project.clientOtherProjectsIdsNotAssigned) {
            if(projectId !== id){
              this.biddingProjectDetailsService.GetBiddingProjectById(projectId)
            
              .subscribe({
                next: (data) => {
                  console.log(data)
                  if(data != null){
                    this.clientOtherProjNameId.push(data);
                    // If you want to store multiple, use an array instead
                    console.log(this.project.clinetAccCreationDate)

                  }
                  else{
                    console.log("data is null")
                    this.FixedService.getProjectById(projectId) .pipe(
                      map(proj => ({ id: proj.id, title: proj.title, projectType:'Fixed Price' })) // select only id and title (as name)
                    ).subscribe({
                      next: (data)=> {
                        this.clientOtherProjNameId.push(data);
                      },
                      error: (err)=> {console.log(err), console.log("niwnfoinewio")}
                    })
                   
                  }
                }

              });
            }
           
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

}
