import { useState, useEffect } from 'react';
import { comparisonService } from '../../services/comparisonService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function RateComparison({ loanData }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creditScore, setCreditScore] = useState(720);

  useEffect(() => {
    if (loanData) {
      fetchComparison();
    }
  }, [loanData, creditScore]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await comparisonService.compareToMarket(loanData, creditScore);
      setComparison(response.data);
    } catch (error) {
      toast.error('Failed to fetch comparison');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading comparison...</div>;
  }

  if (!comparison) {
    return null;
  }

  const getQualityColor = (quality) => {
    const colors = {
      Excellent: 'text-green-600',
      Good: 'text-blue-600',
      Fair: 'text-yellow-600',
      Poor: 'text-red-600'
    };
    return colors[quality];
  };

  return (
    <div className="space-y-6">
      {/* Rate Quality */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Your Rate Quality</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-4xl font-bold ${getQualityColor(comparison.comparison.quality)}`}>
              {comparison.comparison.quality}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Better than {comparison.comparison.betterThanPercent}% of market offers
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Your APR</p>
            <p className="text-2xl font-bold">{formatPercent(loanData.loanDetails.apr)}</p>
            <p className="text-sm text-gray-500 mt-2">Market Average</p>
            <p className="text-lg font-semibold">{formatPercent(comparison.comparison.marketAverage)}</p>
          </div>
        </div>
      </div>

      {/* Potential Savings */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Potential Savings</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monthly</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(comparison.potentialSavings.monthly)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">5 Years</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(comparison.potentialSavings.fiveYear)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lifetime</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(comparison.potentialSavings.lifetime)}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {comparison.recommendations && comparison.recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {comparison.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{rec.message || rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}