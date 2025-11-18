'use client';

/**
 * Creates a Stripe checkout session and redirects to Stripe Checkout
 * @returns Promise<boolean> - true if redirect was initiated, false on error
 */
export async function createCheckout(): Promise<boolean> {
  try {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: Failed to create checkout session`);
    }

    const data = await res.json();
    
    // Check for url first (preferred)
    if (data.url) {
      window.location.href = data.url;
      return true;
    }
    
    // Fallback to sessionId if url not provided (requires Stripe.js)
    if (data.sessionId && typeof window !== 'undefined' && (window as any).Stripe) {
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
      return true;
    }
    
    throw new Error('No checkout URL or sessionId returned from server');
  } catch (err) {
    console.error('Stripe checkout error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    alert(`Checkout failed: ${message}`);
    return false;
  }
}

// Legacy export name for backwards compatibility
export const startCheckout = createCheckout;