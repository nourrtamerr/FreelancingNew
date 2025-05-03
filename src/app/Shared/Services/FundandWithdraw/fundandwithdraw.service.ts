import { Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FundsCard } from '../../Interfaces/funds-card';

@Injectable({
  providedIn: 'root'
})
export class FundandwithdrawService {

    private apiUrl = `${Environment.baseUrl}FreelancerWithdrawal`;

  constructor(private _HttpClient:HttpClient) { }
  getfunds():Observable<FundsCard[]> {
    return this._HttpClient.get<FundsCard[]>(`${this.apiUrl}/GetFundsCard`);
  }

  deletefund(id:number):Observable<FundsCard> {
    return this._HttpClient.delete<FundsCard>(`${this.apiUrl}/DeleteFundsCard/${id}`);
  }
  updatefund(id:number,fund:FundsCard):Observable<FundsCard> {
    return this._HttpClient.put<FundsCard>(`${this.apiUrl}/UpdateFundsCard/${id}`, fund);
  }

  cardfund(fund:FundsCard):Observable<FundsCard> {
    return this._HttpClient.post<FundsCard>(`${this.apiUrl}/AddFundsCard`, fund);
  }
  cardwithdraw(fund:FundsCard):Observable<FundsCard> {
    return this._HttpClient.post<FundsCard>(`${this.apiUrl}/WithdrawCard`, fund);
  }

  stripefund(amount:number,email:string):Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/AddFundsStripe?money=${amount}&email=${email}`);
  }
  stripewithdraw(amount:number,email:string):Observable<any> {
    // return this._HttpClient.get<any>(`${this.apiUrl}/StripeWithdraw?money=${amount}&email=${email}`);
    return this._HttpClient.post<any>(`${this.apiUrl}/StripeWithdraw`,{money:amount,email:email});

  }

}
