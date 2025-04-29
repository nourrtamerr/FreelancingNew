import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Chat } from '../../Interfaces/Chat';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private hubConnection!: HubConnection;
  private apiUrl = Environment.baseUrl;
  private destroy$ = new Subject<void>();

  private onlineUsers$ = new BehaviorSubject<string[]>([]);
  private messages$ = new BehaviorSubject<Chat[]>([]);
  private connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeSignalRConnection();
  }
  private initializeSignalRConnection(): void {
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(Environment.signalRUrl, { 
          accessTokenFactory: () => {
            const token = this.authService.getTokenFromCookie();
            if (!token) {
              console.warn('No auth token available');
              return '';
            }
            return token;
          }
        })
        .withAutomaticReconnect()
        .build();
  
      this.hubConnection.start()
        .then(() => {
          console.log('SignalR Connected');
          this.connectionStatus$.next(true);
        })
        .catch(err => {
          console.error('SignalR Connection Error:', err);
          this.connectionStatus$.next(false);
        });
  
    } catch (error) {
      console.error('SignalR Initialization Error:', error);
      this.connectionStatus$.next(false);
    }
  }
    // Public API
  get connectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  getMessages(): Observable<Chat[]> {
    return this.messages$.asObservable();
  }

  getOnlineUsers(): Observable<string[]> {
    return this.onlineUsers$.asObservable();
  }

  sendMessage(message: Chat): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}Chat`, message).pipe(
      takeUntil(this.destroy$)
    );
  }

  getChatById(id: number): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}Chat/${id}`).pipe(
      takeUntil(this.destroy$)
    );
  }

  deleteChat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}Chat/${id}`).pipe(
      takeUntil(this.destroy$)
    );
  }

  getConversations(SenderId: string, ReceiverId: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}Chat/conversation/${SenderId}/${ReceiverId}`);
  }
  

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}Chat/mark-as-read/${id}`, {}
    ).pipe(takeUntil(this.destroy$));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => 
        console.error('SignalR disconnect error:', err));
    }
  }

}