import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
//import { BiddingProject } from '../../Interfaces/bidding-project';
import { Observable } from 'rxjs';
import { BiddingProjectFilter } from '../../Interfaces/BiddingProject/bidding-project-filter';
import { BiddingProjectGetAll, BiddingProjectsResponse } from '../../Interfaces/BiddingProject/bidding-project-get-all';
import { BiddingProjectGetById } from '../../Interfaces/BiddingProject/bidding-project-get-by-id';
import { BiddingprojectCreateUpdate } from '../../Interfaces/BiddingProject/biddingproject-create-update';
import { CreateUpdateReturn } from '../../Interfaces/BiddingProject/create-update-return';

@Injectable({
  providedIn: 'root'
})
// for(const key in filter){
    //   const value= filter[key as keyof BiddingProjectFilter]
    //   if(value !==null && value!==undefined){
    //     params=params.set(key, value.toString());
    //   }
    // }
    // for (const key in filter) {
    //   const value = filter[key as keyof BiddingProjectFilter];
    //   if (value !== null && value !== undefined) {
    //     if (Array.isArray(value)) {
    //       // Handle array values by appending multiple params with same key
    //       value.forEach(item => {
    //         params = params.append(key, item.toString());
    //       });
    //     } else {
    //       // Handle non-array values normally
    //       params = params.set(key, value.toString());
    //     }
    //   }
    // }
export class BiddingProjectService {

  constructor(private httpClinet:HttpClient) { }
  private Url= `${Environment.baseUrl}BiddingProject`

   GetAllBiddingProjects(filter:BiddingProjectFilter, PageNumber:number, PageSize:number): Observable<BiddingProjectGetAll[]>{

    let params=new HttpParams()
    .set('PageNumber',PageNumber.toString())
    .set('PageSize', PageSize.toString())
   
    return this.httpClinet.post<BiddingProjectGetAll[]>(`${this.Url}/Filter`,filter,{params})
   }


   //------------------------------------------------------------------------------------



   GetBiddingProjectById(id:number): Observable<BiddingProjectGetById>{
    return this.httpClinet.get<BiddingProjectGetById>(`${this.Url}/${id}`);
   }

   //------------------------------------------------------------------------------------

   CreateBiddingProject(project:BiddingprojectCreateUpdate): Observable<CreateUpdateReturn>{
    return this.httpClinet.post<CreateUpdateReturn>(this.Url,project);
   }
   
   //------------------------------------------------------------------------------------
   
   
   UpdateBiddingProject(id:number,project:BiddingprojectCreateUpdate):Observable<CreateUpdateReturn>{
    return this.httpClinet.put<CreateUpdateReturn>(`${this.Url}/${id}`,project);
   }
   

   //------------------------------------------------------------------------------------
   
   DeleteBiddingProject(id: number): Observable<boolean>{
    return this.httpClinet.delete<boolean>(`${this.Url}/${id}`)
   }

   //------------------------------------------------------------------------------------
   
   GetmyBiddingprojects(): Observable<BiddingProjectGetAll[]>{
    return this.httpClinet.get<BiddingProjectGetAll[]>(`${this.Url}/GetMyBiddingProjects`);
   }
   //------------------------------------------------------------------------------------
   GetuserBiddingprojects(userid:string): Observable<BiddingProjectGetAll[]>{
    return this.httpClinet.get<BiddingProjectGetAll[]>(`${this.Url}/GetForUser/${userid}`);
   }
   //------------------------------------------------------------------------------------
   GetAllBiddingProjectsDashBoard(filter: BiddingProjectFilter, PageNumber: number, PageSize: number): Observable<BiddingProjectsResponse> {
    let params = new HttpParams()
      .set('PageNumber', PageNumber.toString())
      .set('PageSize', PageSize.toString());

    for (const key in filter) {
      const value = filter[key as keyof BiddingProjectFilter];
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }

    return this.httpClinet.get<BiddingProjectsResponse>(this.Url, { params });
  }
}
