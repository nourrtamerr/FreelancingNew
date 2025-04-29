import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {}

  selectPlan(planId: number) {
    // Here you can implement the logic to handle plan selection
    // For example, navigate to payment page or save selection
    console.log(`Selected plan: ${planId}`);
    // this.router.navigate(['/payment'], { queryParams: { planId: planId } });
  }
}