interface CreatePaymentIntent {
  paymentIntent: {
    id: string
    status: string
  } | null,
  error: string | null
}