import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SentimentService {
  constructor(private http: HttpClient) {}

  // analyze(text: string) {
  //   return this.http.post<any>('https://localhost:7093/api/sentiment/analyze', {
  //     text: text
  //   });
  // }

  analyze(text: string): Observable<{ prediction: string; probability: number }> {
    return this.http.post<{ prediction: string; probability: number }>(
      'https://localhost:7093/api/sentiment/analyze', 
      { Text: text }  // Match the C# model property name
    );
  }
}
