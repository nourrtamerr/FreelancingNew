import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../Shared/Services/Chat/chat.service';
import { AuthService } from './../../../Shared/Services/Auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chat } from '../../../Shared/Interfaces/Chat';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HubConnection } from '@microsoft/signalr';
import { Files } from '../../../base/environment';
import { AccountService } from '../../../Shared/Services/Account/account.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe,CommonModule,RouterModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  selectedFile: File | null = null;
  receiverId!: string;
  currentUserId!: string;
  onlineUsers: string[] = [];
  isConnected = false;
  filesurl=Files.filesUrl;
  selectedImage: string | null = null;
  currentUsername:string="";
  truereceiverid:string="";
  private subscriptions = new Subscription();
  
  constructor(
    private AuthService: AuthService,
    private ChatService: ChatService,
    private routeee:ActivatedRoute,
    private accountservice:AccountService
  ) { 
    this.currentUserId = this.AuthService.getUserId() ?? '';
    this.currentUsername = this.AuthService.getUserName() ?? '';
  }


  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }
  ngOnInit(): void {
    this.receiverId = this.routeee.snapshot.paramMap.get('username')??"";
   this.accountservice.getIdByUserName(this.receiverId).subscribe(
    {
      next:(data)=> {this.truereceiverid=data.id, 
        this.ChatService.hubConnection.on("ReceiveMessage", (message: Chat) => {
          if((this.truereceiverid==message.receiverId&&this.currentUserId==message.senderId)||(this.truereceiverid==message.senderId&&this.currentUserId==message.receiverId)  ){
         console.log('Message received:', message);
         this.messages.push(message);
         }
         else
         {
          console.log("true receiver id",this.truereceiverid),
          console.log("currentUserId",this.currentUserId),
          console.log("senderId",message.senderId),
          console.log("receiverId",message.receiverId)

         }
     });
        },
      error:(err)=>console.log(err)
    }
   )

    

    this.subscriptions.add(
      this.ChatService.getMessages().subscribe((messages) => {
        this.messages = messages;
        console.log('Messages:', messages);
      })
    );
    
    this.ChatService.getOnlineUsers().subscribe(users => {
      this.onlineUsers = users;
    });

    this.ChatService.connectionStatus.subscribe(status => {
      this.isConnected = status;
    });

    this.loadConversation(this.receiverId);
  }

  loadConversation(receiverId: string): void {
    this.receiverId = receiverId;
    this.subscriptions.add(
      this.ChatService.getConversations(this.currentUsername, receiverId).subscribe({
        next: (response) => {
          this.messages = response;
          console.log('Conversation:', response);
        },
        error: (error) => {
          console.error('Error loading conversation:', error);
        }
      })
    );
  }

  async sendMessage() {
    if (!this.newMessage || !this.receiverId) return;

    try {
      const imageBase64 = await this.convertFileToBase64(this.selectedFile);
      

      const formData = new FormData();
    formData.append('receiverId', this.receiverId);
  
      if (this.newMessage) {
        formData.append('message', this.newMessage);
     }
  
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
       }

      
      const message: Chat = {
        senderId: this.currentUserId,
        receiverId: this.receiverId,
        message: this.newMessage,
        imageUrl: imageBase64 ? imageBase64.toString() : undefined,
      };
      console.log('Sending message:', message);
      this.subscriptions.add(
        this.ChatService.sendMessage(formData).subscribe({
          next: (response) => {
            // this.messages.push(response);
            this.newMessage = '';
            this.selectedFile = null;
            console.log('Sending message:', message);
          },
          error: (error) => {
            console.error('Error sending message:', error);
          }
        })
      );
    } catch (error) {
      console.error('Error converting file:', error);
    }
  }

  private convertFileToBase64(file: File | null): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}