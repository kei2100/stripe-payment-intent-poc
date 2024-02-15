import stripe from "../_lib/stripe";
import {PaymentIntent} from "@stripe/stripe-js";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentMethodId = url.searchParams.get('payment_method_id')
  // payment_intents の search は新しすぎるデータは検索できない模様...プロダクションでは別の仕組みで取得すべき
  // > https://docs.stripe.com/search#%E5%88%B6%E9%99%90%E4%BA%8B%E9%A0%85
  // > データは即時に検索可能にならないため、read-after-write (書き込み後の読み取り)
  // > フローの検索 (支払い実行直後の検索など) は使用しないでください。
  // > 通常の動作条件では、データは 1 分以内に検索可能になりますが、障害が発生した場合は、新しいデータや更新されたデータが反映されるまでに時間がかかることもあります。
  const stripePaymentIntents = await stripe.paymentIntents.search({
    query: `metadata["payment_method_id"]:"${paymentMethodId}"`,
    limit: 100,
  });
  const paymentIntents: PaymentIntent[] = stripePaymentIntents.data.map(pi => {
    return {
      id: pi.id,
      amount: pi.amount,
      clientSecret: pi.client_secret,
      status: pi.status,
      created: pi.created,
      last_payment_error_code: pi.last_payment_error?.code || null,
    }
  })
  return Response.json(paymentIntents);
}

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
      metadata: {
        payment_method_id: paymentMethodId,
      }
    });

    createPaymentIntent.paymentIntent = {
      id: stripePaymentIntent.id,
      amount: stripePaymentIntent.amount,
      clientSecret: stripePaymentIntent.client_secret,
      status: stripePaymentIntent.status,
      created: stripePaymentIntent.created,
      last_payment_error_code: null,
    }
    return Response.json(createPaymentIntent);
  } catch (error) {
    createPaymentIntent.error = error.toString()
    // error.payment_intent から、authentication_required 状態の payment_intent の id, client_secret などを参照することができる
    const stripePaymentIntent = error.payment_intent
    createPaymentIntent.paymentIntent = {
      id: stripePaymentIntent.id,
      amount: stripePaymentIntent.amount,
      clientSecret: stripePaymentIntent.client_secret,
      status: stripePaymentIntent.status,
      created: stripePaymentIntent.created,
      last_payment_error_code: stripePaymentIntent.last_payment_error?.code || null,
    }
    return Response.json(createPaymentIntent, { status: 500 })
  }
}
