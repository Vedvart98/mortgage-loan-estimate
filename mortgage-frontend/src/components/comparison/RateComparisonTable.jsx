import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function RateComparisonTable({ userLoan, ourRates }) {
  const calculateSavings = () => {
    const userMonthly = userLoan.monthlyPayment;
    const ourMonthly = ourRates.monthlyPayment;
    const monthly = userMonthly - ourMonthly;
    const yearly = monthly * 12;
    const lifetime = monthly * userLoan.loanTerm * 12;

    return { monthly, yearly, lifetime };
  };

  const savings = calculateSavings();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <p className="text-sm text-red-700 mb-1">Your Current Offer</p>
          <p className="text-3xl font-bold text-red-900">
            {formatPercent(userLoan.interestRate)}
          </p>
          <p className="text-sm text-red-600 mt-2">
            {formatCurrency(userLoan.monthlyPayment)}/mo
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Our Best Rate</p>
          <p className="text-3xl font-bold text-green-900">
            {formatPercent(ourRates.interestRate)}
          </p>
          <p className="text-sm text-green-600 mt-2">
            {formatCurrency(ourRates.monthlyPayment)}/mo
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Your Savings</p>
          <p className="text-3xl font-bold text-blue-900">
            {formatCurrency(Math.abs(savings.monthly))}/mo
          </p>
          <p className="text-sm text-blue-600 mt-2">
            {formatCurrency(Math.abs(savings.lifetime))} lifetime
          </p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Your Current Offer
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-green-50">
                  Our Rate
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Interest Rate */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Interest Rate
                </td>
                <td className="px-6 py-4 text-center text-red-700 font-semibold">
                  {formatPercent(userLoan.interestRate)}
                </td>
                <td className="px-6 py-4 text-center text-green-700 font-semibold bg-green-50">
                  {formatPercent(ourRates.interestRate)}
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <span className={savings.monthly > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    {formatPercent(Math.abs(userLoan.interestRate - ourRates.interestRate))} lower
                  </span>
                </td>
              </tr>

              {/* Monthly Payment */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Monthly Payment
                </td>
                <td className="px-6 py-4 text-center text-red-700 font-semibold">
                  {formatCurrency(userLoan.monthlyPayment)}
                </td>
                <td className="px-6 py-4 text-center text-green-700 font-semibold bg-green-50">
                  {formatCurrency(ourRates.monthlyPayment)}
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <span className={savings.monthly > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    Save {formatCurrency(Math.abs(savings.monthly))}/mo
                  </span>
                </td>
              </tr>

              {/* APR */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  APR
                </td>
                <td className="px-6 py-4 text-center text-gray-700">
                  {formatPercent(userLoan.apr)}
                </td>
                <td className="px-6 py-4 text-center text-gray-700 bg-green-50">
                  {formatPercent(ourRates.apr)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">
                  {formatPercent(Math.abs(userLoan.apr - ourRates.apr))} lower
                </td>
              </tr>

              {/* Closing Costs */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Closing Costs
                </td>
                <td className="px-6 py-4 text-center text-gray-700">
                  {formatCurrency(userLoan.closingCosts)}
                </td>
                <td className="px-6 py-4 text-center text-gray-700 bg-green-50">
                  {formatCurrency(ourRates.closingCosts)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">
                  {formatCurrency(Math.abs(userLoan.closingCosts - ourRates.closingCosts))} {userLoan.closingCosts > ourRates.closingCosts ? 'lower' : 'higher'}
                </td>
              </tr>

              {/* Total Savings */}
              <tr className="bg-blue-50 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">
                  Total Lifetime Savings
                </td>
                <td className="px-6 py-4 text-center text-gray-700">
                  {formatCurrency(userLoan.monthlyPayment * userLoan.loanTerm * 12)}
                </td>
                <td className="px-6 py-4 text-center text-gray-700 bg-green-50">
                  {formatCurrency(ourRates.monthlyPayment * userLoan.loanTerm * 12)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-green-700 text-lg font-bold">
                    {formatCurrency(Math.abs(savings.lifetime))}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">
          Ready to Save {formatCurrency(Math.abs(savings.monthly))} Every Month?
        </h3>
        <p className="mb-6 text-green-50">
          That's {formatCurrency(Math.abs(savings.lifetime))} over the life of your loan!
        </p>
        <button className="bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors">
          Apply Now
        </button>
      </div>
    </div>
  );
}
