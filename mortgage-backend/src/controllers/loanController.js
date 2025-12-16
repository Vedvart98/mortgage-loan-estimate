const LoanEstimate = require('../models/LoanEstimate');
const calculationService = require('../services/calculationService');
const Validators = require('../utils/validator');
const Helpers = require('../utils/helper');

// @desc    Get all loan estimates for logged-in user
// @route   GET /api/loans/my-estimates
// @access  Private
exports.getMyLoanEstimates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const loans = await LoanEstimate.find({ userId: req.user.id })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await LoanEstimate.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: loans,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single loan estimate by ID
// @route   GET /api/loans/:id
// @access  Private
exports.getLoanEstimate = async (req, res, next) => {
  try {
    const loan = await LoanEstimate.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan estimate not found'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new loan estimate manually
// @route   POST /api/loans/create
// @access  Private
exports.createLoanEstimate = async (req, res, next) => {
  try {
    const loanData = req.body;

    // Validate loan data
    const validation = Validators.validateLoanData(loanData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Calculate additional fields if not provided
    if (!loanData.monthlyPayment?.principalInterest) {
      const monthlyPI = calculationService.calculateMonthlyPayment(
        loanData.loanDetails.loanAmount,
        loanData.loanDetails.interestRate,
        loanData.loanDetails.loanTerm
      );
      
      loanData.monthlyPayment = {
        ...loanData.monthlyPayment,
        principalInterest: monthlyPI
      };
    }

    // Calculate LTV if property value exists
    if (loanData.loanDetails.propertyValue) {
      const ltv = calculationService.calculateLTV(
        loanData.loanDetails.loanAmount,
        loanData.loanDetails.propertyValue
      );

      // Calculate PMI if LTV > 80%
      if (ltv > 80 && !loanData.monthlyPayment.mortgageInsurance) {
        const creditScore = req.body.creditScore || 720;
        loanData.monthlyPayment.mortgageInsurance = calculationService.calculatePMI(
          loanData.loanDetails.loanAmount,
          ltv,
          creditScore
        );
      }
    }

    // Calculate total monthly payment
    const { principalInterest = 0, mortgageInsurance = 0, escrow = 0 } = loanData.monthlyPayment;
    loanData.monthlyPayment.total = principalInterest + mortgageInsurance + escrow;

    // Calculate 5-year total if not provided
    if (!loanData.fiveYearTotal) {
      loanData.fiveYearTotal = calculationService.calculateFiveYearCost(
        loanData.monthlyPayment.total,
        loanData.closingCosts?.total || 0
      );
    }

    // Create loan estimate
    const loan = new LoanEstimate({
      userId: req.user.id,
      ...loanData,
      createdAt: new Date()
    });

    await loan.save();

    res.status(201).json({
      success: true,
      data: loan,
      message: 'Loan estimate created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan estimate
// @route   PUT /api/loans/:id
// @access  Private
exports.updateLoanEstimate = async (req, res, next) => {
  try {
    let loan = await LoanEstimate.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan estimate not found'
      });
    }

    // Validate updated data
    const validation = Validators.validateLoanData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Update loan
    Object.assign(loan, req.body);
    loan.updatedAt = new Date();
    await loan.save();

    res.json({
      success: true,
      data: loan,
      message: 'Loan estimate updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete loan estimate
// @route   DELETE /api/loans/:id
// @access  Private
exports.deleteLoanEstimate = async (req, res, next) => {
  try {
    const loan = await LoanEstimate.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan estimate not found'
      });
    }

    res.json({
      success: true,
      message: 'Loan estimate deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare multiple loan estimates
// @route   POST /api/loans/compare-multiple
// @access  Private
exports.compareMultipleLoanEstimates = async (req, res, next) => {
  try {
    const { loanIds } = req.body;

    if (!loanIds || loanIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 loan IDs to compare'
      });
    }

    const loans = await LoanEstimate.find({
      _id: { $in: loanIds },
      userId: req.user.id
    });

    if (loans.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'Not enough loans found for comparison'
      });
    }

    // Create comparison matrix
    const comparisons = [];
    for (let i = 0; i < loans.length; i++) {
      for (let j = i + 1; j < loans.length; j++) {
        const comparison = calculationService.compareLoanOffers(loans[i], loans[j]);
        comparisons.push({
          loan1: {
            id: loans[i]._id,
            lender: loans[i].lenderName,
            apr: loans[i].loanDetails.apr
          },
          loan2: {
            id: loans[j]._id,
            lender: loans[j].lenderName,
            apr: loans[j].loanDetails.apr
          },
          comparison
        });
      }
    }

    // Find best loan (lowest 5-year total cost)
    const bestLoan = loans.reduce((best, current) => {
      return (current.fiveYearTotal < best.fiveYearTotal) ? current : best;
    });

    res.json({
      success: true,
      data: {
        loans,
        comparisons,
        bestLoan: {
          id: bestLoan._id,
          lender: bestLoan.lenderName,
          apr: bestLoan.loanDetails.apr,
          monthlyPayment: bestLoan.monthlyPayment.total,
          fiveYearTotal: bestLoan.fiveYearTotal
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate loan scenarios (different down payments, terms, etc.)
// @route   POST /api/loans/calculate-scenarios
// @access  Private
exports.calculateScenarios = async (req, res, next) => {
  try {
    const { 
      propertyValue, 
      interestRate, 
      downPaymentPercents = [5, 10, 15, 20],
      loanTerms = [15, 30],
      creditScore = 720
    } = req.body;

    if (!propertyValue || !interestRate) {
      return res.status(400).json({
        success: false,
        message: 'Property value and interest rate are required'
      });
    }

    const scenarios = [];

    for (const downPayment of downPaymentPercents) {
      for (const term of loanTerms) {
        const loanAmount = propertyValue * (1 - downPayment / 100);
        const ltv = calculationService.calculateLTV(loanAmount, propertyValue);
        
        const monthlyPI = calculationService.calculateMonthlyPayment(
          loanAmount,
          interestRate,
          term
        );

        const pmi = ltv > 80 
          ? calculationService.calculatePMI(loanAmount, ltv, creditScore)
          : 0;

        const totalMonthly = monthlyPI + pmi;
        const totalInterest = calculationService.calculateTotalInterest(
          loanAmount,
          monthlyPI,
          term
        );

        scenarios.push({
          downPaymentPercent: downPayment,
          downPaymentAmount: propertyValue * (downPayment / 100),
          loanTerm: term,
          loanAmount,
          ltv,
          monthlyPayment: {
            principalInterest: monthlyPI,
            pmi,
            total: totalMonthly
          },
          totalInterest,
          totalPaid: totalMonthly * term * 12,
          lifetimeCost: totalMonthly * term * 12 + (propertyValue * downPayment / 100)
        });
      }
    }

    // Sort by lifetime cost
    scenarios.sort((a, b) => a.lifetimeCost - b.lifetimeCost);

    res.json({
      success: true,
      data: {
        scenarios,
        bestScenario: scenarios[0],
        summary: {
          propertyValue,
          interestRate,
          scenariosGenerated: scenarios.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate refinance breakeven
// @route   POST /api/loans/refinance-breakeven
// @access  Private
exports.calculateRefinanceBreakeven = async (req, res, next) => {
  try {
    const {
      currentLoanId,
      newInterestRate,
      newClosingCosts,
      newLoanTerm
    } = req.body;

    const currentLoan = await LoanEstimate.findOne({
      _id: currentLoanId,
      userId: req.user.id
    });

    if (!currentLoan) {
      return res.status(404).json({
        success: false,
        message: 'Current loan not found'
      });
    }

    // Calculate current monthly payment
    const currentMonthly = currentLoan.monthlyPayment.total;

    // Calculate new monthly payment
    const newMonthly = calculationService.calculateMonthlyPayment(
      currentLoan.loanDetails.loanAmount,
      newInterestRate,
      newLoanTerm || currentLoan.loanDetails.loanTerm
    );

    const monthlySavings = currentMonthly - newMonthly;
    
    if (monthlySavings <= 0) {
      return res.json({
        success: true,
        data: {
          recommendation: 'NOT_RECOMMENDED',
          message: 'Refinancing would increase your monthly payment',
          currentMonthly,
          newMonthly,
          monthlySavings
        }
      });
    }

    const breakEvenMonths = calculationService.calculateRefinanceBreakeven(
      newClosingCosts,
      monthlySavings
    );

    const totalSavingsOverLife = monthlySavings * (newLoanTerm || currentLoan.loanDetails.loanTerm) * 12;

    res.json({
      success: true,
      data: {
        recommendation: breakEvenMonths <= 36 ? 'RECOMMENDED' : 'CONSIDER',
        currentMonthly,
        newMonthly,
        monthlySavings,
        breakEvenMonths,
        breakEvenYears: Math.round(breakEvenMonths / 12 * 10) / 10,
        newClosingCosts,
        totalSavingsOverLife: totalSavingsOverLife - newClosingCosts,
        analysis: {
          shortTerm: breakEvenMonths <= 24 ? 'Great deal' : 'Decent',
          longTerm: totalSavingsOverLife > newClosingCosts * 3 ? 'Excellent' : 'Good'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loan statistics for user
// @route   GET /api/loans/stats
// @access  Private
exports.getLoanStatistics = async (req, res, next) => {
  try {
    const loans = await LoanEstimate.find({ userId: req.user.id });

    if (loans.length === 0) {
      return res.json({
        success: true,
        data: {
          totalLoans: 0,
          message: 'No loan estimates found'
        }
      });
    }

    const aprs = loans.map(l => l.loanDetails.apr);
    const monthlyPayments = loans.map(l => l.monthlyPayment.total);

    const stats = {
      totalLoans: loans.length,
      averageAPR: aprs.reduce((a, b) => a + b, 0) / aprs.length,
      lowestAPR: Math.min(...aprs),
      highestAPR: Math.max(...aprs),
      averageMonthlyPayment: monthlyPayments.reduce((a, b) => a + b, 0) / monthlyPayments.length,
      totalLoanAmount: loans.reduce((sum, l) => sum + l.loanDetails.loanAmount, 0),
      loanTypeBreakdown: loans.reduce((acc, loan) => {
        const type = loan.loanDetails.loanType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      bestLoan: loans.reduce((best, current) => {
        return (current.loanDetails.apr < best.loanDetails.apr) ? current : best;
      })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
