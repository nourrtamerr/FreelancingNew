import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionPaymentService } from '../../../Shared/Services/Subscribtion plan Payment/subscribtionpayment.service';

@Component({
  selector: 'app-subscribtion-plan',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    private router: Router,
    private subscriptionService: SubscriptionPaymentService
  ) {}

  ngOnInit(): void {}

  selectPlan(planId: number) {
    const selectedPlan = this.plans.find(p => p.id === planId);

    if (!selectedPlan) return;

    if (selectedPlan.price === 0) {
      // Free plan — activate immediately from balance
      this.subscriptionService.payFromBalance(planId).subscribe({
        next: () => {
          alert('Free plan activated successfully');
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error(err);
          alert('Failed to activate free plan');
        }
      });
    } else {
      // Paid plan — redirect to Stripe
      this.subscriptionService.payFromStripe(planId).subscribe({
        next: (url: string) => {
          window.location.href = url; // Redirect to Stripe Checkout
        },
        error: err => {
          console.error(err);
          alert('Failed to redirect to payment');
        }
      });
    }
  }
}
