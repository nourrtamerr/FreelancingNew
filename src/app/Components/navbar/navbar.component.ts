import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../Shared/Services/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Notifications } from '../../Shared/Interfaces/Notifications';
import { NotificationsService } from '../../Shared/Services/Notifications/notifications.service';
import { ProjectsService } from '../../Shared/Services/Projects/projects.service';
import { HostListener } from '@angular/core';
import { AccountService } from '../../Shared/Services/Account/account.service';
import { Files } from '../../base/environment';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})





export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  notifications: Notifications[] = [];
  unreadNotifications: number = 0;
  private subscriptions: Subscription[] = [];
  role: string | null = null;
  savedTalent: number = 0;
  unreadMessages: number = 0;
  balance: number = 0;

  userImage:string|null=null


  @HostListener('window:scroll', ['$event'])
onWindowScroll() {
  const navbar = document.querySelector('.navbar') as HTMLElement;
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

  username!:string;
  constructor(
    private AuthService: AuthService,
    private notificationsService: NotificationsService,
    private projectService: ProjectsService,
    private router: Router,
    private accountService: AccountService
  ){
    this.isLoggedIn = this.AuthService.isLoggedIn();
    console.log(this.isLoggedIn); // Log the initial status of isLoggedI

    this.subscriptions.push(
      this.AuthService.isLoggedIn$.subscribe((status :any) => {
        this.isLoggedIn = status;
        console.log(status);

        if (status) {
          // this.loadNotifications();
        } else {
          this.notifications = [];
          this.unreadNotifications = 0;
        }
      })
    );
  }


  files=Files.filesUrl;

  ngOnInit(): void {

    this.accountService.getImagebyUserName(this.AuthService.getUserName()!).subscribe((res:any)=>{
      this.userImage = res.fileName;
      console.log("image:",this.userImage);
    })


    this.username = this.AuthService.getUserName() || '';
    this.AuthService.userData.subscribe((user) => {
      if (user) {
        const role = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        this.role = role?.toLowerCase() || null;
        console.log(this.role);
      }
    });
    this.subscriptions.push(
      this.notificationsService.AllNotificaitions.subscribe(notifications => {
        this.notifications = notifications;
      }),

      this.notificationsService.unreadNotifications.subscribe(count => {
        this.unreadNotifications = count;
      })
    );
    if (this.isLoggedIn) {
      this.loadNotifications();

      // Listen for real-time notifications
      this.notificationsService.hubConnection.on("ReceiveNotification", (notification: Notifications) => {
        console.log('New notification received:', notification);
        this.notificationsService.AllNotificaitions.next([notification]);
        this.notificationsService.unreadNotifications.next(this.unreadNotifications + 1);
        this.notifications.unshift(notification);
        if (!notification.isRead) {
          this.unreadNotifications++;
        }
      });
    }

    if (this.role === 'client') {
      this.loadClientData();
    }

  }
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadClientData(): void {
    // This is where you would typically load client-specific data
    // For now, we'll just simulate some data
    this.savedTalent = 5;
    this.unreadMessages = 2;
    this.balance = 1000;
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
          this.notificationsService.AllNotificaitions.next(this.notifications.filter(n => n.id !== id));
          this.notificationsService.unreadNotifications.next(this.unreadNotifications - 1);
        },
        error: (err : any) => {
          console.error('Error deleting notification:', err);
        }
      })
    );
  }
  logout() {
    this.isLoggedIn = false;
    this.AuthService.logout();
  }
}
