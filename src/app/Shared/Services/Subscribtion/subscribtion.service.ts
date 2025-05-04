import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Correct HttpClient import
import { Observable } from 'rxjs';
import { Environment } from '../../../base/environment';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  // Use the base URL from environment.ts
  // private apiUrl = `${Environment.baseUrl}subscription/current-plan`;

  // constructor(private http: HttpClient) {}

  // getCurrentSubscription(): Observable<any> {
  //   return this.http.get<any>(this.apiUrl).pipe(
  //     tap(data => {
  //       console.log('SubscriptionService: getCurrentSubscription response:', data);
  //     })
  //   );
  // }
  private apiUrl = `${Environment.baseUrl}Subscribtion/current-plan`;

  constructor(private http: HttpClient) { }

  // Method to fetch the current subscription plan for the user
  getCurrentSubscription(): Observable<any> {
    console.log('SubscriptionService: getCurrentSubscription response:');
    return this.http.get<any>(this.apiUrl);

  }
}
