import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { ChatService } from '../../../Shared/Services/Chat/chat.service';
import { ActivatedRoute } from '@angular/router';
import { Notifications } from '../../../Shared/Interfaces/Notifications';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../../Shared/Services/Notifications/notifications.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
 Notifications: Notifications[] = [];
  currentUserId!: string;
  currentUsername:string="";

  constructor(
    private AuthService: AuthService,
    private Notificationservice: NotificationsService,
    private routeee:ActivatedRoute
  ) { 
    this.currentUserId = this.AuthService.getUserId() ?? '';
    this.currentUsername = this.AuthService.getUserName() ?? '';

  }

  ngOnInit(): void {


      this.Notificationservice.hubConnection.on("ReceiveNotification", (message: Notifications) => {
        // if(this.receiverId==message.senderId){
        console.log('notification received:', message);
        console.log("asidohasoidhasd")
        this.Notifications.push(message);
        // }
    });
  }
}
