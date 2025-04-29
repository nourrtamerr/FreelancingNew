export enum PaymentMethod {
    CreditCard = 'CreditCard',
    Stripe = 'Stripe',
    Balance = 'Balance'
  }

  export interface CardPaymentDTO {
    amount: number;
    cardNumber: string;
    cvv: number;
  }