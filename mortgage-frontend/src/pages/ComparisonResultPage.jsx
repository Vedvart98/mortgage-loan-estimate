import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { FiTrendingDown, FiTrendingUp, FiDollarSign, FiFileText, FiAlertCircle } from 'react-icons/fi';

export default function ComparisonResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userLoan, ourRates, savings } = location.state || {};

  // Redirect if no data
  if (!userLoan || !ourRates || !savings) {
    navigate('/comparison');
    return null;
  }

  // Determine which rate is better
  const ourRateIsBetter = ourRates.interestRate < userLoan.interestRate;
  const rateDifference = Math.abs(userLoan.interestRate - ourRates.interestRate);
  
  // Recalculate savings based on who's better
  const actualSavings = {
    monthly: Math.abs(savings.monthly),
    yearly: Math.abs(savings.yearly),
    lifetime: Math.abs(savings.lifetime)
  };

  // Determine which offer is recommended
  const recommendedOffer = ourRateIsBetter ? 'our' : 'user';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Hero Banner - Conditional based on who's better */}
        {ourRateIsBetter ? (
          // Our rate is better
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white shadow-xl mb-8">
            <div className="inline-flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 mb-4">
              <FiTrendingDown className="mr-2" />
              <span className="font-semibold">Better Rate Available!</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-3">
              Save {formatCurrency(actualSavings.monthly)}/mo
            </h1>
            <p className="text-xl text-green-50">
              That's {formatCurrency(actualSavings.lifetime)} over the life of your loan
            </p>
          </div>
        ) : (
          // User's rate is better
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-center text-white shadow-xl mb-8">
            <div className="inline-flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 mb-4">
              <FiAlertCircle className="mr-2" />
              <span className="font-semibold">Great Rate!</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-3">
              Your Rate is Already Excellent
            </h1>
            <p className="text-xl text-blue-50">
              Your current offer is {formatPercent(rateDifference)} better than our rate
            </p>
          </div>
        )}

        {/* Side-by-Side Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* User's Offer - Dynamic styling based on if it's better */}
          <div className={`rounded-xl shadow-lg p-6 border-2 ${
            !ourRateIsBetter 
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Their Offer</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                !ourRateIsBetter
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {!ourRateIsBetter ? 'Recommended' : 'Current'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Interest Rate */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center text-gray-600">
                  <span className={`text-2xl mr-3 ${!ourRateIsBetter ? 'text-green-600' : ''}`}>%</span>
                  <span className="font-medium">Interest Rate</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${
                    !ourRateIsBetter ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {formatPercent(userLoan.interestRate)}
                  </span>
                  {!ourRateIsBetter && <FiTrendingDown className="text-green-600 ml-2" />}
                </div>
              </div>

              {/* Monthly Payment */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center text-gray-600">
                  <FiDollarSign className={`text-2xl mr-3 ${!ourRateIsBetter ? 'text-green-600' : ''}`} />
                  <span className="font-medium">Monthly Payment</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${
                    !ourRateIsBetter ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {formatCurrency(userLoan.monthlyPayment)}
                  </span>
                  {!ourRateIsBetter && <FiTrendingDown className="text-green-600 ml-2" />}
                </div>
              </div>

              {/* Closing Costs */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center text-gray-600">
                  <FiFileText className={`text-2xl mr-3 ${!ourRateIsBetter ? 'text-green-600' : ''}`} />
                  <span className="font-medium">Closing Costs</span>
                </div>
                <span className={`text-2xl font-bold ${
                  !ourRateIsBetter ? 'text-green-700' : 'text-gray-900'
                }`}>
                  {formatCurrency(userLoan.closingCosts)}
                </span>
              </div>
            </div>
          </div>

          {/* Our Offer - Dynamic styling based on if it's better */}
          <div className={`rounded-xl shadow-lg p-6 border-2 ${
            ourRateIsBetter 
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Our Offer</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                ourRateIsBetter
                  ? 'bg-green-500 text-white'
                  : 'bg-red-100 text-red-600'
              }`}>
                {ourRateIsBetter ? 'Recommended' : 'Not Recommended'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Interest Rate */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className={`flex items-center ${ourRateIsBetter ? 'text-gray-700' : 'text-gray-600'}`}>
                  <span className={`text-2xl mr-3 ${ourRateIsBetter ? 'text-green-600' : 'text-red-500'}`}>%</span>
                  <span className="font-medium">Interest Rate</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${
                    ourRateIsBetter ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatPercent(ourRates.interestRate)}
                  </span>
                  {ourRateIsBetter ? (
                    <FiTrendingDown className="text-green-600 ml-2" />
                  ) : (
                    <FiTrendingUp className="text-red-600 ml-2" />
                  )}
                </div>
              </div>

              {/* Monthly Payment */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className={`flex items-center ${ourRateIsBetter ? 'text-gray-700' : 'text-gray-600'}`}>
                  <FiDollarSign className={`text-2xl mr-3 ${ourRateIsBetter ? 'text-green-600' : 'text-red-500'}`} />
                  <span className="font-medium">Monthly Payment</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${
                    ourRateIsBetter ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(ourRates.monthlyPayment)}
                  </span>
                  {ourRateIsBetter ? (
                    <FiTrendingDown className="text-green-600 ml-2" />
                  ) : (
                    <FiTrendingUp className="text-red-600 ml-2" />
                  )}
                </div>
              </div>

              {/* Closing Costs */}
              <div className="flex items-center justify-between py-3">
                <div className={`flex items-center ${ourRateIsBetter ? 'text-gray-700' : 'text-gray-600'}`}>
                  <FiFileText className={`text-2xl mr-3 ${ourRateIsBetter ? 'text-green-600' : ''}`} />
                  <span className="font-medium">Closing Costs</span>
                </div>
                <span className={`text-2xl font-bold ${
                  ourRateIsBetter ? 'text-green-700' : 'text-gray-900'
                }`}>
                  {formatCurrency(ourRates.closingCosts)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings or Warning Box - Conditional */}
        {ourRateIsBetter ? (
          // Show savings if our rate is better
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200 mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <FiDollarSign className="text-orange-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-orange-900">Your Potential Savings</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {formatCurrency(actualSavings.monthly)}
                </div>
                <div className="text-sm text-orange-700 font-medium">Monthly Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {formatCurrency(actualSavings.yearly)}
                </div>
                <div className="text-sm text-orange-700 font-medium">Annual Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {formatCurrency(actualSavings.lifetime)}
                </div>
                <div className="text-sm text-orange-700 font-medium">Lifetime Savings</div>
              </div>
            </div>
          </div>
        ) : (
          // Show warning if user's rate is better
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiAlertCircle className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">Your Current Rate is Better!</h3>
            </div>
            
            <div className="text-center py-4">
              <p className="text-gray-700 mb-4">
                Your current offer has a rate that's <span className="font-bold text-blue-600">
                  {formatPercent(rateDifference)} lower
                </span> than what we can offer right now.
              </p>
              <p className="text-gray-600 text-sm">
                We recommend sticking with your current offer. It's a great deal!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(actualSavings.monthly)}
                </div>
                <div className="text-sm text-blue-700 font-medium">You're Already Saving Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(actualSavings.yearly)}
                </div>
                <div className="text-sm text-blue-700 font-medium">Annual Advantage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(actualSavings.lifetime)}
                </div>
                <div className="text-sm text-blue-700 font-medium">Lifetime Benefit</div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action - Conditional */}
        <div className="text-center mb-6">
          {ourRateIsBetter ? (
            // If our rate is better, encourage application
            <>
              <button
                onClick={() => navigate('/loans/new', { state: { loanData: userLoan } })}
                className="bg-green-600 hover:bg-green-700 text-gray font-bold text-lg px-12 py-4 rounded-xl shadow-lg transition-all inline-flex items-center"
              >
                Proceed with Application
                <span className="ml-2">→</span>
              </button>
              <p className="text-sm text-gray-600 mt-3">
                Takes about 10 minutes • No commitment required
              </p>
            </>
          ) : (
            // If user's rate is better, different CTA
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg transition-all inline-flex items-center"
              >
                Go to Dashboard
                <span className="ml-2">→</span>
              </button>
              <p className="text-sm text-gray-600 mt-3">
                Your current offer is already excellent. We'll notify you when we have better rates.
              </p>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Rate Comparison Summary</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Rate Difference:</span>
              <span className="font-semibold text-gray-900">{formatPercent(rateDifference)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Better Option:</span>
              <span className={`font-semibold ${ourRateIsBetter ? 'text-green-600' : 'text-blue-600'}`}>
                {ourRateIsBetter ? 'Our Offer' : 'Their Offer'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Monthly Difference:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(actualSavings.monthly)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Loan Term:</span>
              <span className="font-semibold text-gray-900">{userLoan.loanTerm} years</span>
            </div>
          </div>
        </div>
  
        {/* Modify Loan Details Link */}
        {/* <div className="text-center">
          <button
            onClick={() => navigate('/comparison')}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Modify loan details
          </button>
        </div> */}
      
       <div className="text-center">
        <button
            onClick={() =>
              navigate('/comparison', {
                state: { prefill: { userLoan, ourRates, savings } }
              })
            }
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Modify loan details
          </button>
        </div>
      </div>
    </div>
  );
}