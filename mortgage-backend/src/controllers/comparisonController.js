const marketRateService = require('../services/marketRateService');
const calculationService = require('../services/calculationService');

exports.compareRates = async (req, res) => {
  try {
    const { loanData, creditScore = 720 } = req.body;

    // Fetch current market rates
    const marketData = await marketRateService.fetchCurrentRates(
      loanData.loanDetails.loanType,
      loanData.loanDetails.loanTerm,
      creditScore
    );

    // Compare user's rate to market
    const comparison = marketRateService.compareToMarket(
      loanData.loanDetails.apr,
      marketData
    );

    // Calculate potential savings
    const bestMarketRate = marketData.rates.min;
    const currentMonthly = loanData.monthlyPayment.total;
    const bestMonthly = calculationService.calculateMonthlyPayment(
      loanData.loanDetails.loanAmount,
      bestMarketRate,
      loanData.loanDetails.loanTerm
    );

    const monthlySavings = currentMonthly - bestMonthly;
    const fiveYearSavings = monthlySavings * 60;
    const lifetimeSavings = monthlySavings * loanData.loanDetails.loanTerm * 12;

    // Get AI analysis
    const aiAnalysis = await claudeService.analyzeRateQuality(loanData, marketData);

    res.json({
      success: true,
      data: {
        comparison,
        marketData,
        potentialSavings: {
          monthly: Math.round(monthlySavings * 100) / 100,
          fiveYear: Math.round(fiveYearSavings * 100) / 100,
          lifetime: Math.round(lifetimeSavings * 100) / 100
        },
        aiAnalysis,
        recommendations: generateRecommendations(comparison, monthlySavings)
      }
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare rates',
      error: error.message
    });
  }
};

function generateRecommendations(comparison, monthlySavings) {
  const recommendations = [];

  if (comparison.quality === 'Poor' || comparison.quality === 'Fair') {
    recommendations.push('Your rate is above market average. Consider shopping around for better offers.');
    
    if (monthlySavings > 100) {
      recommendations.push(`You could save approximately $${Math.round(monthlySavings)}/month with a better rate.`);
    }
  }

  if (comparison.quality === 'Excellent') {
    recommendations.push('Your rate is excellent! This is better than most market offers.');
  }

  if (comparison.difference > 0.5) {
    recommendations.push('Your APR is significantly higher than market average. Request a breakdown of fees.');
  }

  return recommendations;
}
