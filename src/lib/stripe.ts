import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';

export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration
export const STRIPE_CONFIG = {
  // Test mode - set to false for production
  testMode: true,
  // Currency
  currency: 'usd',
  // Appearance customization
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3b82f6', // blue-500
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      borderRadius: '8px',
    },
  },
};
