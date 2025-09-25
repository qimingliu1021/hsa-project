'use client';

import { useState } from 'react';

interface HealthQuestionnaireProps {
  onSubmit: (data: HealthQuestionnaireData) => void;
  onCancel: () => void;
  serviceName: string;
}

export interface HealthQuestionnaireData {
  age: string;
  hsaProvider: string;
  stateOfResidence: string;
  diagnosedConditions: string[];
  otherDiagnosedConditions: string;
  riskFactors: string;
  conditionsPreventing: string[];
  otherConditionsPreventing: string;
  attestation: boolean;
}

export default function HealthQuestionnaire({ onSubmit, onCancel, serviceName }: HealthQuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<HealthQuestionnaireData>({
    age: '',
    hsaProvider: '',
    stateOfResidence: '',
    diagnosedConditions: [],
    otherDiagnosedConditions: '',
    riskFactors: '',
    conditionsPreventing: [],
    otherConditionsPreventing: '',
    attestation: false,
  });

  const hsaProviders = [
    'Unknown / Not listed',
    'HealthEquity',
    'WEX',
    'Optum',
    'Bank of America',
    'Fidelity',
    'FSAFEDS',
    'HealthTrust',
    'Navia',
    'Lively',
    'Thatch',
    'P&A Group',
    'PIOPAC Fidelity',
    'Melody Benefit'
  ];

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  // Service-specific conditions based on the service type
  const getServiceConditions = (serviceName: string) => {
    const conditionMap: { [key: string]: string[] } = {
      'Nutritional Counseling': [
        'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Obesity', 'High Cholesterol',
        'Metabolic Syndrome', 'Digestive Issues', 'Food Allergies', 'Eating Disorders'
      ],
      'Therapeutic Massage': [
        'Back Pain', 'Neck Pain', 'Muscle Tension', 'Stress', 'Anxiety', 'Headaches',
        'Sciatica', 'Fibromyalgia', 'Arthritis', 'Sports Injuries'
      ],
      'Stretching & Mobility Session': [
        'Limited Mobility', 'Joint Stiffness', 'Posture Issues', 'Back Pain', 'Neck Pain',
        'Arthritis', 'Sports Injuries', 'Recovery from Surgery', 'Chronic Pain'
      ],
      'Yoga Therapy Session': [
        'Anxiety', 'Depression', 'Stress', 'Back Pain', 'Balance Issues', 'Flexibility Issues',
        'Chronic Pain', 'Sleep Disorders', 'High Blood Pressure', 'Arthritis'
      ],
      'Pilates Rehabilitation': [
        'Back Pain', 'Posture Issues', 'Core Weakness', 'Injury Recovery', 'Arthritis',
        'Limited Mobility', 'Balance Issues', 'Chronic Pain', 'Sports Injuries'
      ],
      'Chiropractic Adjustment': [
        'Back Pain', 'Neck Pain', 'Headaches', 'Sciatica', 'Joint Pain', 'Posture Issues',
        'Sports Injuries', 'Chronic Pain', 'Limited Mobility'
      ],
      'Acupuncture Treatment': [
        'Chronic Pain', 'Anxiety', 'Depression', 'Migraines', 'Digestive Issues', 'Insomnia',
        'Stress', 'Arthritis', 'Fibromyalgia', 'Allergies'
      ],
      'Fitness Training Session': [
        'Obesity', 'High Blood Pressure', 'Diabetes', 'Heart Disease', 'High Cholesterol',
        'Metabolic Syndrome', 'Muscle Weakness', 'Balance Issues', 'Limited Mobility'
      ]
    };
    
    return conditionMap[serviceName] || [
      'Back Pain', 'Neck Pain', 'Headaches', 'Stress', 'Anxiety', 'Chronic Pain',
      'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Arthritis'
    ];
  };

  const serviceConditions = getServiceConditions(serviceName);

  const handleInputChange = (field: keyof HealthQuestionnaireData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionToggle = (condition: string, field: 'diagnosedConditions' | 'conditionsPreventing') => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(condition)
        ? prev[field].filter(c => c !== condition)
        : [...prev[field], condition]
    }));
  };

  const getRiskFactorPrompt = () => {
    const prompts: { [key: string]: string } = {
      'Nutritional Counseling': 'Tell us about any risk factors for diabetes, heart disease, or metabolic conditions (family history, lifestyle factors, etc.)',
      'Therapeutic Massage': 'Tell us about any risk factors for chronic pain, stress-related conditions, or musculoskeletal issues',
      'Yoga Therapy Session': 'Tell us about any risk factors for anxiety, depression, stress, or physical limitations',
      'Pilates Rehabilitation': 'Tell us about any risk factors for back pain, posture issues, or injury recurrence',
      'Chiropractic Adjustment': 'Tell us about any risk factors for spinal issues, chronic pain, or musculoskeletal problems',
      'Acupuncture Treatment': 'Tell us about any risk factors for chronic pain, stress, or conditions that may benefit from acupuncture'
    };
    
    return prompts[serviceName] || 'Tell us about any risk factors you know of, and why you want to prevent these conditions.';
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.age !== '';
      case 2:
        return data.hsaProvider !== '';
      case 3:
        return data.stateOfResidence !== '';
      case 4:
        return true; // Information page
      case 5:
        return data.diagnosedConditions.length > 0;
      case 6:
        return true; // Optional risk factors
      case 7:
        return data.conditionsPreventing.length > 0;
      case 8:
        return data.attestation;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Age</h2>
              <p className="text-gray-600">Please provide your age.</p>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                min="18"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">HSA Provider</h2>
              <p className="text-gray-600">Who manages your HSA benefits?</p>
            </div>
            <div>
              <label htmlFor="hsaProvider" className="block text-sm font-medium text-gray-700 mb-2">
                HSA Provider
              </label>
              <select
                id="hsaProvider"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.hsaProvider}
                onChange={(e) => handleInputChange('hsaProvider', e.target.value)}
              >
                <option value="">Select your HSA provider</option>
                {hsaProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">State of Residence</h2>
              <p className="text-gray-600">Please select your state of residence.</p>
            </div>
            <div>
              <label htmlFor="stateOfResidence" className="block text-sm font-medium text-gray-700 mb-2">
                State of Residence
              </label>
              <select
                id="stateOfResidence"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.stateOfResidence}
                onChange={(e) => handleInputChange('stateOfResidence', e.target.value)}
              >
                <option value="">Select your state</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical History Information</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">
                    Tell us about your medical history
                  </h4>
                  <p className="text-blue-700">
                    We&apos;ll ask some health questions for each type of health service you chose. 
                    These questions help ensure the exact services are right for your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Diagnosed Conditions</h2>
              <p className="text-gray-600">
                Have you been diagnosed with any of the following conditions? 
                {serviceName && ` (Tailored for ${serviceName})`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceConditions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => handleConditionToggle(condition, 'diagnosedConditions')}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    data.diagnosedConditions.includes(condition)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{condition}</span>
                    {data.diagnosedConditions.includes(condition) && (
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Other Conditions Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Conditions</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have been diagnosed with other conditions not listed above, please describe them here:
              </p>
              <textarea
                id="otherDiagnosedConditions"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.otherDiagnosedConditions}
                onChange={(e) => handleInputChange('otherDiagnosedConditions', e.target.value)}
                placeholder="Please describe any other diagnosed conditions..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Risk Factors</h2>
              <p className="text-gray-600">
                {getRiskFactorPrompt()} (Optional)
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Risk factors are things that could increase your chances of these conditions, like family history or lifestyle.
              </p>
            </div>
            <div>
              <label htmlFor="riskFactors" className="block text-sm font-medium text-gray-700 mb-2">
                Risk Factors
              </label>
              <textarea
                id="riskFactors"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.riskFactors}
                onChange={(e) => handleInputChange('riskFactors', e.target.value)}
                placeholder="Describe any risk factors you&apos;re aware of..."
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Conditions I am Trying to Prevent</h2>
              <p className="text-gray-600">Select the conditions you are trying to prevent through this service.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceConditions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => handleConditionToggle(condition, 'conditionsPreventing')}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    data.conditionsPreventing.includes(condition)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{condition}</span>
                    {data.conditionsPreventing.includes(condition) && (
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Other Conditions Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Conditions</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you are trying to prevent other conditions not listed above, please describe them here:
              </p>
              <textarea
                id="otherConditionsPreventing"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={data.otherConditionsPreventing}
                onChange={(e) => handleInputChange('otherConditionsPreventing', e.target.value)}
                placeholder="Please describe any other conditions you are trying to prevent..."
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Attestation</h2>
              <p className="text-gray-600">Please read and confirm the following attestation.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                I attest that I am receiving this service/product primarily for the purpose of curing, mitigating, treating, or preventing the diagnosed medical condition(s) I have identified. I further affirm that I would not obtain these service(s) in the absence of such medical condition(s), and that this request is consistent with the medical necessity determination provided by a licensed healthcare provider.
              </p>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="attestation"
                checked={data.attestation}
                onChange={(e) => handleInputChange('attestation', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="attestation" className="ml-3 text-sm text-gray-700">
                I have read and agree to the above attestation statement.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {step} of 8
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((step / 8) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 8) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={step === 1 ? onCancel : () => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={step === 8 ? () => onSubmit(data) : () => setStep(step + 1)}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 8 ? 'Complete Assessment' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}