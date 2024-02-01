import stripe from "../../_lib/stripe";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stripeCustomer = await stripe.customers.retrieve(params.id)
    const customer: Customer = { id: stripeCustomer.id }
    return Response.json(customer)
  } catch (error) {
    console.error(error)
    return Response.json({}, { status: 404 })
  }
}