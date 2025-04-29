import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateCategoryDTO } from '../../Interfaces/CreateCategor';
import { UpdateCategory } from '../../Interfaces/UpdateCategory';
import { Observable } from 'rxjs';
import { Environment } from '../../../base/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${Environment.baseUrl}Category`;

  constructor(private http:HttpClient) { }

  CreateCategory(category:CreateCategoryDTO):Observable<any>{
    return this.http.post(this.apiUrl,category);
  }

  GetAllCategories():Observable<any>{
    return this.http.get(this.apiUrl);
  }


  getCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  updateCategory(category: UpdateCategory): Observable<UpdateCategory> {
    return this.http.put<UpdateCategory>(this.apiUrl, category);

  }


  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}
