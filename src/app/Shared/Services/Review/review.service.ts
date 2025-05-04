import { mergeMap, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Review } from '../../Interfaces/Reviews';
import { GetReviewsByRevieweeIdDto } from '../../Interfaces/get-reviews-by-reviewee-id-dto';
import { SentimentService } from '../AI/Sentimentservice.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
 private apiUrl = `${Environment.baseUrl}`;
  constructor(private  _HttpClient:HttpClient,private sentimentService: SentimentService  ) { }

  getReviewById(id: number): Observable<Review> {
    return this._HttpClient.get<Review>(`${this.apiUrl}Reviews/${id}`);
  }

  // getRevieweeById(id: number): Observable<Review[]> {
  //   return this._HttpClient.get<Review[]>(`${this.apiUrl}Reviews/reviewee/${id}`);
  // }

  getRevieweeById(id: string): Observable<GetReviewsByRevieweeIdDto[]> {
    return this._HttpClient.get<GetReviewsByRevieweeIdDto[]>(`${this.apiUrl}Reviews/reviewee/${id}`);
  }

  getbyprojectId(id: number): Observable<GetReviewsByRevieweeIdDto[]> {
    return this._HttpClient.get<GetReviewsByRevieweeIdDto[]>(`${this.apiUrl}Reviews/project/${id}`);
  }

  getReviewerById(id: string): Observable<Review[]> {
    return this._HttpClient.get<Review[]>(`${this.apiUrl}Reviews/reviewer/${id}`);
  }
  getAllReviews(): Observable<Review[]> {
    return this._HttpClient.get<Review[]>(`${this.apiUrl}Reviews`);
  }

  //  addReview(review: Review): Observable<Review> {
  //   return this._HttpClient.post<Review>(`${this.apiUrl}Reviews`, review);
  // }
  // addReview(review: Review): Observable<Review> {
  //   return this.sentimentService.analyze(review.comment).pipe(
  //     mergeMap(sentimentResponse => {
  //       review.sentiment = sentimentResponse.prediction;
  //       review.sentimentScore = sentimentResponse.probability;
  //       return this._HttpClient.post<Review>(`${this.apiUrl}Reviews`, review);
  //     })
  //   );
  // }

  addReview(review: Review): Observable<Review> {
    return this.sentimentService.analyze(review.comment).pipe(
      mergeMap(sentimentResponse => {
        // Attach sentiment data to the review object
        review.sentiment = sentimentResponse.prediction;
        review.sentimentScore = sentimentResponse.probability;

        // Now post the review along with sentiment analysis result
        return this._HttpClient.post<Review>(`${this.apiUrl}Reviews`, review);
      })
    );
  }

  
  
  updateReview(id:number,review: Review): Observable<Review> {
    return this._HttpClient.put<Review>(`${this.apiUrl}Reviews/${id}`, review);
  }
  deleteReview(id: number): Observable<void> {
    console.log(id);
    return this._HttpClient.delete<void>(`${this.apiUrl}Reviews/${id}`);
  }
}
