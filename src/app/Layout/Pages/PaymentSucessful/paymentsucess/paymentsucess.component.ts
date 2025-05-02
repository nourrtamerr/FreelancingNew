import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-paymentsucess',
  templateUrl: './paymentsucess.component.html',
  styleUrls: ['./paymentsucess.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class PaymentsucessComponent implements OnInit {
  currentDate: Date = new Date();
  transactionId: string = '';
  selectedPlanName: string = '';
  selectedPlanPrice: number = 0;

  plans = [
    { id: 1, name: 'Starter', price: 0 },
    { id: 2, name: 'Pro Freelancer', price: 100 },
    { id: 3, name: 'Elite', price: 200 }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['sessionId'];
      const planId = Number(params['planId']);

      this.transactionId = sessionId ?? 'N/A';

      const selectedPlan = this.plans.find(p => p.id === planId);
      if (selectedPlan) {
        this.selectedPlanName = selectedPlan.name;
        this.selectedPlanPrice = selectedPlan.price;
      }
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToPayments() {
    this.router.navigate(['/payments']);
  }
}
