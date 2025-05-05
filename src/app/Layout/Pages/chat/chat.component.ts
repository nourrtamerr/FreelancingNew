import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../Shared/Services/Chat/chat.service';
import { AuthService } from './../../../Shared/Services/Auth/auth.service';
import { Subscription } from 'rxjs';
import { Chat } from '../../../Shared/Interfaces/Chat';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Files } from '../../../base/environment';
import { AccountService } from '../../../Shared/Services/Account/account.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe, CommonModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('ringAudio') ringAudioElement!: ElementRef<HTMLAudioElement>;
  messages: Chat[] = [];
  conversations: Chat[] = [];
  newMessage = '';
  selectedFile: File | null = null;
  receiverId: string = '';
  receiverUsername: string = '';
  currentUserId: string;
  currentUsername: string;
  isConnected = false;
  filesurl: string = '';
  selectedImage: string | null = null;
  showSidebar = false;
  truereceiverid: string = "";
  receiverImage: string | null = '';
  private subscriptions = new Subscription();
  isTyping = false;
  typingTimeout: any;
  onlineUsers: string[] = [];
  showDeleteModal = false;
  messageToDelete: number | null = null;
  editingMessageId: number | null = null;
  editedMessageText = '';
  videoCallStatus: string = 'idle';
  showVideoCall = false;

  constructor(
    private authService: AuthService,
    public chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {
    this.currentUserId = this.authService.getUserId() ?? '';
    this.currentUsername = this.authService.getUserName() ?? '';
  }

  ngOnInit(): void {
    this.filesurl = Files.filesUrl;
    this.receiverId = this.route.snapshot.paramMap.get('username') ?? "";
    this.receiverUsername = this.receiverId;

    this.setupInitialConnection();
    this.loadConversations();
    this.loadReceiverImage();

    this.chatService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });

    this.chatService.fetchAndSetOnlineUsers();
    this.chatService.listenForReadReceipts();

    this.chatService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
      if (status) {
        this.chatService.fetchAndSetOnlineUsers().subscribe(() => {
          this.loadConversation(this.receiverId);
        });
      }
    });

    this.chatService.videoCallStatus$.subscribe(status => {
      this.videoCallStatus = status;
      this.showVideoCall = status !== 'idle' && status !== 'error';
      if (status.startsWith('incoming:')) {
        const callerId = status.split(':')[1];
        this.playRingAudio().catch(err => console.error('Ring audio playback failed:', err));
        if (confirm(`Incoming video call from ${callerId}. Accept?`)) {
          this.stopRingAudio();
          this.chatService.acceptVideoCall(callerId).then(() => {
            this.setupVideoStreams();
          });
        } else {
          this.stopRingAudio();
          this.chatService.stopVideoCall();
        }
      } else if (status === 'active' || status === 'calling') {
        this.setupVideoStreams();
      } else if (status === 'idle' || status === 'error') {
        this.stopRingAudio();
      }
    });

    this.chatService.remoteStream$.subscribe(stream => {
      if (stream && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = stream;
      }
    });
  }

  private async playRingAudio(): Promise<void> {
    try {
      if (this.ringAudioElement) {
        await this.ringAudioElement.nativeElement.play();
      }
    } catch (error) {
      console.error('Failed to play ring audio:', error);
    }
  }

  private stopRingAudio(): void {
    if (this.ringAudioElement) {
      this.ringAudioElement.nativeElement.pause();
      this.ringAudioElement.nativeElement.currentTime = 0;
    }
  }

  loadReceiverImage(): void {
    if (!this.receiverUsername) {
      this.receiverImage = null;
      return;
    }

    this.accountService.getImagebyUserName(this.receiverUsername).subscribe({
      next: (data) => {
        if (data?.fileName) {
          this.receiverImage = `${this.filesurl}/${data.fileName}?t=${Date.now()}`;
        } else {
          this.receiverImage = null;
        }
      },
      error: (err) => {
        console.error('Error loading receiver image:', err);
        this.receiverImage = null;
      }
    });
  }

  setupInitialConnection(): void {
    if (this.receiverId) {
      this.accountService.getIdByUserName(this.receiverId).subscribe({
        next: (data: any) => {
          this.truereceiverid = data.id;
          this.setupMessageListener();
          this.loadConversation(this.receiverId);
        },
        error: (err) => console.error('Failed to fetch receiver ID:', err)
      });
    }
  }

  setupMessageListener(): void {
    this.chatService.hubConnection.off("ReceiveMessage");
    this.chatService.hubConnection.on("ReceiveMessage", (message: Chat) => {
      if ((this.truereceiverid === message.receiverId && this.currentUserId === message.senderId) ||
          (this.truereceiverid === message.senderId && this.currentUserId === message.receiverId)) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });

    this.chatService.hubConnection.off("UserTyping");
    this.chatService.hubConnection.on("UserTyping", (userId: string) => {
      if (userId === this.truereceiverid) {
        this.isTyping = true;
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.isTyping = false, 2000);
      }
    });

    this.chatService.hubConnection.on("UserStatusChanged", (userId: string, isOnline: boolean) => {
      if (isOnline) {
        if (!this.onlineUsers.includes(userId)) {
          this.onlineUsers = [...this.onlineUsers, userId];
        }
      } else {
        this.onlineUsers = this.onlineUsers.filter(u => u !== userId);
      }
    });

    this.chatService.hubConnection.on("MessageUpdated", (updatedMessage: Chat) => {
      this.messages = this.messages.map(msg =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      );
    });

    this.chatService.hubConnection.on("MessageDeleted", (deletedId: number) => {
      this.messages = this.messages.filter(msg => msg.id !== deletedId);
      this.conversations = this.conversations.filter(conv => {
        if (conv.id === deletedId) {
          this.loadConversations();
          return false;
        }
        return true;
      });
    });

    this.chatService.hubConnection.on("ConversationDeleted", (userId1: string, userId2: string) => {
      const currentUserId = this.authService.getUserId() ?? '';
      if ([userId1, userId2].includes(currentUserId)) {
        this.loadConversations();
        if (this.receiverId === userId1 || this.receiverId === userId2) {
          this.messages = [];
          this.receiverUsername = '';
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  userImages: { [username: string]: string | null } = {};

  loadConversations(): void {
    this.chatService.getAllConversations(this.currentUsername).subscribe({
      next: (conversations) => {
        this.conversations = conversations || [];
        const usernames = new Set<string>();
        this.conversations.forEach(conv => {
          const name = conv.receiverName === this.currentUsername ? conv.senderName : conv.receiverName;
          usernames.add(name ? name : '');
        });

        usernames.forEach(username => {
          this.accountService.getImagebyUserName(username).subscribe({
            next: (data) => {
              this.userImages[username] = data != null ? `${this.filesurl}/${data.fileName}` : null;
            },
            error: () => {
              this.userImages[username] = 'https://th.bing.com/th/id/OIP.pu65piyuwGoBpHJ2SvvGvAHaHa?pid=ImgDet&w=192&h=192&c=7';
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.conversations = [];
      }
    });
  }

  loadConversation(username: string): void {
    if (!username) {
      console.warn('Cannot load conversation: Missing username');
      return;
    }

    this.chatService.getConversations(this.currentUsername, username).subscribe({
      next: (response: any) => {
        this.messages = response || [];
        this.markMessagesAsRead();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error: any) => {
        console.error('Error loading conversation:', error);
        this.messages = [];
      }
    });
  }

  async sendMessage() {
    if (!this.newMessage.trim() && !this.selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('receiverId', this.receiverUsername);
      if (this.newMessage.trim()) {
        formData.append('message', this.newMessage);
      }
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.subscriptions.add(
        this.chatService.sendMessage(formData).subscribe({
          next: (response) => {
            this.newMessage = '';
            this.selectedFile = null;
            this.scrollToBottom();
          },
          error: (error) => {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
          }
        })
      );
    } catch (error) {
      console.error('Error preparing message:', error);
    }
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.chatService.hubConnection.off("ReceiveMessage");
    this.stopRingAudio();
  }

  switchConversation(username: string): void {
    if (!username) {
      console.warn('Cannot switch conversation: Empty username');
      return;
    }

    this.receiverUsername = username;
    this.accountService.getIdByUserName(username).subscribe({
      next: (data: any) => {
        if (!data || !data.id) {
          console.error('Invalid user data returned:', data);
          return;
        }

        this.truereceiverid = data.id;
        this.loadReceiverImage();
        this.chatService.fetchAndSetOnlineUsers().subscribe(() => {
          this.loadConversation(username);
        });
        this.router.navigate(['/chathub', username], { replaceUrl: true });
        this.setupMessageListener();
      },
      error: (err) => {
        console.error('Failed to fetch receiver ID:', err);
        this.messages = [];
        this.receiverUsername = 'User not found';
      }
    });
  }

  deleteConversation(username: string): void {
    if (confirm('Are you sure you want to delete this entire conversation?')) {
      this.chatService.deleteConversation(username).subscribe({
        next: () => {
          this.conversations = this.conversations.filter(c =>
            c.receiverName !== username && c.senderName !== username
          );
          if (this.receiverUsername === username) {
            this.messages = [];
            this.receiverUsername = '';
            this.loadConversation(username);
          }
        },
        error: (err) => console.error('Delete conversation failed:', err)
      });
    }
  }

  sendTypingEvent() {
    this.chatService.hubConnection.invoke("SendTypingNotification", this.truereceiverid)
      .catch(err => console.error("Typing event error:", err));
  }

  private markMessagesAsRead(): void {
    if (!this.truereceiverid) return;

    this.chatService.markMessagesAsRead(this.truereceiverid).subscribe({
      next: () => {},
      error: (err) => console.error('Mark read failed:', err)
    });
  }

  startEdit(message: Chat): void {
    this.editingMessageId = message.id;
    this.editedMessageText = message.message;
  }

  saveEdit(messageId: number): void {
    if (!this.editedMessageText.trim()) {
      alert('Message cannot be empty');
      return;
    }

    this.chatService.updateMessage(messageId, this.editedMessageText).subscribe({
      next: (updatedMessage) => {
        this.messages = this.messages.map(msg =>
          msg.id === messageId ? { ...msg, message: updatedMessage.message, isEdited: true } : msg
        );
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Failed to update message:', err);
        alert('Failed to update message. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editedMessageText = '';
  }

  initiateDelete(messageId: number): void {
    this.messageToDelete = messageId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.messageToDelete) {
      this.chatService.deleteMessage(this.messageToDelete).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== this.messageToDelete);
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Failed to delete message. Please try again.');
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.messageToDelete = null;
  }

  startVideoCall(): void {
    if (this.truereceiverid) {
      this.chatService.startVideoCall(this.truereceiverid).then(() => {
        this.setupVideoStreams();
      }).catch(err => console.error('Start video call failed:', err));
    }
  }

  endVideoCall(): void {
    this.stopRingAudio();
    this.chatService.hubConnection.invoke("EndVideoCall", this.truereceiverid)
      .then(() => this.chatService.stopVideoCall())
      .catch(err => console.error("End video call error:", err));
  }

  setupVideoStreams(): void {
    if (this.localVideo && this.chatService.localStream) {
      this.localVideo.nativeElement.srcObject = this.chatService.localStream;
    }
  }
}