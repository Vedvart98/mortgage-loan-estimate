import { useState } from 'react';
import { formatCurrency, calculateMonthlyPayment } from '../utils/formatters';
import { LOAN_TERMS } from '../config';

export default function CalculatorsPage() {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const loanAmount = propertyValue * (1 - downPayment / 100);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  const downPaymentAmount = propertyValue * (downPayment / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mortgage Calculator</h1>
        <p className="text-gray-600">Calculate monthly payments and explore different scenarios</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Value: {formatCurrency(propertyValue)}
              </label>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="10000"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment: {downPayment}%
              </label>
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate: {interestRate}%
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term
              </label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="input"
              >
                {LOAN_TERMS.map((term) => (
                  <option key={term} value={term}>{term} years</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600 mb-2">Monthly Payment</p>
            <p className="text-4xl font-bold text-blue-600">
              {formatCurrency(monthlyPayment)}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-semibold">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment</span>
                <span className="font-semibold">{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest</span>
                <span className="font-semibold">
                  {formatCurrency((monthlyPayment * loanTerm * 12) - loanAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-semibold">
                  {formatCurrency((monthlyPayment * loanTerm * 12) + downPaymentAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
