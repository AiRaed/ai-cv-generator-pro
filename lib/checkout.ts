/**
 * Client-side helper function to start Stripe Checkout
 */
export async function startCheckout() {
  try {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Checkout session could not be created.')
    }
  } catch (error) {
    console.error('Error starting checkout:', error)
    alert('Checkout session could not be created.')
  }
}


