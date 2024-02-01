import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {PaymentMethod} from "./payment_method";
import Script from "next/script";
import {loadStripe} from "@stripe/stripe-js";
import {CardElement, Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";

export const Customer: FC<{ id: string }> = ({ id }) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

  const [clientSecret, setClientSecret] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    (async () => {
      setPaymentMethods(await getPaymentMethods(id))
      setClientSecret((await createSetupIntent()).clientSecret)
    })()
  }, [])

  if (!clientSecret) {
    return <div/>
  }

  const stripeElementsOptions = {
    clientSecret: clientSecret,
  };

  return <div>
    <div>
      <p>Customer id: {id}</p>
    </div>
    <div>
      <Script src="https://js.stripe.com/v3/"/>
      <Elements stripe={stripePromise} options={stripeElementsOptions}>
        <CardForm
          customerId={id}
          clientSecret={clientSecret}
          paymentMethods={paymentMethods}
          setPaymentMethods={setPaymentMethods}
          setClientSecret={setClientSecret}
        />
      </Elements>
    </div>
    <div>
      {paymentMethods.map((paymentMethod) => {
        return <div key={paymentMethod.id}>
          <PaymentMethod customerId={id} paymentMethod={paymentMethod}/>
        </div>
      })}
    </div>
  </div>
}

const CardForm: FC<{
  customerId: string,
  clientSecret: string,
  paymentMethods: PaymentMethod[],
  setPaymentMethods: Dispatch<SetStateAction<PaymentMethod[]>>
  setClientSecret: Dispatch<SetStateAction<string>>
}> = ({
        customerId,
        clientSecret,
        paymentMethods,
        setPaymentMethods,
        setClientSecret,
      }) => {
  const stripe = useStripe();
  const elements = useElements();

  async function onSubmitCreatePaymentMethod() {
    const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    })
    if (error) {
      alert(error.message)
      console.log(error)
      return
    }
    const paymentMethod = await attachPaymentMethod(customerId, setupIntent.payment_method as string)
    setPaymentMethods([paymentMethod, ...paymentMethods])
    setClientSecret((await createSetupIntent()).clientSecret)
  }

  return <div>
    <CardElement options={{ hidePostalCode: true }}/>
    <button onClick={onSubmitCreatePaymentMethod}>Create PaymentMethod</button>
  </div>
}

async function getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${customerId}/payment_methods`)
  return await res.json()
}

async function createSetupIntent(): Promise<SetupIntent> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/setup_intents`, {
    method: 'POST',
  })
  return await res.json()
}

async function attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentMethod> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${customerId}/payment_methods`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethodId }),
  })
  return await res.json()
}