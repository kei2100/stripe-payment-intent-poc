import stripe from "../../../_lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { token } = await request.json()
  const card = await stripe.customers.createSource(params.id, { source: token })
  return Response.json(card);
}
