import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateSubCategoryDTO } from '../../Interfaces/Subcategory';
import { Observable } from 'rxjs';
import { Environment } from '../../../base/environment';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
    private apiUrl = `${Environment.baseUrl}Subcategory`;
   
 


  constructor( private http:HttpClient) { }
  createSubcategory( subcategory: CreateSubCategoryDTO): Observable<any> {
    return this.http.post(this.apiUrl, subcategory);
  }



  getAllSubcategories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }


  getSubCategoryById(id:number):Observable<any>{
    return this.http.get(`${this.apiUrl}/${id}`);
  }


updateSubCategory(id: number, subcategory: CreateSubCategoryDTO): Observable<any> {
 
  return this.http.put(`${this.apiUrl}/${id}`, subcategory);




  
}

}
