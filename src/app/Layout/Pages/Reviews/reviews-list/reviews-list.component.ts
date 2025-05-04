import { Component, OnInit } from '@angular/core';
import { Review } from '../../../../Shared/Interfaces/Reviews';
import { ReviewService } from '../../../../Shared/Services/Review/review.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviews-list',
  imports: [FormsModule,CommonModule],
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css'
})
export class ReviewsListComponent implements OnInit {
  reviews: Review[] = [];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }
  getSentimentLabel(sentimentPrediction: string): string {
    switch (sentimentPrediction?.toLowerCase()) {
    
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
  
  loadReviews() {
    this.reviewService.getAllReviews().subscribe(
      (reviews: Review[]) => {
        this.reviews = reviews; 
        console.log('reviews:', reviews)
      },
     
      (error) => {
        console.error('Error loading reviews:', error);
      }
    );
  }

  
}