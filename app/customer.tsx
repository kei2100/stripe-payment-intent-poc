import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import Script from "next/script";
import {loadStripe} from "@stripe/stripe-js";
import {CardElement, Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import Link from "next/link";

export const Customer: FC<{ id: string }> = ({ id }) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

  const [clientSecret, setClientSecret] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    (async () => {
      setPaymentMethods(await getPaymentMethods(id))
      setClientSecret((await createSetupIntent(id)).clientSecret)
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
      <p>Customer id: <a href={`https://dashboard.stripe.com/test/customers/${id}`}>{id}</a></p>
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
    // use legacy Token/Source API
    // const tokenResponse = await stripe.createToken(elements.getElement(CardElement))
    // if (tokenResponse.error) {
    //   alert(tokenResponse.error.message)
    //   return
    // }
    // const cardResponse = await createLegacyCard(customerId, tokenResponse.token.id)
    // console.log(cardResponse)

    const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    })
    if (error) {
      alert(error.message)
      return
    }
    const paymentMethod = await attachPaymentMethod(customerId, setupIntent.payment_method as string)
    setPaymentMethods([paymentMethod, ...paymentMethods])
    setClientSecret((await createSetupIntent(customerId)).clientSecret)
  }

  return <div>
    <CardElement options={{ hidePostalCode: true }}/>
    <button onClick={onSubmitCreatePaymentMethod}>Create PaymentMethod</button>
  </div>
}

const PaymentMethod: FC<{ customerId: string, paymentMethod: PaymentMethod }> = ({
                                                                                   customerId,
                                                                                   paymentMethod
                                                                                 }) => {
  return <div>
    <div>
      <p>PaymentMethod id: <Link href={`/payment_method/${paymentMethod.id}`}>{paymentMethod.id}</Link></p>
      <p>
        {paymentMethod.brand} ･･････{paymentMethod.last4} ({paymentMethod.expMonth}/{paymentMethod.expYear})
      </p>
    </div>
  </div>
}

async function getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${customerId}/payment_methods`)
  return await res.json()
}

async function createSetupIntent(customerId: string): Promise<SetupIntent> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${customerId}/setup_intents`, {
    method: 'POST',
  })
  return await res.json()
}

async function createLegacyCard(customerId: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${customerId}/sources`, {
    method: 'POST',
    body: JSON.stringify({ token }),
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