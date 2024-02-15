'use client';

import {FC, useEffect, useState} from "react";
import {loadStripe} from "@stripe/stripe-js";
import Script from "next/script";
import {Elements, useStripe} from "@stripe/react-stripe-js";

export default function Page({ params }: { params: { slug: string } }) {
  const paymentMethodId = params.slug

  const [customerId, setCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([])
  const [useOffSession, setUseOffSession] = useState(true)
  const [amount, setAmount] = useState("")

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

  useEffect(() => {
    (async () => {
      const paymentMethod = await getPaymentMethod(paymentMethodId)
      setCustomerId(paymentMethod.customerId)
      setPaymentMethod(paymentMethod)

      const paymentIntents = await listPaymentIntents(paymentMethodId)
      setPaymentIntents(paymentIntents)
    })()
  }, [])

  async function onSubmitCreatePaymentIntent() {
    const data = await createPaymentIntent(customerId, paymentMethodId, parseInt(amount), useOffSession)
    if (data.error) {
      alert(data.error)
    } else {
      alert(`payment_intent created. status: ${data.paymentIntent.status}`)
    }
    setPaymentIntents([data.paymentIntent, ...paymentIntents])
  }

  if (!paymentMethod) {
    return <div/>
  }

  return <div>
    <div>
      <p>PaymentMethod id: {paymentMethodId}</p>
      <p>
        {paymentMethod.brand} ･･････{paymentMethod.last4} ({paymentMethod.expMonth}/{paymentMethod.expYear})
      </p>
    </div>
    <div>
      <input type={'text'} placeholder={'amount'} value={amount} onChange={(event) => {
        setAmount(event.target.value)
      }}/>
      <button onClick={onSubmitCreatePaymentIntent}>Create Payment Intent</button>
      <label htmlFor={`useOffSession-${paymentMethodId}`}> off-session: </label>
      <input type={'checkbox'} id={`useOffSession-${paymentMethodId}`} checked={useOffSession} onChange={() => {
        setUseOffSession(!useOffSession)
      }}/>
    </div>
    <div>
      <Script src="https://js.stripe.com/v3/"/>
      <Elements stripe={stripePromise}>
        {paymentIntents.map((paymentIntent) => {
          return <div key={paymentIntent.id}>
            <PaymentIntent paymentMethodId={paymentMethodId} paymentIntent={paymentIntent}/>
          </div>
        })}
      </Elements>
    </div>
  </div>
}

const PaymentIntent: FC<{ paymentMethodId: string, paymentIntent: PaymentIntent }> = ({ paymentMethodId, paymentIntent }) => {
  const status = paymentIntent.last_payment_error_code || paymentIntent.status
  const [wantAuthentication, setWantAuthentication] = useState(status === 'authentication_required')
  const stripe = useStripe();

  async function onSubmitAuthenticate() {
    const { error } = await stripe.confirmPayment({
      clientSecret: paymentIntent.clientSecret,
      confirmParams: {
        payment_method: paymentMethodId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment_method/${paymentMethodId}`,
      }
    })
    if (error) {
      alert(`error code:${error.code} message:${error.message}`)
      return
    }
    alert('payment_intent confirmed.')
  }

  return <div>
    <p>PaymentIntent id: <a
      href={`https://dashboard.stripe.com/test/payments/${paymentIntent.id}`}>{paymentIntent.id}</a></p>
    <p>amount: {paymentIntent.amount}</p>
    <p>created: {new Date(paymentIntent.created * 1000).toString()}</p>
    <p>status: {status} <button onClick={onSubmitAuthenticate} disabled={!wantAuthentication}>Authenticate</button>
    </p>
  </div>
}

async function getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment_methods/${paymentMethodId}`)
  return await res.json()
}

async function listPaymentIntents(paymenMethodId: string): Promise<PaymentIntent[]> {
  // payment_intents の search は新しすぎるデータは検索できない模様...プロダクションでは別の仕組みで取得すべき
  // > https://docs.stripe.com/search#%E5%88%B6%E9%99%90%E4%BA%8B%E9%A0%85
  // > データは即時に検索可能にならないため、read-after-write (書き込み後の読み取り)
  // > フローの検索 (支払い実行直後の検索など) は使用しないでください。
  // > 通常の動作条件では、データは 1 分以内に検索可能になりますが、障害が発生した場合は、新しいデータや更新されたデータが反映されるまでに時間がかかることもあります。
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment_intents?payment_method_id=${paymenMethodId}`)
  return await res.json()
}

async function createPaymentIntent(
  customerId: string,
  paymentMethodId: string,
  amount: number,
  useOffSession: boolean,
) {
  const res = await fetch('/api/payment_intents', {
    method: 'POST',
    body: JSON.stringify({ customerId, paymentMethodId, amount, useOffSession })
  })
  return await res.json()
}

