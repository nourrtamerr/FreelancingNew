import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { FreelancerLanguage } from '../../Interfaces/freelancer-language';

@Injectable({
  providedIn: 'root'
})
export class FreelancerlanguageService {

  private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }

  getFreelancerLanguageByid(id: number):Observable<FreelancerLanguage> {
    return this._HttpClient.get<FreelancerLanguage>(`${this.apiUrl}FreelancerLanguages/${id}`);
  }

  updateFreelancerLanguage(id: number, freelancerLanguage: FreelancerLanguage): Observable<FreelancerLanguage> {
    return this._HttpClient.put<FreelancerLanguage>(`${this.apiUrl}FreelancerLanguages/${id}`, freelancerLanguage);
  }

  deleteFreelancerLanguage(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}FreelancerLanguages/${id}`);
  }

  addFreelancerLanguage(freelancerLanguage: FreelancerLanguage): Observable<FreelancerLanguage> {
    return this._HttpClient.post<FreelancerLanguage>(`${this.apiUrl}FreelancerLanguages`, freelancerLanguage);
  }

  getAllFreelancerLanguages(): Observable<FreelancerLanguage[]> {
    return this._HttpClient.get<FreelancerLanguage[]>(`${this.apiUrl}FreelancerLanguages`);
  }

  // Get all freelancerLanguages for a specific user by userId dy zyada lw 7bena ndef function f el service f el backend w b3den ndefha hna
  getFreelancerLanguageByUserId(userId: string): Observable<FreelancerLanguage[]> {
    return this._HttpClient.get<FreelancerLanguage[]>(`${this.apiUrl}FreelancerLanguages/freelancer/${userId}`);
  }

  getFreelancerLanguageByUserName(username: string): Observable<FreelancerLanguage[]> {
    return this._HttpClient.get<FreelancerLanguage[]>(`${this.apiUrl}FreelancerLanguages/freelancer/${username}`);
  }
}
