'use client';

export async function startCheckout(): Promise<boolean> {
  try {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create checkout session');

    const { url } = await res.json();
    if (!url) throw new Error('No checkout URL returned');

    window.location.href = url; // تحويل مباشر لصفحة الدفع
    return true;
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return false;
  }
}