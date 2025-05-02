import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SentimentService {
  constructor(private http: HttpClient) {}

  analyze(text: string) {
    return this.http.post<any>('https://localhost:7093/api/sentiment/analyze', {
      text: text
    });
  }
}
