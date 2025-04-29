import { Ban } from './../../Interfaces/Bans';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BansService {
  private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }

  getBanByid(id: number):Observable<Ban> {
    return this._HttpClient.get<Ban>(`${this.apiUrl}Bans/${id}`);
  }

  updateBan(id: number, ban: Ban): Observable<Ban> {
    return this._HttpClient.put<Ban>(`${this.apiUrl}Bans/${id}`, ban);
}

  deleteBan(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}Bans/${id}`);
  }

  addBan(ban: Ban): Observable<Ban> {
    return this._HttpClient.post<Ban>(`${this.apiUrl}Bans`, ban);
  }

  getAllBans(): Observable<Ban[]> {
    return this._HttpClient.get<Ban[]>(`${this.apiUrl}Bans/banned-users`);
  }
  getActiveBansByUserId(userId: string): Observable<Ban[]> {
    return this._HttpClient.get<Ban[]>(`${this.apiUrl}Bans/active/${userId}`);
  }
}
