import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function DataConfirmation({ data, onConfirm, onEdit }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Review Extracted Data</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please verify the information is correct before proceeding
      </p>

      <div className="grid grid-cols-2 gap-4">
        <DataField 
          label="Loan Amount" 
          value={formatCurrency(data.loanDetails.loanAmount)} 
        />
        <DataField 
          label="Interest Rate" 
          value={formatPercent(data.loanDetails.interestRate)} 
        />
        <DataField 
          label="APR" 
          value={formatPercent(data.loanDetails.apr)} 
        />
        <DataField 
          label="Loan Term" 
          value={`${data.loanDetails.loanTerm} years`} 
        />
        <DataField 
          label="Loan Type" 
          value={data.loanDetails.loanType} 
        />
        <DataField 
          label="Monthly P&I" 
          value={formatCurrency(data.monthlyPayment.principalInterest)} 
        />
        <DataField 
          label="Total Monthly" 
          value={formatCurrency(data.monthlyPayment.total)} 
        />
        <DataField 
          label="Closing Costs" 
          value={formatCurrency(data.closingCosts.total)} 
        />
      </div>

      <div className="mt-6 flex space-x-4">
        <button onClick={onEdit} className="flex-1 btn btn-secondary">
          Edit Values
        </button>
        <button onClick={() => onConfirm(data)} className="flex-1 btn btn-primary">
          Looks Good - Continue
        </button>
      </div>
    </div>
  );
}

function DataField({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
