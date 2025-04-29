import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/Services/Auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private AuthService:AuthService) { }
  ngOnInit(): void {
    ;
    console.log('UserId :',this.AuthService.getUserId() );
  }
  searchTerm = '';

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

  categories = [
    { name: 'Programming & Tech', icon: 'fa fa-laptop-code', description: 'Web, mobile, and software development.' },
    { name: 'Graphics & Design', icon: 'fa fa-paint-brush', description: 'Logos, branding, and creative design.' },
    { name: 'Digital Marketing', icon: 'fa fa-bullhorn', description: 'SEO, social media, and advertising.' },
    { name: 'Writing & Translation', icon: 'fa fa-pen-nib', description: 'Content, copywriting, and translation.' },
    { name: 'Video & Animation', icon: 'fa fa-video', description: 'Explainers, animation, and video editing.' },
    { name: 'Music & Audio', icon: 'fa fa-music', description: 'Voice over, mixing, and audio production.' },
    { name: 'Business', icon: 'fa fa-briefcase', description: 'Business plans, consulting, and research.' },
    { name: 'Consulting', icon: 'fa fa-user-tie', description: 'Strategy, operations, and management.' }
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

  onSearch() {
    // Implement your search logic or navigation here
    alert('Searching for: ' + this.searchTerm);
  }
}
