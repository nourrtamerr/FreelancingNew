import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CardPaymentDTO } from '../../Interfaces/CardPaymentDTO';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionPaymentService {
  private apiUrl = `${Environment.baseUrl}SubscribtionPlanPayment`;

  constructor(private http: HttpClient) { }

  payFromBalance(planId: number): Observable<any> {
    const params = new HttpParams().set('planId', planId);
    return this.http.get(`${this.apiUrl}SubscribtionPlanPayment/PaySubscriptionFromBalance`, { params });
  }
  
  payFromStripe(planId: number): Observable<string> {
    const params = new HttpParams().set('planId', planId).set('redirectionurl', 'https://your-frontend.com/after-payment');
    return this.http.get(`${this.apiUrl}SubscribtionPlanPayment/PaySubscriptionFromStripe`, {
      params,
      responseType: 'text'
    });
  }
  
  payFromCard(planId: number, card: CardPaymentDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}SubscribtionPlanPayment/PaySubscriptionFromCard?planId=${planId}`, card);
  }
  
}
