import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-paymentsucess',
  templateUrl: './paymentsucess.component.html',
  imports: [RouterModule],
  styleUrls: ['./paymentsucess.component.css']
})
export class PaymentsucessComponent implements OnInit {
  currentDate: Date = new Date();
  transactionId: string;

  constructor(private router: Router) {
    // Generate a random transaction ID for demo purposes
    this.transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  ngOnInit(): void {
    // You can add any initialization logic here
    // For example, getting transaction details from a service
  }

  // Navigation methods
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToPayments() {
    this.router.navigate(['/payments']);
  }
}