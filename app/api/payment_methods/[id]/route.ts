import stripe from "../../_lib/stripe";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const stripePaymentMethod = await stripe.paymentMethods.retrieve(params.id)
  const card = stripePaymentMethod.card
  const paymentMethod: PaymentMethod = {
    id: stripePaymentMethod.id,
    customerId: stripePaymentMethod.customer || "",
    brand: card.brand,
    last4: card.last4,
    expMonth: card.exp_month,
    expYear: card.exp_year,
  }
  return Response.json(paymentMethod)
}
