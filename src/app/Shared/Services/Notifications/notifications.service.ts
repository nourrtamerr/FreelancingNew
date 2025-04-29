import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { Notifications } from '../../Interfaces/Notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private apiUrl = `${Environment.baseUrl}`;
  constructor(private _HttpClient:HttpClient) { }

  getNotifications(): Observable<Notifications[]> {
    return this._HttpClient.get<Notifications[]>(`${this.apiUrl}Notifications/user`);
  }
  getNotificationsById(id : number) {
    return this._HttpClient.get(`${this.apiUrl}Notifications/${id}`);
  }

  updatateNotifications(id: number, notifications: Notifications): Observable<Notifications> {
    return this._HttpClient.put<Notifications>(`${this.apiUrl}Notifications/${id}`, notifications);
  }
  deleteNotifications(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}Notifications/${id}`);
  }
  addNotifications(notifications: Notifications): Observable<Notifications> {
    return this._HttpClient.post<Notifications>(`${this.apiUrl}Notifications`, notifications);
  }

  getNotificationsUnread(): Observable<Notifications[]> {
    return this._HttpClient.get<Notifications[]>(`${this.apiUrl}Notifications/unread`);
  }

  MarkAsReadNotifications(id: number): Observable<Notifications> {
    return this._HttpClient.put<Notifications>(`${this.apiUrl}Notifications/markAsRead/${id}`, null);
  }
  MarkAsReadAllNotifications(): Observable<Notifications[]> {
    return this._HttpClient.post<Notifications[]>(`${this.apiUrl}Notifications/markAsReadAll`, null);
  }
}
