import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

export default function LoanCard({ loan, onDelete }) {
  const getRateQualityColor = (quality) => {
    const colors = {
      Excellent: 'text-green-600 bg-green-100',
      Good: 'text-blue-600 bg-blue-100',
      Fair: 'text-yellow-600 bg-yellow-100',
      Poor: 'text-red-600 bg-red-100'
    };
    return colors[quality] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {loan.lenderName || 'Unknown Lender'}
          </h3>
          <p className="text-sm text-gray-500">
            {loan.loanDetails.loanType} • {loan.loanDetails.productType}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium`}>
          {loan.loanDetails.loanTerm} year
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Loan Amount</p>
          <p className="text-lg font-semibold">
            {formatCurrency(loan.loanDetails.loanAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">APR</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatPercent(loan.loanDetails.apr)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Monthly Payment</p>
          <p className="text-lg font-semibold">
            {formatCurrency(loan.monthlyPayment.total)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Closing Costs</p>
          <p className="text-lg font-semibold">
            {formatCurrency(loan.closingCosts.total)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Created {formatDate(loan.createdAt)}
        </span>
        <div className="flex space-x-2">
          <Link 
            to={`/comparison?loanId=${loan._id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Compare"
          >
            <FiBarChart2 />
          </Link>
          <Link 
            to={`/loans/${loan._id}/edit`}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded"
            title="Edit"
          >
            <FiEdit />
          </Link>
          <button 
            onClick={() => onDelete(loan._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}
