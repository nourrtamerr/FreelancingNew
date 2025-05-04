import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatResponse } from '../../Interfaces/ChatResponse';
import { Environment } from '../../../base/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${Environment.baseUrl}chatbot/chat`;

  constructor(private http: HttpClient) {}

 
  sendPrompt(prompt: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { prompt });
  }
}
