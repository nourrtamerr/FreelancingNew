import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FundandwithdrawService } from '../../../Shared/Services/FundandWithdraw/fundandwithdraw.service';
import { FundsCard } from '../../../Shared/Interfaces/funds-card';
import { CommonModule } from '@angular/common';
import { AppUser } from '../../../Shared/Interfaces/Account';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-withdraw',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.css'
})
export class WithdrawComponent {
  paymentForm: FormGroup;
  selectedPaymentMethod: string = 'card';
  processingFee: number = 0.99;
  cardinfo: FundsCard = {
    amount: 0,
    cardnumber: '',
    cvv: 0
  };
    profile!:AppUser

  constructor(
    private fb: FormBuilder,
    private fundService: FundandwithdrawService,
    private toaster: ToastrService,
    private accountService: AccountService,
    private router:Router
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

    this.accountService.myPorfile().subscribe((profile: AppUser) => {
      this.profile = profile;
      console.log('Profile:', profile);
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

  withdraw() {
    // Handle withdrawal logic here
    if (this.selectedPaymentMethod === 'stripe') {
      // Direct Stripe payment without form
      const amount = this.paymentForm.get('amount')?.value || 0;
      if (amount > 0) {
        // Call stripe payment directly
        this.fundService.stripewithdraw(amount,"ali@ali.com").subscribe(
          response => {
            console.log('Stripe payment initiated:', response);
            // Redirect to Stripe payment page or handle response
            if (response.url) {
              window.location.href = response.url;
            }
          },
          error => {
            console.error('Error initiating Stripe payment:', error);
            console.log(error);
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
    if (this.paymentForm.valid) {
      const formData = this.paymentForm.value;
      this.cardinfo.amount = formData.amount;
      this.cardinfo.cardnumber = formData.cardNumber;
      this.cardinfo.cvv = formData.cvv;
      console.log('Form submitted:', formData);
      // Call the service to process the payment
      this.fundService.cardwithdraw(this.cardinfo).subscribe(
        response => {
          this.router.navigate(['/paymentsucess']);
        console.log('Payment processed successfully:', response);
        // Handle success response
      }, error => {
        console.error('Error processing payment:', error);
        this.toaster.error('invalid credit card', 'Error', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
        // Handle error response
      }
    );
    } else {
      console.log('Form is invalid');
    }
  }
}
}
