import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { Milestone, MilestoneFile } from '../../Interfaces/milestone';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {

  constructor(private httpclient:HttpClient) { }

  private url= `${Environment.baseUrl}Milestone`;


  GetAllMilestones():Observable<Milestone[]>{
    return this.httpclient.get<Milestone[]>(this.url);
  }


  getMilestoneById(id:number):Observable<Milestone>{
    return this.httpclient.get<Milestone>(`${this.url}/${id}`)
  }


  GetMilestoneByProjectId(ProjectId:number):Observable<Milestone>{
    return this.httpclient.get<Milestone>(`${this.url}/Project/${ProjectId}`)

  }


  CreateMilestone(milestone:Milestone):Observable<Milestone>{
    return this.httpclient.post<Milestone>(this.url,milestone)
  }

  UpdateMilestoneStatus( MilestoneId:number, StatusId:number):Observable<Milestone>{
    return this.httpclient.patch<Milestone>(`${this.url}/UpdateStatus/${MilestoneId}`,StatusId)
  }

  UpdateMilestone(milestone:Milestone):Observable<Milestone>{
    return this.httpclient.put<Milestone>(this.url,milestone)
  }

  DeleteMilestone(id:number):Observable<boolean>{
    return this.httpclient.delete<boolean>(`${this.url}/${id}`)
  }

  UploadMilestoneFile(files: File[], MilestoneId:number):Observable<string[]>{
    const formData=new FormData();
    files.forEach(file=>{
      formData.append('files',file);
    });

    return this.httpclient.post<string[]>(`${this.url}/UploadMilestoneFiles/${MilestoneId}`, formData);

  }



  RemoveMilestoneFile(FileId:number):Observable<boolean>{
    return this.httpclient.delete<boolean>(`${this.url}/RemoveMilestoneFiles/${FileId}`);
  }


  GetFilesByMilestoneId(MilsestoneId:number):Observable<MilestoneFile[]>{
    return this.httpclient.get<MilestoneFile[]>(`${this.url}/GetFilesByMilestoneId/${MilsestoneId}`)
  }

}
