interface PaymentIntent {
  id: string
  amount: number
  clientSecret: string
  status: string
  last_payment_error_code: string | null
  created: number // Unix timestamp
}