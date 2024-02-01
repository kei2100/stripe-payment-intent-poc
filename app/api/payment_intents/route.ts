import stripe from "../_lib/stripe";

export async function POST(request: Request) {
  const {
    customerId,
    paymentMethodId,
    amount,
  } = await request.json()

  const createPaymentIntent: CreatePaymentIntent = {
    paymentIntent: null,
    error: null,
  }
  try {
    const stripePaymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'jpy',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true
    });
    createPaymentIntent.paymentIntent = {
      id: stripePaymentIntent.id,
      status: stripePaymentIntent.status,
    }
    return Response.json(createPaymentIntent);
  } catch (error) {
    createPaymentIntent.error = error.toString()
    return Response.json(createPaymentIntent, { status: 500 })
  }
}
