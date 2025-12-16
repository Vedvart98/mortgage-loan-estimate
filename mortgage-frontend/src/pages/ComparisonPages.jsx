import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loanService } from '../services/loanService';
import RateComparison from '../components/comparison/RateComparison';
import toast from 'react-hot-toast';

export default function ComparisonPage() {
  const [searchParams] = useSearchParams();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    const loanId = searchParams.get('loanId');
    if (loanId && loans.length > 0) {
      const loan = loans.find(l => l._id === loanId);
      if (loan) setSelectedLoan(loan);
    }
  }, [searchParams, loans]);

  const fetchLoans = async () => {
    try {
      const response = await loanService.getMyLoans();
      setLoans(response.data);
      if (response.data.length > 0 && !selectedLoan) {
        setSelectedLoan(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No loans to compare</h3>
        <p className="text-gray-600 mb-6">Upload a loan estimate first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rate Comparison</h1>
        <p className="text-gray-600">Compare your mortgage rate with the market</p>
      </div>

      {/* Loan Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Loan to Compare
        </label>
        <select
          className="input"
          value={selectedLoan?._id || ''}
          onChange={(e) => {
            const loan = loans.find(l => l._id === e.target.value);
            setSelectedLoan(loan);
          }}
        >
          {loans.map((loan) => (
            <option key={loan._id} value={loan._id}>
              {loan.lenderName || 'Unknown Lender'} - {loan.loanDetails.apr}% APR
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Results */}
      {selectedLoan && <RateComparison loanData={selectedLoan} />}
    </div>
  );
}