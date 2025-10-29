# Environment Variables for Soft Paywall System

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# OpenAI API (existing)
OPENAI_API_KEY=sk-...
```

## Stripe Setup Instructions

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account setup process

### 2. Get Publishable Key
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy the "Publishable key" (starts with `pk_test_` for test mode)
3. Add it to your `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3. Create Product and Price
1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Set product name: "AI CV Builder - 24 Hour Access"
4. Set price: £1.99 (one-time payment)
5. Save the product
6. Copy the Price ID (starts with `price_`)
7. Add it to your `.env.local` as `NEXT_PUBLIC_STRIPE_PRICE_ID`

### 4. Configure Webhooks (Optional)
For production, set up webhooks to handle payment confirmations:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`

## Testing the Paywall

### Test Mode
- Use test publishable keys (starts with `pk_test_`)
- Use test card numbers from Stripe documentation
- No real money will be charged

### Test Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and any 3-digit CVC

## Production Deployment

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle to "Live mode"
2. Get live publishable key (starts with `pk_live_`)
3. Update environment variables

### 2. Update Price ID
1. Create the same product in live mode
2. Update `NEXT_PUBLIC_STRIPE_PRICE_ID` with live price ID

### 3. Domain Configuration
1. Add your domain to Stripe Dashboard → Settings → Domains
2. Update success/cancel URLs in `lib/stripe.ts` if needed

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables in production (Vercel, Netlify, etc.)
- The publishable key is safe to expose in client-side code
- Never expose secret keys in client-side code

## Troubleshooting

### Common Issues
1. **"Stripe Price ID not configured"** - Check `NEXT_PUBLIC_STRIPE_PRICE_ID` is set
2. **"Stripe failed to load"** - Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
3. **Payment not working** - Verify you're using the correct price ID for your Stripe mode (test/live)

### Debug Mode
Add this to your `.env.local` for debugging:
```env
NEXT_PUBLIC_DEBUG_PAYWALL=true
```

This will log paywall events to the browser console.


