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


  private peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  remoteStream$ = this.remoteStreamSubject.asObservable();
  private videoCallStatusSubject = new BehaviorSubject<string>('idle');
  videoCallStatus$ = this.videoCallStatusSubject.asObservable();
  private currentReceiverId: string = '';


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



  this.hubConnection.on("ReceiveVideoCall", (callerId: string) => {
    this.videoCallStatusSubject.next(`incoming:${callerId}`);
  });

  this.hubConnection.on("ReceiveOffer", async (senderId: string, offer: any) => {
    await this.handleOffer(senderId, offer);
  });

  this.hubConnection.on("ReceiveAnswer", async (senderId: string, answer: any) => {
    await this.handleAnswer(answer);
  });

  this.hubConnection.on("ReceiveIceCandidate", async (senderId: string, candidate: any) => {
    await this.handleIceCandidate(candidate);
  });

  this.hubConnection.on("VideoCallEnded", () => {
    this.stopVideoCall();
  });

}
  
async startVideoCall(receiverId: string): Promise<void> {
  try {
    this.currentReceiverId = receiverId;
    this.videoCallStatusSubject.next('initiating');
    await this.initializePeerConnection();
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localStream.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.localStream!));

    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    await this.hubConnection.invoke("InitiateVideoCall", receiverId);
    await this.hubConnection.invoke("SendOffer", receiverId, offer);
    this.videoCallStatusSubject.next('calling');
  } catch (error) {
    console.error('Error starting video call:', error);
    this.videoCallStatusSubject.next('error');
  }
}

async acceptVideoCall(callerId: string): Promise<void> {
  try {
    this.currentReceiverId = callerId;
    this.videoCallStatusSubject.next('accepting');
    await this.initializePeerConnection();
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localStream.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.localStream!));
    this.videoCallStatusSubject.next('active');
  } catch (error) {
    console.error('Error accepting video call:', error);
    this.videoCallStatusSubject.next('error');
  }
}

async handleOffer(senderId: string, offer: any): Promise<void> {
  try {
    if (!this.peerConnection) {
      await this.initializePeerConnection();
    }
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    await this.hubConnection.invoke("SendAnswer", senderId, answer);
  } catch (error) {
    console.error('Error handling offer:', error);
  }
}

async handleAnswer(answer: any): Promise<void> {
  try {
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Error handling answer:', error);
  }
}

async handleIceCandidate(candidate: any): Promise<void> {
  try {
    await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
}

async stopVideoCall(): Promise<void> {
  if (this.localStream) {
    this.localStream.getTracks().forEach(track => track.stop());
    this.localStream = null;
  }
  if (this.peerConnection) {
    this.peerConnection.close();
    this.peerConnection = null;
  }
  this.remoteStreamSubject.next(null);
  this.videoCallStatusSubject.next('idle');
  this.currentReceiverId = '';
}

private async initializePeerConnection(): Promise<void> {
  this.peerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
      // Add TURN server for production if needed
    ]
  });

  this.peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      this.hubConnection.invoke("SendIceCandidate", this.currentReceiverId, event.candidate);
    }
  };

  this.peerConnection.ontrack = (event) => {
    const remoteStream = event.streams[0];
    this.remoteStreamSubject.next(remoteStream);
  };
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
    // Single message read receipt
    this.hubConnection.on("MessageRead", (messageId: number) => {
      const messages = this.messages$.value.map(msg => 
        msg.id === messageId ? {...msg, isRead: true} : msg
      );
      this.messages$.next(messages);
    });
  
    // Bulk messages read receipt (add this)
    this.hubConnection.on("MessagesRead", (readMessageIds: number[]) => {
      const messages = this.messages$.value.map(msg => 
        readMessageIds.includes(msg.id) ? {...msg, isRead: true} : msg
      );
      this.messages$.next(messages);
    });
  }

  getChatById(id: number): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}Chat/${id}`).pipe(
      takeUntil(this.destroy$)
    );
  }

  deleteConversation(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}Chat/conversations/${username}`);
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