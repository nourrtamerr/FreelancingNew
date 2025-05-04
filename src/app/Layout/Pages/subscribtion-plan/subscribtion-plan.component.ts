import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionPaymentService } from '../../../Shared/Services/Subscribtion plan Payment/subscribtionpayment.service';
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { CardPaymentDTO } from '../../../Shared/Interfaces/CardPaymentDTO';
import { SubscriptionService } from '../../../Shared/Services/Subscribtion/subscribtion.service'; // Import the interface for subscription details

@Component({
  selector: 'app-subscribtion-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribtion-plan.component.html',
  styleUrls: ['./subscribtion-plan.component.css']
})
export class SubscribtionPlanComponent implements OnInit {
  plans = [
    {
      id: 1,
      name: 'Starter',
      price: 0.00,
      duration: 30,
      totalNumber: 6,
      description: 'Basic access',
      features: [
        'Basic Access',
        '6 Project Proposals',
        '30 Days Duration',
        'Basic Profile Features'
      ]
    },
    {
      id: 2,
      name: 'Pro Freelancer',
      price: 100.00,
      duration: 60,
      totalNumber: 30,
      description: 'More bids',
      features: [
        '30 Project Proposals',
        'Pro Profile Badge',
        '60 Days Duration',
        'More Bids Available',
        'Priority Support'
      ]
    },
    {
      id: 3,
      name: 'Elite',
      price: 200.00,
      duration: 90,
      totalNumber: 60,
      description: 'Maximum exposure',
      features: [
        '60 Project Proposals',
        'Elite Profile Badge',
        '90 Days Duration',
        'Maximum Exposure',
        'Premium Support',
        'Featured Profile'
      ]
    }
  ];

  selectedPlanId: number | null = null;
  showCardForm = false;

  cardData: CardPaymentDTO = {
    amount: 0,
    cardnumber: '',
    cvv: 0
  };

  constructor(
    private router: Router,
    private subscriptionService: SubscriptionPaymentService,
    private subscibtionuserid : SubscriptionService 
  ) {}

  ngOnInit(): void {}

  showPaymentOptions(planId: number) {
    this.selectedPlanId = planId;
    this.showCardForm = false;
    const selectedPlan = this.plans.find(p => p.id === planId);
    if (selectedPlan) {
      this.cardData.amount = selectedPlan.price;
    }
  }

  closeModal() {
    this.selectedPlanId = null;
    this.showCardForm = false;
  }




  // ... existing code ...

closePaymentOptions() {
  // Reset the selected plan ID to null to hide the payment options
  this.selectedPlanId = null;
  
  // Reset the card form visibility
  this.showCardForm = false;
  
  // Reset any card data if it exists
  if (this.cardData) {
    this.cardData = {
      amount: 0,
      cardnumber: '',
      cvv: 0
     
    };
  }
}




payWithStripe() {
  if (this.selectedPlanId !== null) {
    this.subscriptionService.payWithStripe(this.selectedPlanId).subscribe({
      next: (res: any) => {
        window.location.href = res.url; // ✅ Now works correctly
        console.log('Redirecting to Stripe URL:', res);
        this.router.navigate(['/paymentsucess']);
      },
      error: (err) => {
        console.error('Stripe error:', err);
      }
    });
  }
}

payWithBalance() {
  if (this.selectedPlanId !== null) {
    this.subscriptionService.payWithBalance(this.selectedPlanId).subscribe({
      next: () => {
        this.closeModal();
        this.router.navigate(['/paymentsucess']);
      },
      error: (err) => {
        alert('Failed to pay from balance: ' + err.error);
      }
    });
  }
}

payWithCard() {
  if (this.selectedPlanId !== null) {
    this.subscriptionService.payWithCard(this.selectedPlanId, this.cardData).subscribe({
      next: (res) => {
        this.closeModal();
        this.router.navigate(['/paymentsucess']);
      },
      error: (err) => {
        console.error('Card payment error:', err);
        alert('Payment failed');
      }
    });
  }
}

currentPlanDetails: any = null;
subscription$: any | null = null;
viewCurrentPlan() {
  // Call your SubscriptionPaymentService to fetch the current user's subscription plan
  this.subscription$ = this.subscibtionuserid.getCurrentSubscription().subscribe({
    next: (planDetails: any) => {
      if (planDetails) {
        // Store the details of the current plan into the `currentPlanDetails`
        this.currentPlanDetails = {
          id: planDetails.id,
          name: planDetails.name,
          description: planDetails.description,
          price: planDetails.price,
          duration: planDetails.durationInDays,
          totalNumber: planDetails.totalNumber
        };
      } else {
        this.currentPlanDetails = null;
      }
    },
    error: (err) => {
      console.error('Error fetching current subscription plan:', err);
      this.currentPlanDetails = null;
    }
  });
}


ngOnDestroy(): void {
  if (this.subscription$) {
    this.subscription$.unsubscribe();
  }
}



}
