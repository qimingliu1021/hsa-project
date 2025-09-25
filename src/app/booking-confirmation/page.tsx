'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface PaymentData {
  paymentIntentId: string;
  paymentMethod: string;
  timestamp: string;
}

export default function BookingConfirmationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
      return;
    }

    const stored = sessionStorage.getItem('bookingData');
    const paymentStored = sessionStorage.getItem('paymentData');
    
    if (stored) {
      const data = JSON.parse(stored);
      setBookingData(data);
      // Generate confirmation number
      setConfirmationNumber('SH' + Math.random().toString(36).substr(2, 9).toUpperCase());
    } else {
      router.push('/marketplace');
    }
    
    if (paymentStored) {
      const payment = JSON.parse(paymentStored);
      setPaymentData(payment);
    }
  }, [session, status, router]);

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Receipt download functionality would be implemented here');
  };

  const handleGenerateLMN = () => {
    // Redirect to LMN generation page
    router.push('/certification');
  };

  const handleBackToMarketplace = () => {
    // Clear booking data from session storage
    sessionStorage.removeItem('bookingData');
    router.push('/marketplace');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Sagas Health</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your appointment has been successfully booked
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Confirmation Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Booking Confirmation
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Confirmation Number
                      </label>
                      <p className="text-lg font-bold text-gray-900">
                        {confirmationNumber}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Service
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {bookingData.serviceName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Date
                      </label>
                      <p className="text-gray-900">
                        {new Date(bookingData.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Time
                      </label>
                      <p className="text-gray-900">
                        {bookingData.appointmentTime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Total Paid
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      ${bookingData.servicePrice}
                    </p>
                  </div>

                  {paymentData && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Payment Method
                        </label>
                        <p className="text-gray-900 capitalize">
                          {paymentData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'HSA Card'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Payment ID
                        </label>
                        <p className="text-sm font-mono text-gray-600">
                          {paymentData.paymentIntentId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Next Steps
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">1</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Prepare for Your Appointment
                      </h3>
                      <p className="text-sm text-gray-600">
                        Check your email for detailed preparation instructions and appointment reminders.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">2</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Generate HSA Documentation
                      </h3>
                      <p className="text-sm text-gray-600">
                        After your appointment, we&apos;ll help you generate a Letter of Medical Necessity (LMN) for HSA reimbursement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">3</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Submit for HSA Reimbursement
                      </h3>
                      <p className="text-sm text-gray-600">
                        Use the generated LMN and receipt to submit for HSA reimbursement through your HSA provider.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Conditions Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  HSA Eligibility Summary
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Qualifying Health Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.healthQuestionnaireData.selectedHealthConditions.map((condition) => (
                        <span key={condition} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          HSA Eligible
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          This service is HSA-eligible based on your selected health conditions. 
                          We&apos;ll provide all necessary documentation for reimbursement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Quick Actions
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={handleDownloadReceipt}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Receipt
                  </button>

                  <button
                    onClick={handleGenerateLMN}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate LMN
                  </button>

                  <button
                    onClick={handleBackToMarketplace}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Marketplace
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Contact our support team for assistance with your booking or HSA reimbursement.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
