import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat } from '../../Interfaces/Chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${Environment.baseUrl}`;
  constructor(private _HttpClient:HttpClient) { }

  getChatById(id: number):Observable<Chat> {
    return this._HttpClient.get<Chat>(`${this.apiUrl}Chat/${id}`);
  }

  deleteChat(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}Chat/${id}`);
  }

  getConversations(SenderId: string, ReceiverId: string): Observable<Chat[]> {
    return this._HttpClient.get<Chat[]>(`${this.apiUrl}Chat/conversations/${SenderId}/${ReceiverId}`);
  }


  CreateChat(chat: Chat): Observable<Chat> {
    return this._HttpClient.post<Chat>(`${this.apiUrl}Chat`, chat);
  }

  getAllConversations(userId: string): Observable<Chat[]> {
    return this._HttpClient.get<Chat[]>(`${this.apiUrl}Chat/conversations/${userId}`);
  }
  MarkAsRead(id:number): Observable<Chat[]> {
    return this._HttpClient.put<Chat[]>(`${this.apiUrl}Chat/mark-as-read/${id}`, null);
  }

  getAllUserOnline(): Observable<any[]> {
    return this._HttpClient.get<any[]>(`${this.apiUrl}Chat/online-users`);
  }
}
