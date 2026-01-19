// ===============================================
// FIXED src/components/loans/ManualLoanForm.jsx
// ===============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { loanService } from '../../services/loanService';
import { LOAN_TYPES, LOAN_TERMS } from '../../config';
import { formatCurrency } from '../../utils/formatters';

export default function ManualLoanForm({ initialData, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    monthlyPI: 0,
    totalMonthly: 0,
    ltv: 0
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      loanDetails: {
        loanAmount: '',
        interestRate: '',
        apr: '',
        loanTerm: 30,
        loanType: 'Conventional',
        productType: 'Fixed Rate',
        purpose: 'Purchase',
        propertyValue: ''
      },
      monthlyPayment: {
        principalInterest: '',
        mortgageInsurance: '',
        escrow: '',
        total: ''
      },
      closingCosts: {
        total: '',
        loanCosts: '',
        otherCosts: '',
        lenderCredits: 0
      },
      pointsPaid: 0,
      lenderName: '',
      lenderContact: {
        name: '',
        email: '',
        phone: ''
      }
    }
  });

  // Watch form values for auto-calculation
  const loanAmount = watch('loanDetails.loanAmount');
  const interestRate = watch('loanDetails.interestRate');
  const loanTerm = watch('loanDetails.loanTerm');
  const propertyValue = watch('loanDetails.propertyValue');
  const mortgageInsurance = watch('monthlyPayment.mortgageInsurance');
  const escrow = watch('monthlyPayment.escrow');

  // Auto-calculate monthly payment when values change
  useEffect(() => {
    if (loanAmount && interestRate && loanTerm) {
      // Calculate monthly P&I
      const principal = parseFloat(loanAmount);
      const rate = parseFloat(interestRate);
      const term = parseInt(loanTerm);
      
      const monthlyPI = calculateMonthlyPayment(principal, rate, term);
      
      // Calculate PMI and escrow
      const pmi = parseFloat(mortgageInsurance) || 0;
      const esc = parseFloat(escrow) || 0;
      const total = monthlyPI + pmi + esc;

      // Calculate LTV
      let ltv = 0;
      if (propertyValue && parseFloat(propertyValue) > 0) {
        ltv = (principal / parseFloat(propertyValue)) * 100;
      }

      setCalculatedValues({
        monthlyPI: monthlyPI.toFixed(2),
        totalMonthly: total.toFixed(2),
        ltv: ltv.toFixed(2)
      });

      // Update form values
      setValue('monthlyPayment.principalInterest', monthlyPI.toFixed(2));
      setValue('monthlyPayment.total', total.toFixed(2));
    } else {
      // Reset if required fields are empty
      setCalculatedValues({
        monthlyPI: 0,
        totalMonthly: 0,
        ltv: propertyValue && loanAmount ? ((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100).toFixed(2) : 0
      });
    }
  }, [loanAmount, interestRate, loanTerm, propertyValue, mortgageInsurance, escrow, setValue]);

  // Calculate monthly payment formula
  const calculateMonthlyPayment = (principal, annualRate, termYears) => {
    if (!principal || !annualRate || !termYears) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Convert string values to numbers
      const formattedData = {
        loanDetails: {
          ...data.loanDetails,
          loanAmount: parseFloat(data.loanDetails.loanAmount),
          interestRate: parseFloat(data.loanDetails.interestRate),
          apr: parseFloat(data.loanDetails.apr),
          loanTerm: parseInt(data.loanDetails.loanTerm),
          propertyValue: data.loanDetails.propertyValue ? parseFloat(data.loanDetails.propertyValue) : null
        },
        monthlyPayment: {
          principalInterest: parseFloat(data.monthlyPayment.principalInterest),
          mortgageInsurance: data.monthlyPayment.mortgageInsurance ? parseFloat(data.monthlyPayment.mortgageInsurance) : null,
          escrow: data.monthlyPayment.escrow ? parseFloat(data.monthlyPayment.escrow) : null,
          total: parseFloat(data.monthlyPayment.total)
        },
        closingCosts: {
          total: data.closingCosts.total ? parseFloat(data.closingCosts.total) : 0,
          loanCosts: data.closingCosts.loanCosts ? parseFloat(data.closingCosts.loanCosts) : null,
          otherCosts: data.closingCosts.otherCosts ? parseFloat(data.closingCosts.otherCosts) : null,
          lenderCredits: parseFloat(data.closingCosts.lenderCredits || 0)
        },
        pointsPaid: parseFloat(data.pointsPaid || 0),
        lenderName: data.lenderName,
        lenderContact: data.lenderContact
      };

      const response = await loanService.createLoan(formattedData);
      
      toast.success('Loan created successfully!');
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        navigate('/loans');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Basic Loan Information */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Basic Loan Information</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="150000"
              {...register('loanDetails.loanAmount', { 
                required: 'Loan amount is required',
                min: { value: 1000, message: 'Minimum loan amount is $1,000' }
              })}
            />
            {errors.loanDetails?.loanAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.loanDetails.loanAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Value
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="180000"
              {...register('loanDetails.propertyValue')}
            />
            {calculatedValues.ltv > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                LTV: {calculatedValues.ltv}%
                {parseFloat(calculatedValues.ltv) > 80 && (
                  <span className="text-orange-600 font-medium"> (PMI required)</span>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.001"
              className="input"
              placeholder="4.25"
              {...register('loanDetails.interestRate', { 
                required: 'Interest rate is required',
                min: { value: 0.1, message: 'Interest rate must be greater than 0' },
                max: { value: 20, message: 'Interest rate must be less than 20%' }
              })}
            />
            {errors.loanDetails?.interestRate && (
              <p className="text-red-500 text-sm mt-1">{errors.loanDetails.interestRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              APR (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.001"
              className="input"
              placeholder="4.50"
              {...register('loanDetails.apr', { 
                required: 'APR is required',
                min: { value: 0.1, message: 'APR must be greater than 0' },
                max: { value: 25, message: 'APR must be less than 25%' }
              })}
            />
            {errors.loanDetails?.apr && (
              <p className="text-red-500 text-sm mt-1">{errors.loanDetails.apr.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              APR includes fees and is typically higher than interest rate
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term <span className="text-red-500">*</span>
            </label>
            <select
              className="input"
              {...register('loanDetails.loanTerm', { required: 'Loan term is required' })}
            >
              {LOAN_TERMS.map(term => (
                <option key={term} value={term}>{term} years</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Type <span className="text-red-500">*</span>
            </label>
            <select
              className="input"
              {...register('loanDetails.loanType', { required: 'Loan type is required' })}
            >
              {Object.values(LOAN_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              className="input"
              {...register('loanDetails.productType')}
            >
              <option value="Fixed Rate">Fixed Rate</option>
              <option value="Adjustable Rate">Adjustable Rate (ARM)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Purpose
            </label>
            <select
              className="input"
              {...register('loanDetails.purpose')}
            >
              <option value="Purchase">Purchase</option>
              <option value="Refinance">Refinance</option>
              <option value="Cash-Out Refinance">Cash-Out Refinance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Payment */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Monthly Payment Breakdown</h3>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Calculated Monthly P&I:</span>
            <span className="text-3xl font-bold text-blue-600">
              {calculatedValues.monthlyPI > 0 ? formatCurrency(calculatedValues.monthlyPI) : '$0'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Principal & Interest (auto-calculated)
            </label>
            <input
              type="number"
              step="0.01"
              className="input bg-gray-100 cursor-not-allowed"
              readOnly
              {...register('monthlyPayment.principalInterest')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mortgage Insurance (PMI)
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              {...register('monthlyPayment.mortgageInsurance')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Required if LTV {'>'} 80%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escrow (Taxes + Insurance)
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              {...register('monthlyPayment.escrow')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Monthly Payment
            </label>
            <input
              type="number"
              step="0.01"
              className="input bg-gray-100 cursor-not-allowed"
              readOnly
              {...register('monthlyPayment.total')}
            />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Monthly Payment:</span>
            <span className="text-3xl font-bold text-green-600">
              {calculatedValues.totalMonthly > 0 ? formatCurrency(calculatedValues.totalMonthly) : '$0'}
            </span>
          </div>
        </div>
      </div>

      {/* Closing Costs */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Closing Costs & Fees</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Closing Costs
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="5000"
              {...register('closingCosts.total')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Costs
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="3000"
              {...register('closingCosts.loanCosts')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Origination, appraisal, credit report, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Costs
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="2000"
              {...register('closingCosts.otherCosts')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Taxes, insurance, prepaids, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Credits
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              {...register('closingCosts.lenderCredits')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Negative value (e.g., -500 for $500 credit)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points Paid (%)
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              {...register('pointsPaid')}
            />
            <p className="text-xs text-gray-500 mt-1">
              1 point = 1% of loan amount
            </p>
          </div>
        </div>
      </div>

      {/* Lender Information */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Lender Information</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Name
            </label>
            <input
              type="text"
              className="input"
              placeholder="First National Bank"
              {...register('lenderName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Officer Name
            </label>
            <input
              type="text"
              className="input"
              placeholder="John Smith"
              {...register('lenderContact.name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Officer Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="john.smith@bank.com"
              {...register('lenderContact.email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Officer Phone
            </label>
            <input
              type="tel"
              className="input"
              placeholder="(555) 123-4567"
              {...register('lenderContact.phone')}
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/loans')}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Save Loan Estimate'}
        </button>
      </div>
    </form>
  );
}