import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Education } from '../../Interfaces/education';

@Injectable({
  providedIn: 'root'
})
export class EducationService {

  private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }

  getEducationByid(id: number):Observable<Education> {
    return this._HttpClient.get<Education>(`${this.apiUrl}Educations/${id}`);
  }

  updateEducation(id: number, education: Education): Observable<Education> {
    return this._HttpClient.put<Education>(`${this.apiUrl}Educations/${id}`, education);
  }

  deleteEducation(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}Educations/${id}`);
  }

  CreateEducation(education: Education): Observable<Education> {
    return this._HttpClient.post<Education>(`${this.apiUrl}Educations`, education);
  }

  getAllEducations(): Observable<Education[]> {
    return this._HttpClient.get<Education[]>(`${this.apiUrl}Educations`);
  }

  // Get all educations for a specific user by userId dy zyada lw 7bena ndef function f el service f el backend w b3den ndefha hna
  getEducationByUserId(userId: string): Observable<Education[]> {
    return this._HttpClient.get<Education[]>(`${this.apiUrl}Educations/${userId}`);
  }
  
  getEducationByUserName(username: string): Observable<Education[]> {
    return this._HttpClient.get<Education[]>(`${this.apiUrl}Educations/freelancer/${username}`);
  }
}
