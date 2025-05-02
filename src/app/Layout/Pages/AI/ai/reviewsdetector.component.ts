import { Component } from '@angular/core';
import { ProjectsService } from '../../../../Shared/Services/Projects/projects.service';
import { ProjectAI } from '../../../../Shared/Interfaces/ProjectAI';
import { SentimentService } from '../../../../Shared/Services/AI/Sentimentservice.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai',
  imports: [CommonModule,FormsModule],
  templateUrl: './reviewsdetector.component.html',
  styleUrl: './reviewsdetector.component.css'
})
export class ReviewsDetectorComponent {
  reviewText = '';
  sentiment = '';

  constructor(private sentimentService: SentimentService) {}

  analyzeReview() {
    this.sentimentService.analyze(this.reviewText).subscribe(response => {
      this.sentiment = `This review is ${response.prediction} (Confidence: ${(response.probability * 100).toFixed(2)}%)`;
    });
  }
}
