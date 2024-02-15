import stripe from "../../../_lib/stripe";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const stripePaymentMethods = await stripe.customers.listPaymentMethods(params.id, { limit: 100 });
  const paymentMethods: PaymentMethod[] = stripePaymentMethods.data.map((stripePaymentMethod) => {
    const card = stripePaymentMethod.card;
    return {
      id: stripePaymentMethod.id,
      customerId: stripePaymentMethod.customer || "",
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
    }
  })
  return Response.json(paymentMethods);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { paymentMethodId } = await request.json()

  const stripePaymentMethod = await stripe.paymentMethods.attach(paymentMethodId,
    { customer: params.id }
  );
  const card = stripePaymentMethod.card
  const paymentMethod: PaymentMethod = {
    id: stripePaymentMethod.id,
    customerId: stripePaymentMethod.customer || "",
    brand: card.brand,
    last4: card.last4,
    expMonth: card.exp_month,
    expYear: card.exp_year,
  }
  return Response.json(paymentMethod);
}