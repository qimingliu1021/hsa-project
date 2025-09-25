'use client';

import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import SimplePaymentForm from './SimplePaymentForm';
import { STRIPE_CONFIG } from '@/lib/stripe';

interface PaymentWrapperProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here'
);

export default function PaymentWrapper({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  disabled = false 
}: PaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Creating payment intent for amount:', amount);
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: STRIPE_CONFIG.currency,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Payment intent response:', data);

        if (data.error) {
          setError(data.error);
          onPaymentError(data.error);
          return;
        }

        if (!data.clientSecret) {
          throw new Error('No client secret received from server');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment intent creation error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent';
        setError(errorMessage);
        onPaymentError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, onPaymentError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading payment options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">Initializing payment system...</p>
      </div>
    );
  }

  // Validate clientSecret format
  if (!clientSecret.startsWith('pi_') || !clientSecret.includes('_secret_')) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">Invalid payment configuration. Please try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: STRIPE_CONFIG.appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <SimplePaymentForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        disabled={disabled}
      />
    </Elements>
  );
}
