import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FundandwithdrawService } from '../../../Shared/Services/FundandWithdraw/fundandwithdraw.service';
import { FundsCard } from '../../../Shared/Interfaces/funds-card';

@Component({
  selector: 'app-add-fund-by-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-fund-by-client.component.html',
  styleUrl: './add-fund-by-client.component.css'
})
export class AddFundByClientComponent {
  paymentForm: FormGroup;
  selectedPaymentMethod: string = 'card';
  processingFee: number = 0.99;
  cardinfo: FundsCard = {
    amount: 0,
    cardnumber: '',
    cvv: 0
  };
  constructor(
    private fb: FormBuilder,
    private fundService: FundandwithdrawService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['card', Validators.required],
      currency: ['USD', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiryDate: ['', [Validators.required, Validators.pattern('^([0-9]|1[0-2])\/?([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]],
      cardholderName: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]]
    });

    // Subscribe to amount changes to update calculations
    this.paymentForm.get('amount')?.valueChanges.subscribe(value => {
      this.calculateTotal();
    });
  }

  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod = method;
  }

  getTotalDue(): number {
    return this.paymentForm.get('amount')?.value || 0;
  }

  getProcessingFee(): number {
    return this.processingFee;
  }

  calculateTotal(): number {
    const amount = this.getTotalDue();
    return amount + this.processingFee;
  }

  Fund() {
    if (this.paymentForm.valid) {
      const formData = this.paymentForm.value;
      this.cardinfo.amount = formData.amount;
      this.cardinfo.cardnumber = formData.cardNumber;
      this.cardinfo.cvv = formData.cvv;
      console.log('Form submitted:', formData);
      // Call the service to process the payment
      this.fundService.addfund(this.cardinfo).subscribe(
        response => {
        console.log('Payment processed successfully:', response);
        // Handle success response
      }, error => {
        console.error('Error processing payment:', error);
        // Handle error response
      }
    );
    } else {
      console.log('Form is invalid');
    }
  }
}
