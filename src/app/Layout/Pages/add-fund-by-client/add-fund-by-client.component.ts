import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FundandwithdrawService } from '../../../Shared/Services/FundandWithdraw/fundandwithdraw.service';
import { FundsCard } from '../../../Shared/Interfaces/funds-card';
import { ToastrService } from 'ngx-toastr';

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
    private fundService: FundandwithdrawService,
    private toaster: ToastrService
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
    if (this.selectedPaymentMethod === 'stripe') {
      // Direct Stripe payment without form
      const amount = this.paymentForm.get('amount')?.value || 0;
      if (amount > 0) {
        // Call stripe payment directly
        this.fundService.stripefund(amount,"admin@admin").subscribe(
          response => {
            console.log('Stripe payment initiated:', response);
            // Redirect to Stripe payment page or handle response
            if (response.url) {
              window.location.href = response.url;
            }
          },
          error => {
            console.error('Error initiating Stripe payment:', error);
            this.toaster.error('Failed to initiate Stripe payment', 'Error', {
              timeOut: 3000,
              progressBar: true,
              closeButton: true
            });
          }
        );
      } else {
        this.toaster.error('Please enter a valid amount', 'Error', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }
    } else {
      // Original payment form logic
      if (this.paymentForm.valid) {
        const formData = this.paymentForm.value;
        this.cardinfo.amount = formData.amount;
        this.cardinfo.cardnumber = formData.cardNumber;
        this.cardinfo.cvv = formData.cvv;

        this.fundService.cardfund(this.cardinfo).subscribe(
          (response:any) => {
            window.location.href=response.url;
            console.log('Payment processed successfully:', response);
          },
          error => {
            console.error('Error processing payment:', error);
            this.toaster.error('invalid credit card', 'Error', {
              timeOut: 3000,
              progressBar: true,
              closeButton: true
            });
          }
        );
      }
    }
  }
}
