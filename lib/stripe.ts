import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Price ID for the £1.99 one-time payment
export const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

// Redirect to Stripe Checkout
export const redirectToCheckout = async () => {
  if (!PRICE_ID) {
    console.error('Stripe Price ID not configured')
    return false
  }

  const stripe = await stripePromise
  if (!stripe) {
    console.error('Stripe failed to load')
    return false
  }

  try {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      successUrl: `${window.location.origin}/builder?payment=success`,
      cancelUrl: `${window.location.origin}/builder?payment=cancelled`,
    })

    if (error) {
      console.error('Stripe checkout error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    return false
  }
}

// Client helper for starting checkout with a specific price ID
// Falls back to default PRICE_ID if not provided
export const startCheckout = async (priceId?: string) => {
  const targetPriceId = priceId || PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
  
  if (!targetPriceId) {
    console.error('Stripe Price ID not configured')
    return false
  }

  const stripe = await stripePromise
  if (!stripe) {
    console.error('Stripe failed to load')
    return false
  }

  try {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: targetPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      successUrl: `${window.location.origin}/builder?payment=success`,
      cancelUrl: `${window.location.origin}/builder?payment=cancelled`,
    })

    if (error) {
      console.error('Stripe checkout error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    return false
  }
}
