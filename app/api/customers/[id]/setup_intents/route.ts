import stripe from "../../../_lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const stripeSetupIntent = await stripe.setupIntents.create({
    customer: params.id,
  })
  const setupIntent: SetupIntent = { clientSecret: stripeSetupIntent.client_secret };
  return Response.json(setupIntent);
}