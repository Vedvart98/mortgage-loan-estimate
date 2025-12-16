const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const marketRateService = require('../services/marketRateService');
const calculationService = require('../services/calculationService');
const ClaudeService = require('../services/claudeService');
const LoanEstimate = require('../models/LoanEstimate');

const claudeService = new ClaudeService(process.env.ANTHROPIC_API_KEY);

// @desc    Compare user's rate with market rates
// @route   POST /api/comparison/compare-to-market
// @access  Private
router.post('/compare-to-market', protect, [
  body('loanData').notEmpty().withMessage('Loan data is required'),
  body('loanData.loanDetails.loanAmount').isNumeric().withMessage('Valid loan amount required'),
  body('loanData.loanDetails.apr').isFloat({ min: 0, max: 25 }).withMessage('Valid APR required'),
  body('creditScore').optional().isInt({ min: 300, max: 850 }).withMessage('Valid credit score required'),
  validateRequest
], async (req, res, next) => {
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

    // Generate recommendations
    const recommendations = generateRecommendations(comparison, monthlySavings, loanData);

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
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Compare two specific loans
// @route   POST /api/comparison/compare-two
// @access  Private
router.post('/compare-two', protect, [
  body('loanId1').notEmpty().withMessage('First loan ID is required'),
  body('loanId2').notEmpty().withMessage('Second loan ID is required'),
  validateRequest
], async (req, res, next) => {
  try {
    const { loanId1, loanId2 } = req.body;

    const [loan1, loan2] = await Promise.all([
      LoanEstimate.findOne({ _id: loanId1, userId: req.user.id }),
      LoanEstimate.findOne({ _id: loanId2, userId: req.user.id })
    ]);

    if (!loan1 || !loan2) {
      return res.status(404).json({
        success: false,
        message: 'One or both loans not found'
      });
    }

    const comparison = calculationService.compareLoanOffers(loan1, loan2);

    // Add detailed breakdown
    const breakdown = {
      apr: {
        loan1: loan1.loanDetails.apr,
        loan2: loan2.loanDetails.apr,
        difference: loan2.loanDetails.apr - loan1.loanDetails.apr,
        winner: loan1.loanDetails.apr < loan2.loanDetails.apr ? 'loan1' : 'loan2'
      },
      monthlyPayment: {
        loan1: loan1.monthlyPayment.total,
        loan2: loan2.monthlyPayment.total,
        difference: comparison.monthlyPaymentDiff,
        winner: comparison.monthlyPaymentDiff < 0 ? 'loan2' : 'loan1'
      },
      closingCosts: {
        loan1: loan1.closingCosts.total,
        loan2: loan2.closingCosts.total,
        difference: comparison.closingCostsDiff,
        winner: comparison.closingCostsDiff < 0 ? 'loan2' : 'loan1'
      },
      fiveYearCost: {
        loan1: loan1.fiveYearTotal,
        loan2: loan2.fiveYearTotal,
        difference: comparison.fiveYearDiff,
        winner: comparison.fiveYearDiff < 0 ? 'loan2' : 'loan1'
      },
      overallWinner: comparison.betterOption
    };

    res.json({
      success: true,
      data: {
        loan1: {
          id: loan1._id,
          lender: loan1.lenderName,
          details: loan1
        },
        loan2: {
          id: loan2._id,
          lender: loan2.lenderName,
          details: loan2
        },
        comparison,
        breakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get comparison matrix for multiple loans
// @route   POST /api/comparison/matrix
// @access  Private
router.post('/matrix', protect, [
  body('loanIds').isArray({ min: 2 }).withMessage('At least 2 loan IDs required'),
  validateRequest
], async (req, res, next) => {
  try {
    const { loanIds } = req.body;

    const loans = await LoanEstimate.find({
      _id: { $in: loanIds },
      userId: req.user.id
    });

    if (loans.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'Not enough valid loans found'
      });
    }

    // Create comparison matrix
    const matrix = [];
    const metrics = ['apr', 'monthlyPayment', 'closingCosts', 'fiveYearTotal'];

    for (const metric of metrics) {
      const row = {
        metric,
        loans: loans.map(loan => ({
          loanId: loan._id,
          lender: loan.lenderName,
          value: getMetricValue(loan, metric)
        }))
      };

      // Find best value for this metric
      const values = row.loans.map(l => l.value);
      const bestValue = Math.min(...values);
      row.loans.forEach(l => {
        l.isBest = l.value === bestValue;
      });

      matrix.push(row);
    }

    // Overall scoring
    const scores = loans.map(loan => {
      let score = 0;
      matrix.forEach(row => {
        const loanEntry = row.loans.find(l => l.loanId.toString() === loan._id.toString());
        if (loanEntry.isBest) score += 1;
      });
      return {
        loanId: loan._id,
        lender: loan.lenderName,
        score,
        maxScore: metrics.length
      };
    });

    scores.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: {
        matrix,
        scores,
        bestOverall: scores[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get market trends
// @route   GET /api/comparison/trends
// @access  Private
router.get('/trends', protect, [
  query('loanType').optional().isString(),
  query('loanTerm').optional().isInt(),
  query('days').optional().isInt({ min: 7, max: 365 }),
  validateRequest
], async (req, res, next) => {
  try {
    const { loanType = 'Conventional', loanTerm = 30, days = 30 } = req.query;

    const history = await marketRateService.getHistoricalRates(
      loanType,
      parseInt(loanTerm),
      parseInt(days)
    );

    if (history.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No historical data available',
          trends: []
        }
      });
    }

    // Calculate trend
    const rates = history.map(h => h.rates.average);
    const oldest = rates[rates.length - 1];
    const newest = rates[0];
    const change = newest - oldest;
    const percentChange = (change / oldest) * 100;

    const trend = {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change,
      percentChange,
      current: newest,
      previous: oldest
    };

    res.json({
      success: true,
      data: {
        loanType,
        loanTerm,
        period: `${days} days`,
        trend,
        history: history.map(h => ({
          date: h.date,
          average: h.rates.average,
          min: h.rates.min,
          max: h.rates.max
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Compare APR vs Interest Rate (fee analysis)
// @route   POST /api/comparison/fee-analysis
// @access  Private
router.post('/fee-analysis', protect, [
  body('interestRate').isFloat({ min: 0, max: 20 }).withMessage('Valid interest rate required'),
  body('apr').isFloat({ min: 0, max: 25 }).withMessage('Valid APR required'),
  body('loanAmount').isNumeric().withMessage('Valid loan amount required'),
  body('loanTerm').isInt().withMessage('Valid loan term required'),
  validateRequest
], async (req, res, next) => {
  try {
    const { interestRate, apr, loanAmount, loanTerm, closingCosts = 0 } = req.body;

    const aprDifference = apr - interestRate;
    
    // Calculate implied fees from APR difference
    const monthlyPaymentAtRate = calculationService.calculateMonthlyPayment(
      loanAmount,
      interestRate,
      loanTerm
    );

    const monthlyPaymentAtAPR = calculationService.calculateMonthlyPayment(
      loanAmount,
      apr,
      loanTerm
    );

    const analysis = {
      interestRate,
      apr,
      aprDifference,
      interpretation: getAPRInterpretation(aprDifference),
      monthlyPaymentAtRate,
      monthlyPaymentAtAPR,
      monthlyDifference: monthlyPaymentAtAPR - monthlyPaymentAtRate,
      closingCosts,
      estimatedFees: closingCosts,
      feeAsPercent: (closingCosts / loanAmount) * 100,
      recommendations: getFeesRecommendations(aprDifference, closingCosts, loanAmount)
    };

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
});

// Helper Functions
function generateRecommendations(comparison, monthlySavings, loanData) {
  const recommendations = [];

  if (comparison.quality === 'Poor' || comparison.quality === 'Fair') {
    recommendations.push({
      type: 'warning',
      message: 'Your rate is above market average. Consider shopping around for better offers.',
      priority: 'high'
    });
    
    if (monthlySavings > 100) {
      recommendations.push({
        type: 'savings',
        message: `You could save approximately ${Math.round(monthlySavings)}/month with a better rate.`,
        priority: 'high'
      });
    }
  }

  if (comparison.quality === 'Excellent') {
    recommendations.push({
      type: 'success',
      message: 'Your rate is excellent! This is better than most market offers.',
      priority: 'low'
    });
  }

  if (comparison.difference > 0.5) {
    recommendations.push({
      type: 'warning',
      message: 'Your APR is significantly higher than market average. Request a breakdown of fees.',
      priority: 'high'
    });
  }

  // Points analysis
  if (loanData.pointsPaid > 0) {
    const pointsCost = loanData.loanDetails.loanAmount * (loanData.pointsPaid / 100);
    const breakeven = calculationService.calculatePointsBreakeven(pointsCost, monthlySavings);
    
    recommendations.push({
      type: 'info',
      message: `You paid ${loanData.pointsPaid} points (${pointsCost.toFixed(0)}). Breakeven: ${breakeven} months.`,
      priority: 'medium'
    });
  }

  // LTV analysis
  if (loanData.loanDetails.propertyValue) {
    const ltv = calculationService.calculateLTV(
      loanData.loanDetails.loanAmount,
      loanData.loanDetails.propertyValue
    );

    if (ltv > 80 && ltv < 85) {
      recommendations.push({
        type: 'info',
        message: `Your LTV is ${ltv.toFixed(1)}%. Consider a larger down payment to eliminate PMI and get better rates.`,
        priority: 'medium'
      });
    }
  }

  return recommendations;
}

function getMetricValue(loan, metric) {
  switch (metric) {
    case 'apr':
      return loan.loanDetails.apr;
    case 'monthlyPayment':
      return loan.monthlyPayment.total;
    case 'closingCosts':
      return loan.closingCosts.total;
    case 'fiveYearTotal':
      return loan.fiveYearTotal;
    default:
      return 0;
  }
}

function getAPRInterpretation(difference) {
  if (difference < 0.125) {
    return 'Excellent - Very low fees';
  } else if (difference < 0.25) {
    return 'Good - Reasonable fees';
  } else if (difference < 0.5) {
    return 'Fair - Moderate fees';
  } else {
    return 'High - Significant fees included';
  }
}

function getFeesRecommendations(aprDiff, closingCosts, loanAmount) {
  const recommendations = [];

  if (aprDiff > 0.5) {
    recommendations.push('Request an itemized breakdown of all fees and closing costs.');
    recommendations.push('Ask your lender to explain why the APR is significantly higher than the interest rate.');
  }

  const feePercent = (closingCosts / loanAmount) * 100;
  if (feePercent > 3) {
    recommendations.push(`Closing costs are ${feePercent.toFixed(1)}% of loan amount, which is high. Negotiate or shop around.`);
  }

  if (aprDiff < 0.25) {
    recommendations.push('Your fees appear reasonable relative to your interest rate.');
  }

  return recommendations;
}

module.exports = router;