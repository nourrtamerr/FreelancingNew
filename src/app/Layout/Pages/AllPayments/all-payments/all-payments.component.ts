import { Component } from '@angular/core';
import { AllPaymentsService } from '../../../../Shared/Services/AllPayments/all-payments.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-payments',
  imports: [FormsModule,CommonModule],
  templateUrl: './all-payments.component.html',
  styleUrl: './all-payments.component.css'
})
export class AllPaymentsComponent {
  constructor(private allPayment: AllPaymentsService) { }

  allPayments: any[] = [];
  getTransactionDetails(payment: any): string {
    if (payment.paymentMethod === '2') { // Stripe
      return `Session ID: ${payment.sessionId}`;
    } else if (payment.paymentMethod === '0') { // Credit Card
      return `Card ending in ${payment.lastFourDigits}`;
    }
    return payment.transactionId;
  }

  getTransactionType(payment: any): string {
    if (payment.transactionType === 'AddFunds') { 
      return 'Add Funds';
    } else if (payment.transactionType === 'Withdrawal') {
      return 'Withdraw'; 
     
    }
    return 'Other Payment Method';
  }
 
  ngOnInit() {
    this.allPayment.getAllPayments().subscribe((data: any) => {
      this.allPayments = data;
      console.log(this.allPayments);
    }); 
  }

}
