stripe-payment-intent-poc
=

A PoC for register 3DS cards and off-session charges 
using Stripe Payment Intents and Setup Intents

## Usage

```bash
$ cp .env.local.example .env.local

# Edit the Stripe API keys in .env.local
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
# STRIPE_SECRET_KEY=sk_xxxxxx

$ npm install
$ npm run dev
```

## See also

https://stripe.com/docs/testing#regulatory-cards

