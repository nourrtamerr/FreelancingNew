import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { Experience } from '../../Interfaces/experience';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {

  private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }

  getExperienceByid(id: number):Observable<Experience> {
    return this._HttpClient.get<Experience>(`${this.apiUrl}Experiences/${id}`);
  }

  updateExperience(id: number, experience: Experience): Observable<Experience> {
    return this._HttpClient.put<Experience>(`${this.apiUrl}Experiences/${id}`, experience);
  }

  deleteExperience(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}Experiences/${id}`);
  }

  addExperience(experience: Experience): Observable<Experience> {
    return this._HttpClient.post<Experience>(`${this.apiUrl}Experiences`, experience);
  }

  getAllExperiences(): Observable<Experience[]> {
    return this._HttpClient.get<Experience[]>(`${this.apiUrl}Experiences`);
  }


  // Get all experiences for a specific user by userId dy zyada lw 7bena ndef function f el service f el backend w b3den ndefha hna
  getExperienceByUserId(userId: string): Observable<Experience[]> {
    return this._HttpClient.get<Experience[]>(`${this.apiUrl}Experiences/freelancer/${userId}`);
  }

  getExperienceByUserName(username: string): Observable<Experience[]> {
    return this._HttpClient.get<Experience[]>(`${this.apiUrl}Experiences/freelancer/${username}`);
  }
}
