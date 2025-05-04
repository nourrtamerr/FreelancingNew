import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/Services/Auth/auth.service';
import { CategoryService } from '../../Shared/Services/Category/category.service';
import { ProjectsService } from '../../Shared/Services/Projects/projects.service';
import { map, Observable } from 'rxjs';
import { Category } from '../../Shared/Interfaces/category';
import { SubCategoryService } from '../../Shared/Services/SubCategory/sub-category.service';
import { SubCategory2 } from '../../Shared/Interfaces/sub-category2';
import { BiddingProjectService } from '../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetAll } from '../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { ReviewService } from '../../Shared/Services/Review/review.service';
import { Review } from '../../Shared/Interfaces/Reviews';

@Component({
  selector: 'app-home',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private AuthService:AuthService,
     private categoryService: CategoryService,
      private projectService:ProjectsService,
      private subcategoryService:SubCategoryService,
      private biddingProjectService: BiddingProjectService,
      private reviweService:ReviewService
    ) { }


    categories:Category[]=[];
    categoryProjectCounts: {[key: number]: number} = {};
    
    SubCategories: SubCategory2[] = []; 
    SubcategoryProjectCounts: {[key: number]: number} = {};

    LatestBiddings: BiddingProjectGetAll[]=[];

    reviews: Review[]=[]

    allProjects: BiddingProjectGetAll[] = []; // Store all projects
    // LatestBiddings: BiddingProjectGetAll[] = [];
  
    searchTerm = '';
    searchResults: any[] = [];
    showSuggestions = false;


  ngOnInit(): void {
    
    console.log('UserId :',this.AuthService.getUserId() );

    this.categoryService.GetAllCategories().subscribe({
      next: (data)=>{
        this.categories = data.slice(0, 8);
        this.loadProjectCounts();
      },
      error: (err)=>{
        console.log('Error :',err );
      }
    })

    // this.biddingProjectService.GetAllBiddingProjects({},1,100).subscribe({
    //   next: (response) => {
    //     this.allProjects = response;
    //     this.LatestBiddings = response.slice(0, 3).sort((a, b) => b.postedFrom - a.postedFrom);
    //   },
    //   error: (err) => {
    //     console.log('Error loading projects:', err);
    //   }
    // })

    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.allProjects = data;
       
      },

      error: (err) => {
        console.log('Error loading latest projects:', err);
      }

    })
    


    this.biddingProjectService.GetAllBiddingProjects({}, 1, 3).subscribe({
      next: (response) => {
        this.LatestBiddings = response;
        // Sort by posted date to ensure latest first
        this.LatestBiddings.sort((a, b) => b.postedFrom - a.postedFrom);
      },
      error: (err) => {
        console.log('Error loading latest projects:', err);
      }
    });

    this.reviweService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data.slice(0, 3);
      },
      error: (err) => {
        console.log('Error loading reviews', err);
      }
    })
  }

  loadProjectCounts() {
    this.categories.forEach(cat => {
      this.projectService.GetProjectsByCategoryId(cat.id).subscribe(
        projects => this.categoryProjectCounts[cat.id] = projects.length
      );
    });

    this.subcategoryService.getAllSubcategories().subscribe({
      next: (data)=>{
        this.SubCategories = data;
      },
      error: (err)=>{
        console.log('Error :',err );
      }
    })
  }
  
  GetNumOfProjects(categoryId: number): number {
    return this.categoryProjectCounts[categoryId] || 0;
  }

  getSubcategoriesOfCategory(categoryId:number){
    return this.SubCategories.filter(sc=>sc.categoryId==categoryId).length;
  }


  // GetNumOfProjects(categoryId: number): Observable<number> {
  //   return this.projectService.GetProjectsByCategoryId(categoryId).pipe(
  //     map(projects => projects.length)
  //   );
  // }





  trendingTags = [
    'website development',
    'architecture & interior design',
    'UGC videos',
    'presentation design'
  ];

  browseCategories = [
    { name: 'Development & IT', rating: 4.85, skills: 1853 },
    { name: 'AI Services', rating: 4.8, skills: 294 },
    { name: 'Design & Creative', rating: 4.91, skills: 968 },
    { name: 'Sales & Marketing', rating: 4.77, skills: 392 },
    { name: 'Writing & Translation', rating: 4.92, skills: 505 },
    { name: 'Admin & Customer Support', rating: 4.77, skills: 508 },
    { name: 'Finance & Accounting', rating: 4.79, skills: 214 },
    { name: 'Engineering & Architecture', rating: 4.85, skills: 650 }
  ];
  featuredProjects = [
    {
      id: 1,
      title: 'Build a Responsive Landing Page',
      projectType: 'Bidding',
      description: 'Looking for a frontend developer to build a modern, responsive landing page for our new product.',
      experienceLevel: 'Intermediate',
      minimumPrice: 200,
      maximumprice: 500,
      numOfBids: 12,
      projectSkills: ['HTML', 'CSS', 'Angular']
    },
    {
      id: 2,
      title: 'E-commerce Website Backend',
      projectType: 'Fixed Price',
      description: 'Need a backend developer to create APIs for an e-commerce platform.',
      experienceLevel: 'Expert',
      minimumPrice: 1000,
      maximumprice: 2000,
      numOfBids: 8,
      projectSkills: ['Node.js', 'Express', 'MongoDB']
    },
    {
      id: 3,
      title: 'Logo & Brand Identity Design',
      projectType: 'Bidding',
      description: 'Seeking a creative designer for a new brand identity and logo.',
      experienceLevel: 'Beginner',
      minimumPrice: 100,
      maximumprice: 300,
      numOfBids: 15,
      projectSkills: ['Logo Design', 'Branding', 'Illustrator']
    }
  ];



  testimonials = [
    {
      name: 'Sarah M.',
      role: 'Startup Founder',
      avatar: 'images/r2.avif',
      text: 'This platform helped me find the perfect developer for my app. Fast, reliable, and professional!'
    },
    {
      name: 'James L.',
      role: 'Marketing Director',
      avatar: 'images/r1.jpg',
      text: 'We got our branding and website done in record time. Highly recommended for any business!'
    },
    {
      name: 'Aisha K.',
      role: 'Freelance Designer',
      avatar: 'images/r3.jpg',
      text: 'I love working here. The clients are great and the payment system is secure and easy.'
    }
  ];

  // onSearch() {
  //   if (!this.searchTerm.trim()) {
  //     // If search is empty, show latest 3 projects
  //     this.LatestBiddings = this.allProjects.slice(0, 3)
  //       .sort((a, b) => b.postedFrom - a.postedFrom);
  //     return;
  //   }

  //   const searchTermLower = this.searchTerm.toLowerCase();
  //   const filteredProjects = this.allProjects.filter(project => 
  //     project.title.toLowerCase().includes(searchTermLower) ||
  //     project.description.toLowerCase().includes(searchTermLower)
  //   );

  //   this.LatestBiddings = filteredProjects.slice(0, 3)
  //     .sort((a, b) => b.postedFrom - a.postedFrom);
  // }


  onSearch() {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      this.showSuggestions = false;
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.searchResults = this.allProjects
      .filter(project => 
        project.title.toLowerCase().includes(searchTermLower) ||
        project.description.toLowerCase().includes(searchTermLower)
      )
      .slice(0, 5); // Show only top 5 suggestions
    
    this.showSuggestions = true;
  }

  // Add new method to handle suggestion click
  onSuggestionClick(project: any) {
    this.showSuggestions = false;
    this.searchTerm = '';
  }



}
