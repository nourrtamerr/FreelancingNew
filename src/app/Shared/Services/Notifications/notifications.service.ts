import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notifications } from '../../Interfaces/Notifications';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  public hubConnection!: HubConnection;
  public AllNotificaitions:BehaviorSubject<Notifications[]> = new BehaviorSubject<Notifications[]>([]);
  public unreadNotifications: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private apiUrl = `${Environment.baseUrl}`;
  // private connectionStatus$ = new BehaviorSubject<boolean>(false);
  constructor(private _HttpClient:HttpClient,private authService:AuthService) {
    this.initializeSignalRConnection();
    this.setupNotificationHandlers();
   }


   private setupNotificationHandlers(): void {
    this.hubConnection.on("ReceiveNotification", (notification: Notifications) => {
      console.log('New notification received:', notification);
      const current = this.AllNotificaitions.getValue();
      this.AllNotificaitions.next([notification, ...current]);
      if (!notification.isRead) {
        this.unreadNotifications.next(this.unreadNotifications.value + 1);
      }
    });
  }

   private initializeSignalRConnection(): void {
       try {
         this.hubConnection = new HubConnectionBuilder()
           .withUrl(Environment.notificationsUrl, { 
             accessTokenFactory: () => {
              console.log("accessing token");
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
            //  this.connectionStatus$.next(true);
           })
           .catch((err: unknown) => {
             console.error('SignalR Connection Error:', err);
            //  this.connectionStatus$.next(false);
           });
     
       } catch (error) {
         console.error('SignalR Initialization Error:', error);
        //  this.connectionStatus$.next(false);
       }
     }
  getNotifications(): Observable<Notifications[]> {
    return this._HttpClient.get<Notifications[]>(`${this.apiUrl}Notifications/user`)
      .pipe(
        tap((notifications: Notifications[]) => { 
          this.AllNotificaitions.next(notifications);
          this.unreadNotifications.next(notifications.filter(notification => !notification.isRead).length);
        }));   
      


  }
  getNotificationsById(id : number) {
    return this._HttpClient.get(`${this.apiUrl}Notifications/${id}`);
  }

  updatateNotifications(id: number, notifications: Notifications): Observable<Notifications> {
    return this._HttpClient.put<Notifications>(`${this.apiUrl}Notifications/${id}`, notifications);
  }
  
  deleteNotifications(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}Notifications/${id}`).pipe(
      tap(() => {
        const updated = this.AllNotificaitions.value.filter(n => n.id !== id);
        this.AllNotificaitions.next(updated);
        this.unreadNotifications.next(updated.filter(n => !n.isRead).length);
      })
    );
  }
  addNotifications(notifications: Notifications): Observable<Notifications> {
    return this._HttpClient.post<Notifications>(`${this.apiUrl}Notifications`, notifications);
  }

  getNotificationsUnread(): Observable<Notifications[]> {
    return this._HttpClient.get<Notifications[]>(`${this.apiUrl}Notifications/unread`);
  }

  MarkAsReadNotifications(id: number): Observable<Notifications> {
    return this._HttpClient.put<Notifications>(`${this.apiUrl}Notifications/mark-as-read/${id}`, {});
  }
  MarkAsReadAllNotifications(): Observable<Notifications[]> {
    return this._HttpClient.post<Notifications[]>(`${this.apiUrl}Notifications/mark-all-as-read`, {});
  }
}
