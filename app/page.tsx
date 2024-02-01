'use client';

import {useEffect, useState} from "react";
import { Customer } from "./customer";

export default function Page() {
  const [customerId, setCustomerId] = useState<string>('')

  useEffect(() => {
    (async () => {
      const customerId = window.localStorage.getItem("customerId")
      if (!customerId) {
        return
      }
      const customer = await getCustomer(customerId)
      if (!customer) {
        return
      }
      setCustomerId(customer.id)
    })()
  }, [])

  async function onSubmitCreateCustomer() {
    const customer = await createCustomer()
    window.localStorage.setItem("customerId", customer.id)
    setCustomerId(customer.id)
  }

  if (!customerId) {
    return <div>
        <button onClick={onSubmitCreateCustomer}>Create Customer</button>
    </div>
  }
  return <div>
      <Customer id={customerId}/>
  </div>
}

async function getCustomer(id: string): Promise<Customer|null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${id}`)
  if (res.status === 404) {
    return null
  }
  return await res.json()
}

async function createCustomer(): Promise<Customer> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/customers`, {
    method: "POST",
  })
  return await res.json()
}