import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllPaymentsService {
 private apiUrl = `${Environment.baseUrl}AllPayments`;
  constructor(private httpclient: HttpClient) { }

  

    getAllPayments(): Observable<any> {
      return this.httpclient.get(this.apiUrl + '/payments');
    
    }
  
   
  }