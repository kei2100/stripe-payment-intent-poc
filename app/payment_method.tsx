import {FC, useState} from "react";

export const PaymentMethod: FC<{ customerId: string, paymentMethod: PaymentMethod }> = ({ customerId, paymentMethod }) => {
  const [amount, setAmount] = useState("")
  const [useOffSession, setUseOffSession] = useState(true)

  async function onSubmitCharge() {
    const data = await createPaymentIntent(customerId, paymentMethod.id, parseInt(amount), useOffSession)
    console.log(data)
    if (data.error) {
      alert(data.error)
      return
    }
    alert(`payment_intent created. status: ${data.paymentIntent.status}`)
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
      </div>
      <div>
        <label htmlFor={`useOffSession-${paymentMethod.id}`} >use off session: </label>
        <input type={'checkbox'} id={`useOffSession-${paymentMethod.id}`} checked={useOffSession} onChange={() => { setUseOffSession(!useOffSession)}}/>
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