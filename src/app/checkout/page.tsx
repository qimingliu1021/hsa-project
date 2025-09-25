'use client';

import { useState, useEffect } from 'react';
import StripeProvider from '@/components/StripeProvider';
import PaymentForm from '@/components/PaymentForm';

interface BookingData {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  appointmentDate: string;
  appointmentTime: string;
  healthQuestionnaireData: {
    age: string;
    hsaProvider: string;
    stateOfResidence: string;
    diagnosedConditions: string[];
    otherDiagnosedConditions: string;
    riskFactors: string;
    conditionsPreventing: string[];
    otherConditionsPreventing: string;
    attestation: boolean;
  };
}

export default function CheckoutPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'hsa' | 'card'>('card');
  const [hsaProvider, setHsaProvider] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Wait for component to mount before accessing sessionStorage
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('bookingData');
        if (stored) {
          try {
            setBookingData(JSON.parse(stored));
          } catch (error) {
            console.error('Error parsing booking data:', error);
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Create payment intent when booking data is available and card payment is selected
  useEffect(() => {
    if (bookingData && paymentMethod === 'card' && !clientSecret) {
      const createPaymentIntent = async () => {
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round(bookingData.servicePrice * 100), // Convert to cents
              currency: 'usd',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create payment intent');
          }

          const { clientSecret: secret, error: serverError } = await response.json();

          if (serverError) {
            console.error('Error creating payment intent:', serverError);
            return;
          }

          setClientSecret(secret);
        } catch (error) {
          console.error('Error creating payment intent:', error);
        }
      };

      createPaymentIntent();
    }
  }, [bookingData, paymentMethod, clientSecret]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    setIsProcessing(true);
    
    // Store payment information
    if (bookingData) {
      const updatedBookingData = {
        ...bookingData,
        paymentIntentId,
        paymentMethod,
        hsaProvider: paymentMethod === 'hsa' ? hsaProvider : undefined,
      };
      sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
    }
    
    // Navigate to booking confirmation
    window.location.href = '/booking-confirmation';
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
    alert(`Payment failed: ${error}`);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Booking Data Found</h1>
          <p className="text-gray-600 mb-6">Please start your booking from the marketplace.</p>
          <button
            onClick={() => window.location.href = '/marketplace'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Checkout</h1>

        <div className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Service:</span>
              <span>{bookingData.serviceName}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Date:</span>
              <span>{bookingData.appointmentDate}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Time:</span>
              <span>{bookingData.appointmentTime}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Price:</span>
              <span className="font-semibold text-lg">${bookingData.servicePrice}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Method</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => {
                setPaymentMethod('card');
                setClientSecret(null); // Reset client secret when switching methods
              }}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all`}
            >
              Credit/Debit Card
            </button>
            <button
              onClick={() => setPaymentMethod('hsa')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                paymentMethod === 'hsa'
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all`}
            >
              HSA/FSA
            </button>
          </div>

          {paymentMethod === 'hsa' && (
            <div className="mb-6">
              <label htmlFor="hsaProvider" className="block text-sm font-medium text-gray-700 mb-2">
                HSA/FSA Provider:
              </label>
              <select
                id="hsaProvider"
                name="hsaProvider"
                value={hsaProvider}
                onChange={(e) => setHsaProvider(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select your provider</option>
                <option value="HealthEquity">HealthEquity</option>
                <option value="WEX">WEX</option>
                <option value="Optum">Optum</option>
                <option value="Bank of America">Bank of America</option>
                <option value="Fidelity">Fidelity</option>
                <option value="FSAFEDS">FSAFEDS</option>
                <option value="HealthTrust">HealthTrust</option>
                <option value="Navia">Navia</option>
                <option value="Lively">Lively</option>
                <option value="Thatch">Thatch</option>
                <option value="P&A Group">P&A Group</option>
                <option value="PIOPAC Fidelity">PIOPAC Fidelity</option>
                <option value="Melody Benefit">Melody Benefit</option>
                <option value="Unknown / Not listed">Unknown / Not listed</option>
              </select>
              <p className="mt-4 text-sm text-gray-600">
                Your health information will be reviewed by a licensed provider. If approved, we'll issue a Letter of Medical Necessity (LMN) and receipt for HSA reimbursement. The provider makes the final determination of HSA eligibility based on your health conditions and requested services.
              </p>
              <button
                onClick={() => {
                  if (hsaProvider) {
                    handlePaymentSuccess('HSA_PAYMENT_SIMULATED');
                  } else {
                    alert('Please select your HSA/FSA provider.');
                  }
                }}
                disabled={!hsaProvider || isProcessing}
                className={`mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${
                  !hsaProvider || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Complete HSA Booking'}
              </button>
            </div>
          )}

          {paymentMethod === 'card' && clientSecret && (
            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm
                amount={bookingData.servicePrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                disabled={isProcessing}
              />
            </StripeProvider>
          )}
          
          {paymentMethod === 'card' && !clientSecret && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading payment form...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}