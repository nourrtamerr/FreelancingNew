import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { ChatService } from '../../../Shared/Services/Chat/chat.service';
import { ActivatedRoute } from '@angular/router';
import { Notifications } from '../../../Shared/Interfaces/Notifications';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../../Shared/Services/Notifications/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit , OnDestroy {
 isLoggedIn: boolean = false;
   notifications: Notifications[] = [];
   unreadNotifications: number = 0;
   private subscriptions: Subscription[] = [];
 
   constructor(
     private AuthService: AuthService,
     private notificationsService: NotificationsService
   ){
     this.isLoggedIn = this.AuthService.isLoggedIn();
     console.log(this.isLoggedIn); // Log the initial status of isLoggedI
 
     this.subscriptions.push(
       this.AuthService.isLoggedIn$.subscribe((status :any) => {
         this.isLoggedIn = status;
         console.log(status);
         
         if (status) {
         } else {
           this.notifications = [];
           this.unreadNotifications = 0;
         }
       })
     );
   }
 
   ngOnInit(): void {
     if (this.isLoggedIn) {
       this.loadNotifications();
       
       // Listen for real-time notifications
       this.notificationsService.hubConnection.on("ReceiveNotification", (notification: Notifications) => {
         console.log('New notification received:', notification);
         this.notifications.unshift(notification);
         if (!notification.isRead) {
           this.unreadNotifications++;
         }
       });
     }
 
   }
   ngOnDestroy(): void {
     // Clean up subscriptions to prevent memory leaks
     this.subscriptions.forEach(sub => sub.unsubscribe());
   }
 
   loadNotifications(): void {
     this.subscriptions.push(
       this.notificationsService.getNotifications().subscribe({
         next: (data: Notifications[]) => {
 
       
           this.notifications = data
           this.unreadNotifications = data.filter(n => !n.isRead).length;
 
           console.log('Loaded notifications:', this.notifications);
         },
         error: (err) => {
           console.error('Error loading notifications:', err);
         }
       })
     );
   }
 
   markAsRead(id: number): void {
     this.subscriptions.push(
       this.notificationsService.MarkAsReadNotifications(id).subscribe({
         next: (result) => {
           console.log('Notification marked as read:', result);
           // Update local notification status
           const notification = this.notifications.find(n => n.id === id);
           if (notification && !notification.isRead) {
             notification.isRead = true;
             this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
           }
         },
         error: (err) => {
           console.error('Error marking notification as read:', err);
         }
       })
     );
   }
 
   markAllAsRead(event: Event): void {
     event.preventDefault();
     
     this.subscriptions.push(
       this.notificationsService.MarkAsReadAllNotifications().subscribe({
         next: (result) => {
           console.log('All notifications marked as read');
           // Update local notification status
           this.notifications.forEach(notification => {
             notification.isRead = true;
           });
           this.unreadNotifications = 0;
         },
         error: (err) => {
           console.error('Error marking all notifications as read:', err);
         }
       })
     );
   }


   deleteNotification(id: number): void {
     this.subscriptions.push(
       this.notificationsService.deleteNotifications(id).subscribe({
         next: (result:any) => {
           console.log('Notification deleted:', result);
           // Remove the notification from the local list
           this.notifications = this.notifications.filter(n => n.id !== id);
         },
         error: (err : any) => {
           console.error('Error deleting notification:', err);
         }
       })
     );
   }
 }
 