import { useState, useEffect } from 'react';
import { formatCurrency, formatPercent, calculateMonthlyPayment } from '../../utils/formatters';
import { LOAN_TYPES, LOAN_TERMS } from '../../config';

export default function QuickCompareForm({ onCompare, onUploadPDF,initialValues = null }) {
  const [formData, setFormData] = useState(()=>({
    loanAmount: '',
    propertyValue: '',
    interestRate: '',
    loanTerm: 30,
    loanType: 'Conventional',
    closingCosts: '',
    creditScore: 700
  }));
useEffect(()=>{
  if(!initialValues) return;
  setFormData(f=>({
    ...f,
    loanAmount:initialValues.loanAmount ?? f.loanAmount,
    interestRate: initialValues.interestRate ?? f.interestRate,
    loanTerm: initialValues.loanTerm ?? f.loanTerm,
    loanType: initialValues.loanType ?? f.loanType,
    propertyValue: initialValues.propertyValue ?? f.propertyValue,
    closingCosts: initialValues.closingCosts ?? f.closingCosts,
    creditScore: initialValues.creditScore ?? f.creditScore    
  }));
},[initialValues]);
  const [calculated, setCalculated] = useState({
    monthlyPayment: 0,
    ltv: 0
  });

  // Calculate monthly payment and LTV
  useEffect(() => {
    const { loanAmount, propertyValue, interestRate, loanTerm } = formData;
    
    if (loanAmount && interestRate && loanTerm) {
      const payment = calculateMonthlyPayment(
        parseFloat(loanAmount),
        parseFloat(interestRate),
        parseInt(loanTerm)
      );
      
      const ltv = propertyValue && parseFloat(propertyValue) > 0
        ? (parseFloat(loanAmount) / parseFloat(propertyValue)) * 100
        : 0;
      
      setCalculated({
        monthlyPayment: payment,
        ltv
      });
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCompare(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verify Your Loan Details
        </h2>
        <p className="text-gray-600">
          Confirm the details from your loan estimate and enter your credit score
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Amount and Property Value */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleChange}
                className="input pl-8"
                placeholder="350,000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="propertyValue"
                value={formData.propertyValue}
                onChange={handleChange}
                className="input pl-8"
                placeholder="400,000"
                required
              />
            </div>
          </div>
        </div>

        {/* Interest Rate and Loan Term */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Interest Rate
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="input pr-10"
                placeholder="6.75"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term
            </label>
            <select
              name="loanTerm"
              value={formData.loanTerm}
              onChange={handleChange}
              className="input"
            >
              {LOAN_TERMS.map(term => (
                <option key={term} value={term}>{term} Years</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loan Type and Closing Costs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Type
            </label>
            <select
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              className="input"
            >
              {Object.values(LOAN_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Closing Costs
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="closingCosts"
                value={formData.closingCosts}
                onChange={handleChange}
                className="input pl-8"
                placeholder="8,000"
              />
            </div>
          </div>
        </div>

        {/* Credit Score Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Credit Score
            </label>
            <span className="text-3xl font-bold text-green-600">
              {formData.creditScore}
            </span>
          </div>
          
          <input
            type="range"
            min="300"
            max="850"
            step="10"
            name="creditScore"
            value={formData.creditScore}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1f2937 0%, #1f2937 ${((formData.creditScore - 300) / 550) * 100}%, #e5e7eb ${((formData.creditScore - 300) / 550) * 100}%, #e5e7eb 100%)`
            }}
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Poor (300)</span>
            <span>Fair (580)</span>
            <span>Good (670)</span>
            <span>Excellent (740+)</span>
          </div>
        </div>

        {/* Compare Button */}
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-gray-600 hover:text-gray-800 font-semibold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Compare with Our Rates</span>
          <span>→</span>
        </button>

        {/* Back to Upload */}
        <button
          type="button"
          onClick={onUploadPDF}
          className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
        >
          Back to upload
        </button>
      </form>
    </div>
  );
}
