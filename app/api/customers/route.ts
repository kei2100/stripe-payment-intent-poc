import stripe from "../_lib/stripe";

export async function POST(request: Request) {
  try {
    const stripeCustomer = await stripe.customers.create()
    const customer: Customer = { id: stripeCustomer.id }
    return Response.json(customer)
  } catch (error) {
    console.error(error)
    return Response.json({}, { status: 500 })
  }
}