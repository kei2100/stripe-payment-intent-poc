import {FC, useState} from "react";
import {useStripe} from "@stripe/react-stripe-js";

export const PaymentMethod: FC<{ customerId: string, paymentMethod: PaymentMethod }> = ({
                                                                                          customerId,
                                                                                          paymentMethod
                                                                                        }) => {
  const [amount, setAmount] = useState("")
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState("")
  const [useOffSession, setUseOffSession] = useState(true)
  const stripe = useStripe();

  async function onSubmitCharge() {
    const data = await createPaymentIntent(customerId, paymentMethod.id, parseInt(amount), useOffSession)
    console.log(data)
    if (data.error) {
      alert(data.error)
      return
    }
    alert(`payment_intent created. status: ${data.paymentIntent.status}`)
  }

  async function onSubmitConfirmPayment() {
    const { error } = await stripe.confirmPayment({
      clientSecret: paymentIntentClientSecret,
      confirmParams: {
        payment_method: paymentMethod.id,
        return_url: process.env.NEXT_PUBLIC_BASE_URL
      }
    })
    if (error) {
      console.log(error)
      alert(`error code:${error.code} message:${error.message}`)
      return
    }
    alert('payment_intent confirmed.')
  }

  return <div>
    <div>
      <p>PaymentMethod id: {paymentMethod.id}</p>
      <p>last4: {paymentMethod.last4}</p>
      <p>brand: {paymentMethod.brand}</p>
      <p>expMonth: {paymentMethod.expMonth}</p>
      <p>expYear: {paymentMethod.expYear}</p>
    </div>
    <div>
      <div>
        <input type={'text'} placeholder={'amount'} value={amount} onChange={(event) => {
          setAmount(event.target.value)
        }}/>
        <button onClick={onSubmitCharge}>Charge</button>
        <label htmlFor={`useOffSession-${paymentMethod.id}`}>use off session: </label>
        <input type={'checkbox'} id={`useOffSession-${paymentMethod.id}`} checked={useOffSession} onChange={() => {
          setUseOffSession(!useOffSession)
        }}/>
      </div>
      <div>
        <input type={'text'} placeholder={'payment intent client secret'} value={paymentIntentClientSecret}
               onChange={(event) => {
                 setPaymentIntentClientSecret(event.target.value)
               }}/>
        <button onClick={onSubmitConfirmPayment}>Confirm Payment</button>
      </div>
    </div>
  </div>
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