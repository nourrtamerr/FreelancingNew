import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Chat, UsersOnline } from '../../Interfaces/Chat';
import { AuthService } from '../Auth/auth.service';
import { Form } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  public hubConnection!: HubConnection;
  private apiUrl = Environment.baseUrl;
  private destroy$ = new Subject<void>();


  
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  isConnected$ = new BehaviorSubject<boolean>(false);
  private messages$ = new BehaviorSubject<Chat[]>([]);

  public connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeSignalRConnection();
    this.setupHubListeners();
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
        .catch((err: unknown) => {
          console.error('SignalR Connection Error:', err);
          this.connectionStatus$.next(false);
        });
  
    } catch (error) {
      console.error('SignalR Initialization Error:', error);
      this.connectionStatus$.next(false);
    }


  }

  // Add to ChatService
private setupHubListeners() {
  this.hubConnection.onclose(() => {
    this.connectionStatus$.next(false);
    console.warn('SignalR connection closed');
  });

  this.hubConnection.onreconnected(() => {
    this.connectionStatus$.next(true);
    console.log('SignalR reconnected');
  });

  this.hubConnection.on("UserStatusChanged", (userId: string, isOnline: boolean) => {
    const currentUsers = this.onlineUsersSubject.value;
    if (isOnline) {
      if (!currentUsers.includes(userId)) {
        this.onlineUsersSubject.next([...currentUsers, userId]);
      }
    } else {
      this.onlineUsersSubject.next(currentUsers.filter(u => u !== userId));
    }
  });
}
  

  getMessages(): Observable<Chat[]> {
    return this.messages$.asObservable();
  }

  sendMessage(message: FormData): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}Chat`, message).pipe(
      tap(newMessage => {
        const currentMessages = this.messages$.value;
        this.messages$.next([...currentMessages, newMessage]);
      }),
      takeUntil(this.destroy$)
    );
  }

  // Read
  getUnreadMessagesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}Chat/unread-count`);
  }

  // Update
  markMessagesAsRead(conversationId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}Chat/mark-conversation-read/${conversationId}`, {}
    ).pipe(takeUntil(this.destroy$));
  }
  updateMessage(messageId: number, newText: string): Observable<Chat> {
    return this.http.put<Chat>(
      `${this.apiUrl}Chat/update-message`,
      { messageId, newMessage: newText }
    );
  }
  // Delete
  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}Chat/${messageId}`).pipe(
      tap(() => {
        const filtered = this.messages$.value.filter(msg => msg.id !== messageId);
        this.messages$.next(filtered);
      }),
      takeUntil(this.destroy$)
    );
  }

  // Real-time read status updates
  listenForReadReceipts(): void {
    this.hubConnection.on("MessageRead", (messageId: number) => {
      const messages = this.messages$.value.map(msg => 
        msg.id === messageId ? {...msg, isRead: true} : msg
      );
      this.messages$.next(messages);
    });
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
      this.hubConnection.stop().catch((err: unknown)=> 
        console.error('SignalR disconnect error:', err));
    }
  }
  getAllConversations(username: string): Observable<Chat[]> {
    const url = `${this.apiUrl}Chat/conversations/${username}`;
    console.log('Fetching conversations from:', url); // Debug
    return this.http.get<Chat[]>(url).pipe(
      takeUntil(this.destroy$)
    );
  }

 
  fetchAndSetOnlineUsers(): Observable<string[]> {
    return this.http.get<any[]>(`${this.apiUrl}Chat/online-users`).pipe(
      map(users => users.map(u => u.userId)), 
      tap(userIds => this.onlineUsersSubject.next(userIds))
    );
  }
}