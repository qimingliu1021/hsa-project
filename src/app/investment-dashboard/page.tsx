'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HSAAccount {
  id: string;
  provider: string;
  currentBalance: number;
  cashBalance: number;
  investmentBalance: number;
  availableCash: number;
  monthlyContribution: number;
  annualContribution: number;
  annualLimit: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'contribution' | 'withdrawal' | 'investment' | 'dividend' | 'fee';
  category: string;
  balance: number;
}

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  costBasis: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
  category: string;
}

interface PerformanceMetric {
  period: string;
  totalReturn: number;
  annualizedReturn: number;
  contributions: number;
  withdrawals: number;
  netReturn: number;
}

export default function InvestmentDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [hsaAccount, setHsaAccount] = useState<HSAAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in a real app, this would fetch from APIs
    const mockHsaAccount: HSAAccount = {
      id: 'hsa-001',
      provider: 'HealthEquity',
      currentBalance: 15750.43,
      cashBalance: 3250.43,
      investmentBalance: 12500.00,
      availableCash: 3250.43,
      monthlyContribution: 500.00,
      annualContribution: 6000.00,
      annualLimit: 8300.00,
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    const mockTransactions: Transaction[] = [
      {
        id: 'tx-001',
        date: '2024-01-15',
        description: 'Monthly Contribution',
        amount: 500.00,
        type: 'contribution',
        category: 'Payroll Deduction',
        balance: 15750.43
      },
      {
        id: 'tx-002',
        date: '2024-01-10',
        description: 'Therapeutic Massage - NYC Wellness Spa',
        amount: -120.00,
        type: 'withdrawal',
        category: 'Medical Expense',
        balance: 15250.43
      },
      {
        id: 'tx-003',
        date: '2024-01-05',
        description: 'Investment Purchase - VTSAX',
        amount: -1000.00,
        type: 'investment',
        category: 'Investment',
        balance: 15370.43
      },
      {
        id: 'tx-004',
        date: '2023-12-31',
        description: 'Annual Dividend - VTSAX',
        amount: 45.67,
        type: 'dividend',
        category: 'Investment Income',
        balance: 16370.43
      },
      {
        id: 'tx-005',
        date: '2023-12-15',
        description: 'Monthly Contribution',
        amount: 500.00,
        type: 'contribution',
        category: 'Payroll Deduction',
        balance: 16324.76
      }
    ];

    const mockInvestments: Investment[] = [
      {
        id: 'inv-001',
        symbol: 'VTSAX',
        name: 'Vanguard Total Stock Market Index Fund',
        shares: 125.5,
        currentPrice: 95.45,
        costBasis: 88.50,
        marketValue: 11978.98,
        gainLoss: 872.48,
        gainLossPercent: 7.86,
        allocation: 95.83,
        category: 'Stock Index Fund'
      },
      {
        id: 'inv-002',
        symbol: 'VBTLX',
        name: 'Vanguard Total Bond Market Index Fund',
        shares: 25.2,
        currentPrice: 20.68,
        costBasis: 19.85,
        marketValue: 521.14,
        gainLoss: 20.91,
        gainLossPercent: 4.19,
        allocation: 4.17,
        category: 'Bond Index Fund'
      }
    ];

    const mockPerformance: PerformanceMetric[] = [
      {
        period: '1 Year',
        totalReturn: 1250.67,
        annualizedReturn: 8.45,
        contributions: 6000.00,
        withdrawals: -850.00,
        netReturn: 400.67
      },
      {
        period: '3 Years',
        totalReturn: 3850.23,
        annualizedReturn: 7.82,
        contributions: 18000.00,
        withdrawals: -2400.00,
        netReturn: 1450.23
      },
      {
        period: '5 Years',
        totalReturn: 6750.45,
        annualizedReturn: 8.12,
        contributions: 30000.00,
        withdrawals: -4200.00,
        netReturn: 2550.45
      }
    ];

    setHsaAccount(mockHsaAccount);
    setTransactions(mockTransactions);
    setInvestments(mockInvestments);
    setPerformanceMetrics(mockPerformance);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Access Your HSA Investment Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to view your HSA balance, investments, and performance
            </p>
          </div>
          <button
            onClick={() => signIn()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'investment':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case 'dividend':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Sagas Health</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/marketplace"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Marketplace
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.email || 'User'}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">HSA Investment Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your Health Savings Account investments and track performance
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'investments', name: 'Investments' },
                { id: 'transactions', name: 'Transactions' },
                { id: 'planning', name: 'Planning' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && hsaAccount && (
            <div className="space-y-6">
              {/* Account Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Balance
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(hsaAccount.currentBalance)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Investment Balance
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(hsaAccount.investmentBalance)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Cash Balance
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(hsaAccount.cashBalance)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Annual Contribution
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(hsaAccount.annualContribution)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Performance Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.period} className="text-center">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          {metric.period}
                        </div>
                        <div className={`text-2xl font-bold ${
                          metric.netReturn >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(metric.netReturn)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPercent(metric.annualizedReturn)} annualized
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Details
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">HSA Provider</dt>
                      <dd className="mt-1 text-sm text-gray-900">{hsaAccount.provider}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Monthly Contribution</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatCurrency(hsaAccount.monthlyContribution)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Annual Limit</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatCurrency(hsaAccount.annualLimit)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Remaining Contribution Room</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatCurrency(hsaAccount.annualLimit - hsaAccount.annualContribution)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Investment Portfolio
                  </h3>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Investment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shares
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Market Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gain/Loss
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Allocation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {investments.map((investment) => (
                          <tr key={investment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {investment.symbol}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {investment.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {investment.shares.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(investment.marketValue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className={`font-medium ${
                                  investment.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(investment.gainLoss)}
                                </div>
                                <div className={`text-xs ${
                                  investment.gainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {formatPercent(investment.gainLossPercent)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {investment.allocation.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Transaction History
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {transactions.map((transaction, transactionIdx) => (
                        <li key={transaction.id}>
                          <div className="relative pb-8">
                            {transactionIdx !== transactions.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              {getTransactionIcon(transaction.type)}
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {transaction.description}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${
                                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Balance: {formatCurrency(transaction.balance)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Planning Tab */}
          {activeTab === 'planning' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Contribution Planning
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Current Year Progress</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Contributed</span>
                            <span className="font-medium">{formatCurrency(hsaAccount?.annualContribution || 0)}</span>
                          </div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${((hsaAccount?.annualContribution || 0) / (hsaAccount?.annualLimit || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Remaining: {formatCurrency((hsaAccount?.annualLimit || 0) - (hsaAccount?.annualContribution || 0))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Contribution Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-800">Maximize Annual Contribution</div>
                          <div className="text-green-700">
                            Contribute {formatCurrency((hsaAccount?.annualLimit || 0) - (hsaAccount?.annualContribution || 0))} more to reach the annual limit
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-800">Investment Strategy</div>
                          <div className="text-blue-700">
                            Consider increasing investment allocation to {Math.round((hsaAccount?.investmentBalance || 0) / (hsaAccount?.currentBalance || 1) * 100 + 10)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Financial Planning Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Retirement Calculator</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Project your HSA growth for retirement healthcare costs
                      </p>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Calculate →
                      </button>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Investment Optimizer</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Optimize your investment allocation for better returns
                      </p>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Optimize →
                      </button>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Tax Calculator</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Calculate tax savings from HSA contributions
                      </p>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Calculate →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
