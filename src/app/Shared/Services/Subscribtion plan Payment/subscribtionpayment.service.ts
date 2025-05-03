import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { Observable } from 'rxjs';
import { CardPaymentDTO } from '../../Interfaces/CardPaymentDTO';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPaymentService {
  private apiUrl = `${Environment.baseUrl}SubscribtionPlanPayment`;

  constructor(private http: HttpClient) {}

  payWithBalance(planId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/PaySubscriptionFromBalance`, {
      params: new HttpParams().set('planId', planId.toString())
    });
  }

  // payWithStripe(planId: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/PaySubscriptionFromStripe`, {
  //     params: new HttpParams().set('planId', planId.toString()),
  //     responseType: 'text' // to catch the redirect URL if needed
  //   });
  // }
  payWithStripe(planId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/PaySubscriptionFromStripe`, {
      params: new HttpParams().set('planId', planId.toString())
    });
  }

  payWithCard(planId: number, card: CardPaymentDTO): Observable<any> {
    let params = new HttpParams()
      .set('planId', planId.toString())
      .set('Cardnumber', card.cardnumber)
      .set('cvv', card.cvv.toString());

    return this.http.get(`${this.apiUrl}/PaySubscriptionFromCard`, { params });
  }
}
