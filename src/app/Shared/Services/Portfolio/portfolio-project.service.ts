import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { freelancerportofolioprojects } from '../../Interfaces/PortfolioProject';

@Injectable({
  providedIn: 'root'
})
export class PortfolioProjectService {

  constructor(private myClient:HttpClient) { } 
  
  apiURL = `${Environment.baseUrl}PortofolioProject`;

  getAllPortfolioProjects():Observable<any> {
    return this.myClient.get(this.apiURL);
  }
  getMyPortfolioProjects():Observable<freelancerportofolioprojects> {
    console.log("asdiouahsdio");
    return this.myClient.get<freelancerportofolioprojects>(this.apiURL + '/MyPortofolioProjects');
  }
  getUserPortfolioProjects(userId:string):Observable<freelancerportofolioprojects> {
    console.log("asdiouahsdio");
    return this.myClient.get<freelancerportofolioprojects>(this.apiURL + `/UserPortofolioProjects/${userId}`);
  }
  getPortfolioProjectById(id: number):Observable<any> {
    return this.myClient.get(this.apiURL  + id);
  }
  addPortfolioProject(data: FormData):Observable<freelancerportofolioprojects> {
    console.log("details");
    for (const pair of data.entries()) {
      console.log(pair[0], pair[1]);
    }
    return this.myClient.post<freelancerportofolioprojects>(this.apiURL , data);
  }
  updatePortfolioProject(id:number,data: any):Observable<any> {
    return this.myClient.put(this.apiURL + `/${id}`, data);
  }
  deletePortfolioProject(id: number):Observable<any> {
    return this.myClient.delete(this.apiURL + '/' + id);
  }
}
