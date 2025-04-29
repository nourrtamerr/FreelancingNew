import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { UserSkill } from '../../Interfaces/UserSkill';

@Injectable({
  providedIn: 'root'
})
export class UserSkillService {

  constructor(private myClient:HttpClient) { }

  apiUrl=`${Environment.baseUrl}UserSkill`;

  getAllUserSkills():Observable<UserSkill> {
    return this.myClient.get<UserSkill>(`${this.apiUrl}`);
  }
  getUserSkillById(id: number):Observable<UserSkill> {
    return this.myClient.get<UserSkill>(`${this.apiUrl}/${id}`);
  }
  addUserSkill(userSkill: UserSkill):Observable<UserSkill> {
    return this.myClient.post<UserSkill>(`${this.apiUrl}`, userSkill);
  }
  updateUserSkill(id: number, userSkill: UserSkill):Observable<UserSkill> {
    return this.myClient.put<UserSkill>(`${this.apiUrl}/${id}`, userSkill);
  }
}
