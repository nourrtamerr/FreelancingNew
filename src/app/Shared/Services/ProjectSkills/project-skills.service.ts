import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';

import { Observable } from 'rxjs';
import { ProjectSkill } from '../../Interfaces/ProjectSkills';
@Injectable({
  providedIn: 'root'
})
export class ProjectSkillsService {

  private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }



  getProjectSkillsById(id: number): Observable<ProjectSkill> {
    return this._HttpClient.get<ProjectSkill>(`${this.apiUrl}ProjectSkills/${id}`);
  }

  updateProjectSkills(id: number, projectSkill: ProjectSkill): Observable<ProjectSkill> {
    return this._HttpClient.put<ProjectSkill>(`${this.apiUrl}ProjectSkills/${id}`, projectSkill);
  }

  deleteProjectSkills(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${this.apiUrl}ProjectSkills/${id}`);
  }

  addProjectSkills(projectSkill: ProjectSkill): Observable<ProjectSkill> {
    return this._HttpClient.post<ProjectSkill>(`${this.apiUrl}ProjectSkills`, projectSkill);
  }
  getAllProjectSkills(): Observable<ProjectSkill[]> {
    return this._HttpClient.get<ProjectSkill[]>(`${this.apiUrl}ProjectSkills`);
  }


  // Get all project skills by project id not found in backend 
  getProjectSkillsByProjectId(projectId: number): Observable<ProjectSkill[]> {
    return this._HttpClient.get<ProjectSkill[]>(`${this.apiUrl}ProjectSkills/project/${projectId}`);
  }
}
