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
  
  getCardNumber(payment: any): string {
    if (payment.paymentMethod !== 'Cash' && payment.transactionId) {
     // return payment.transactionId.slice(0, 16);
     return payment.transactionId.split(',')[0];
    }
    return '';
  }



  getCVV(payment: any): string {
    if (payment.paymentMethod !== 'Cash' && payment.transactionId) {
    //  return payment.transactionId.slice(17);
    const parts = payment.transactionId.split(',');
      return parts.length > 1 ? parts[1] : payment.transactionId.slice(16);
    }
    return '';
  }

  getTransactionType(payment: any): string {
    if (payment.transactionType === 'AddFunds') { 
      return 'Add Funds';
    } else if (payment.transactionType === 'Withdrawal') {
      return 'Withdraw';
    }
    else if (payment.transactionType === 'SubscriptionPayment') {
      return 'Subscription Payment';
    }
    else if (payment.transactionType === 'PropsalConfirmationPayment') {
      return 'Propsal Payment';
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
