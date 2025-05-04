import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { City } from '../../Interfaces/City';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }

  getCitiess():Observable<City[]> {
    return this._HttpClient.get<City[]>(`${this.apiUrl}City`);
  }
  getCityById(id: number): Observable<City> {
    return this._HttpClient.get<City>(`${this.apiUrl}City/${id}`);
  }
  addCity(city: City): Observable<City> {
    return this._HttpClient.post<City>(`${this.apiUrl}City`, city);
  }

  updateCity(id: number, city: City): Observable<City> {
    return this._HttpClient.put<City>(`${this.apiUrl}City/${id}`, city);
  }

  deleteCity(id: number): Observable<City> {
    return this._HttpClient.delete<City>(`${this.apiUrl}City/?id=${id}`);
  }
}
