import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../base/environment';
import { CardPaymentDTO } from '../Interfaces/payment-method';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProposalPaymentService {

  constructor(private myClient:HttpClient) { }

   Url= `${Environment.baseUrl}ProposalConfirmation`

   ClientPayFromBalance(proposalId:number):Observable<any>{
    return this.myClient.get<any>(`${this.Url}/ClientPayFromBalance?proposalId=${proposalId}`,{})
   }

   ClientPayFromcard(proposalId:number, card:CardPaymentDTO):Observable<any>{
    return this.myClient.get<any>(`${this.Url}/ClientPayFromCard?proposalId=${proposalId}&amount=${card.amount}&Cardnumber=${card.cardNumber}&cvv=${card.cvv}`)
   }

   ClientPayFromStrip(proposalId:number):Observable<any>{
    return this.myClient.get<any>(`${this.Url}/ClientPayFromStripe?proposalId=${proposalId}`)
   }
}
