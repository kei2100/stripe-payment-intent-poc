import stripe from "../_lib/stripe";

export async function POST(request: Request) {
  const stripeSetupIntent = await stripe.setupIntents.create({
    // automatic_payment_methods: {
    //   enabled: true,
    //   allow_redirects: 'never'
    // }
  })
  const setupIntent: SetupIntent = { clientSecret: stripeSetupIntent.client_secret };
  return Response.json(setupIntent);
}