interface PaymentMethod {
  id: string;
  customerId: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
}