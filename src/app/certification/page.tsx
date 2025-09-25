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

interface HSAProvider {
  name: string;
  code: string;
  lmnRequired: boolean;
  lmnFormat: string;
  requiredFields: string[];
  digitalSubmission: boolean;
  apiEndpoint?: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
}

const HSA_PROVIDERS: HSAProvider[] = [
  {
    name: 'HealthEquity',
    code: 'healthequity',
    lmnRequired: true,
    lmnFormat: 'standard',
    requiredFields: ['patient_name', 'dob', 'service_description', 'icd10_code', 'clinical_rationale', 'provider_signature'],
    digitalSubmission: true,
    apiEndpoint: 'https://api.healthequity.com/lmn',
    contactInfo: {
      phone: '866-346-5800',
      email: 'support@healthequity.com',
      website: 'https://www.healthequity.com'
    }
  },
  {
    name: 'WEX',
    code: 'wex',
    lmnRequired: true,
    lmnFormat: 'custom',
    requiredFields: ['patient_info', 'service_details', 'medical_necessity', 'provider_info', 'attestation'],
    digitalSubmission: true,
    apiEndpoint: 'https://api.wexinc.com/hsa/lmn',
    contactInfo: {
      phone: '877-934-6389',
      email: 'hsasupport@wexinc.com',
      website: 'https://www.wexinc.com'
    }
  },
  {
    name: 'Optum',
    code: 'optum',
    lmnRequired: true,
    lmnFormat: 'standard',
    requiredFields: ['patient_name', 'dob', 'service_description', 'icd10_code', 'clinical_rationale', 'provider_signature', 'npi'],
    digitalSubmission: false,
    contactInfo: {
      phone: '866-234-8913',
      email: 'hsasupport@optum.com',
      website: 'https://www.optum.com'
    }
  }
];

export default function CertificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lmnGenerated, setLmnGenerated] = useState(false);
  const [lmnData, setLmnData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
      return;
    }

    const stored = sessionStorage.getItem('bookingData');
    if (stored) {
      setBookingData(JSON.parse(stored));
    } else {
      router.push('/marketplace');
    }
  }, [session, status, router]);

  const handleGenerateLMN = async () => {
    if (!bookingData || !selectedProvider) {
      alert('Please select your HSA provider');
      return;
    }

    setIsGenerating(true);

    try {
      // In a real app, this would call the backend API to generate the LMN
      const mockLMNData = {
        lmnId: 'LMN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        provider: selectedProvider,
        patientName: session?.user?.email || 'Patient',
        serviceName: bookingData.serviceName,
        conditions: bookingData.healthQuestionnaireData.diagnosedConditions,
        clinicalRationale: `Based on the patient's reported health conditions (${bookingData.healthQuestionnaireData.diagnosedConditions.join(', ')}), this service is medically necessary to address their specific health concerns and improve their quality of life.`,
        generatedAt: new Date().toISOString(),
        status: 'generated'
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      setLmnData(mockLMNData);
      setLmnGenerated(true);
    } catch (error) {
      console.error('LMN generation failed:', error);
      alert('Failed to generate LMN. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadLMN = () => {
    // In a real app, this would generate and download a PDF
    alert('LMN PDF download functionality would be implemented here');
  };

  const handleSubmitToProvider = async () => {
    if (!lmnData) return;

    const provider = HSA_PROVIDERS.find(p => p.code === selectedProvider);
    if (!provider) return;

    if (provider.digitalSubmission) {
      // In a real app, this would submit via API
      alert(`LMN submitted to ${provider.name} via digital submission. You will receive confirmation via email.`);
    } else {
      alert(`Please submit the LMN to ${provider.name} via ${provider.contactInfo.website} or call ${provider.contactInfo.phone}`);
    }
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
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Sagas Health</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HSA Documentation Center
            </h1>
            <p className="text-lg text-gray-600">
              Generate Letter of Medical Necessity (LMN) for HSA reimbursement
            </p>
          </div>

          {!lmnGenerated ? (
            <div className="space-y-6">
              {/* Service Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Service Summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Service
                    </label>
                    <p className="text-gray-900">{bookingData.serviceName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Date
                    </label>
                    <p className="text-gray-900">{bookingData.appointmentDate}</p>
                  </div>
                </div>
              </div>

              {/* HSA Provider Selection */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select Your HSA Provider
                </h2>
                <div className="space-y-3">
                  {HSA_PROVIDERS.map((provider) => (
                    <div key={provider.code} className="flex items-center">
                      <input
                        type="radio"
                        id={provider.code}
                        name="hsa-provider"
                        value={provider.code}
                        checked={selectedProvider === provider.code}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor={provider.code} className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {provider.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {provider.digitalSubmission ? 'Digital submission available' : 'Manual submission required'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {provider.contactInfo.phone}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Conditions Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Health Conditions for LMN
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Selected Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.healthQuestionnaireData.diagnosedConditions.map((condition) => (
                        <span key={condition} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Impact on Daily Life
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {bookingData.healthQuestionnaireData.conditionsPreventing.map((condition, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Generate LMN Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateLMN}
                  disabled={!selectedProvider || isGenerating}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    selectedProvider && !isGenerating
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating LMN...
                    </div>
                  ) : (
                    'Generate Letter of Medical Necessity'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* LMN Generated Success */
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  LMN Generated Successfully!
                </h2>
                <p className="text-gray-600">
                  Your Letter of Medical Necessity has been generated and is ready for submission.
                </p>
              </div>

              {/* LMN Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  LMN Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      LMN ID
                    </label>

                    <p className="text-gray-900 font-mono">{String(lmnData?.lmnId || '')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Provider
                    </label>
                    <p className="text-gray-900">{HSA_PROVIDERS.find(p => p.code === selectedProvider)?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Service
                    </label>
                    <p className="text-gray-900">{String(lmnData?.serviceName || '')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Generated
                    </label>
                    <p className="text-gray-900">
                      {new Date(String(lmnData?.generatedAt || '')).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinical Rationale */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Clinical Rationale
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {String(lmnData?.clinicalRationale || '')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadLMN}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download LMN PDF
                </button>

                <button
                  onClick={handleSubmitToProvider}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit to HSA Provider
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
