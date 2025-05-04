import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Country } from '../../Interfaces/Country';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {


 private apiUrl = `${Environment.baseUrl}`;

  constructor(private _HttpClient:HttpClient) { }

  getCountries():Observable<Country[]> {
    return this._HttpClient.get<Country[]>(`${this.apiUrl}Country`);
  }

  AddCountry(country:Country):Observable<Country> {
    return this._HttpClient.post<Country>(`${this.apiUrl}Country`, country);
  }
  updateCountry(country: Country): Observable<any> {
    return this._HttpClient.put(`${this.apiUrl}Country/`, country);
  }
  deleteCountry(id:number):Observable<Country> {
    return this._HttpClient.delete<Country>(`${this.apiUrl}Country?id=${id}`);
  }

}
