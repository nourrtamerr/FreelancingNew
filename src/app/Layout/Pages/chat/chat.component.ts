import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../Shared/Services/Chat/chat.service';
import { AuthService } from './../../../Shared/Services/Auth/auth.service';
import { retry, Subscription } from 'rxjs';
import { Chat } from '../../../Shared/Interfaces/Chat';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Files } from '../../../base/environment';
import { AccountService } from '../../../Shared/Services/Account/account.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe, CommonModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Chat[] = [];
  conversations: Chat[] = [];
  newMessage = '';
  selectedFile: File | null = null;
  receiverId: string = '';
  receiverUsername: string = '';
  currentUserId: string ;
  currentUsername: string;
  onlineUsers: string[] = [];
  isConnected = false;
  filesurl:string = '';
  selectedImage: string | null = null;
  showSidebar = false;
  truereceiverid:string="";
  receiverImage: string = '';
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {
    this.currentUserId = this.authService.getUserId() ?? '';
    this.currentUsername = this.authService.getUserName() ?? '';
  }
  ngOnInit(): void {
    this.filesurl = Files.filesUrl;
    this.receiverId = this.route.snapshot.paramMap.get('username')??"";
    this.receiverUsername = this.receiverId;
    
    this.setupInitialConnection();
    this.loadConversations();
  
  this.loadReceiverImage(); 
  }


  loadReceiverImage(): void {
    this.accountService.getImagebyUserName(this.receiverUsername).subscribe({
      next: (data) => {
        const timestamp = new Date().getTime(); // force reload
        this.receiverImage = `${this.filesurl}/${data.fileName}?t=${timestamp}`;
      },
      error: (err) => {
        console.error('Error loading receiver image:', err);
        this.receiverImage = ''; // Optional: fallback to default
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
        error: (err) => console.log(err)
      });
    }
  }

  setupMessageListener(): void {
    // Remove previous listeners to prevent duplicates
    this.chatService.hubConnection.off("ReceiveMessage");
    
    // Set up the message listener
    this.chatService.hubConnection.on("ReceiveMessage", (message: Chat) => {
      if ((this.truereceiverid === message.receiverId && this.currentUserId === message.senderId) ||
          (this.truereceiverid === message.senderId && this.currentUserId === message.receiverId)) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  userImages: { [username: string]: string } = {}; 

  loadConversations(): void {
    this.chatService.getAllConversations(this.currentUsername).subscribe({
      next: (conversations) => {
        this.conversations = conversations || [];
  
        // Get all unique usernames
        const usernames = new Set<string>();
        this.conversations.forEach(conv => {
          const name = conv.receiverName === this.currentUsername ? conv.senderName : conv.receiverName;
          usernames.add(name? name : ''); // Avoid adding empty strings
        });
  
        // Fetch images for each unique user
        usernames.forEach(username => {
          this.accountService.getImagebyUserName(username).subscribe({
            next: (data) => {
              this.userImages[username] = `${this.filesurl}/${data.fileName}`;
            },
            error: () => {
              this.userImages[username] = 'https://th.bing.com/th/id/OIP.pu65piyuwGoBpHJ2SvvGvAHaHa?pid=ImgDet&w=192&h=192&c=7'; // fallback image
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
      formData.append('receiverId', this.receiverUsername); // Send username, not ID
      if (this.newMessage.trim()) {
        formData.append('message', this.newMessage);
      }
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
  
      // Log FormData for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
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
        this.receiverId = data.id; // Keep for other uses (e.g., SignalR)
        this.loadReceiverImage(); // Load the image for the new receiver
  
        // Update URL without reloading the page
        this.router.navigate(['/chathub', username], { replaceUrl: true });
  
        this.loadConversation(username);
        this.setupMessageListener();
      },
      error: (err) => {
        console.error('Failed to fetch receiver ID:', err);
        this.messages = [];
        this.receiverUsername = 'User not found';
      }
    });
  }
}