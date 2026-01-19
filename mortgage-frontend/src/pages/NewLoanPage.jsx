import ManualLoanForm from '../components/loans/ManualLoanForm';

export default function NewLoanPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enter Loan Details Manually</h1>
        <p className="text-gray-600">Fill in your loan estimate information</p>
      </div>

      <ManualLoanForm />
    </div>
  );
}