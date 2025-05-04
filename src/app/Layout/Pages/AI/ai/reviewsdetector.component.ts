import { Component } from '@angular/core';
import { SentimentService } from '../../../../Shared/Services/AI/Sentimentservice.service';
import { ReviewService } from '../../../../Shared/Services/Review/review.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai',
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewsdetector.component.html',
  styleUrls: ['./reviewsdetector.component.css']
})
export class ReviewsDetectorComponent {
  reviewText = '';
  sentiment = '';
  sentimentScore: number = 0;

  constructor(
    private sentimentService: SentimentService,
    private reviewService: ReviewService
  ) {}

  analyzeReview() {
    if (!this.reviewText) {
      console.error("Review text is empty");
      return;
    }

    // Define the review object
    const review = {
      comment: this.reviewText,
      rating: 5, 
      revieweeId: '021ff14f-842c-4134-8780-fb1e670aba10', 
      revieweeName: 'Malak',
      reviewerId: 'ffab7506-7d37-4d1b-bc7c-eb45d893e9b4', 
      reviewerName: 'Client', 
      projectId: 8 
    };

    // Call the sentiment analysis service
    this.sentimentService.analyze(this.reviewText).subscribe(
      (response) => {
        // Handle the sentiment analysis response
        console.log('Sentiment Analysis Response:', response);
        if (response && response.prediction && response.probability !== undefined) {
          this.sentiment = response.prediction;
          this.sentimentScore = response.probability;

          // Display sentiment info
          console.log(`Sentiment: ${this.sentiment} (Confidence: ${(this.sentimentScore * 100).toFixed(2)}%)`);

          // Add the review with sentiment data
          this.reviewService.addReview(review).subscribe(
            (response) => {
              console.log('Review added successfully:', response);
              this.reviewText = ''; // Clear the input field after submitting
            },
            (error) => {
              console.error('Error adding review:', error);
            }
          );
        } else {
          console.error('Invalid sentiment analysis response');
        }
      },
      (error) => {
        console.error('Error analyzing review:', error);
        this.sentiment = 'Error';
        this.sentimentScore = 0;
      }
    );
  }
}
