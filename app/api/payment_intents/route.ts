import stripe from "../_lib/stripe";

export async function POST(request: Request) {
  const {
    customerId,
    paymentMethodId,
    amount,
    useOffSession,
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
      off_session: useOffSession,
      return_url: useOffSession ? undefined : process.env.NEXT_PUBLIC_BASE_URL,
    });

    createPaymentIntent.paymentIntent = {
      id: stripePaymentIntent.id,
      status: stripePaymentIntent.status,
    }
    return Response.json(createPaymentIntent);
  } catch (error) {
    console.log(error) // error.payment_intent から、authentication_required 状態の payment_intent の id, client_secret などを参照することができる
    createPaymentIntent.error = error.toString()
    return Response.json(createPaymentIntent, { status: 500 })
  }
}
