const express = require('express');
const router = express.Router();
const { 
  getMyLoanEstimates,
  getLoanEstimate,
  createLoanEstimate,
  updateLoanEstimate,
  deleteLoanEstimate,
  compareMultipleLoanEstimates,
  calculateScenarios,
  calculateRefinanceBreakeven,
  getLoanStatistics
} = require('../controllers/loanController');
const { extractPDF, saveLoanEstimate } = require('../controllers/pdfExtractionController');
const { compareRates } = require('../controllers/comparisonController');
const { protect } = require('../middleware/authMiddleware');
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// ===============================================
// PDF EXTRACTION ROUTES
// ===============================================

// @route   POST /api/loans/extract-pdf
// @desc    Extract loan data from PDF using AI
// @access  Private
router.post('/extract-pdf', protect, [
  body('pdfData').notEmpty().withMessage('PDF data is required'),
  validateRequest
], extractPDF);

// ===============================================
// CRUD OPERATIONS
// ===============================================

// @route   GET /api/loans/my-estimates
// @desc    Get all loan estimates for logged-in user with pagination
// @access  Private
router.get('/my-estimates', protect, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
  validateRequest
], getMyLoanEstimates);

// @route   GET /api/loans/:id
// @desc    Get single loan estimate by ID
// @access  Private
router.get('/:id', protect, getLoanEstimate);

// @route   POST /api/loans/create
// @desc    Create new loan estimate manually
// @access  Private
router.post('/create', protect, [
  body('loanDetails.loanAmount').isNumeric().withMessage('Loan amount is required'),
  body('loanDetails.interestRate').isFloat({ min: 0, max: 20 }).withMessage('Valid interest rate required'),
  body('loanDetails.apr').isFloat({ min: 0, max: 25 }).withMessage('Valid APR required'),
  body('loanDetails.loanTerm').isInt().withMessage('Loan term is required'),
  body('loanDetails.loanType').isString().withMessage('Loan type is required'),
  validateRequest
], createLoanEstimate);

// @route   POST /api/loans/save
// @desc    Save loan estimate (from PDF extraction)
// @access  Private
router.post('/save', protect, saveLoanEstimate);

// @route   PUT /api/loans/:id
// @desc    Update loan estimate
// @access  Private
router.put('/:id', protect, [
  body('loanDetails.loanAmount').optional().isNumeric(),
  body('loanDetails.interestRate').optional().isFloat({ min: 0, max: 20 }),
  body('loanDetails.apr').optional().isFloat({ min: 0, max: 25 }),
  validateRequest
], updateLoanEstimate);

// @route   DELETE /api/loans/:id
// @desc    Delete loan estimate
// @access  Private
router.delete('/:id', protect, deleteLoanEstimate);

// ===============================================
// COMPARISON ROUTES
// ===============================================

// @route   POST /api/loans/compare
// @desc    Compare user's rate with market rates
// @access  Private
router.post('/compare', protect, [
  body('loanData').notEmpty().withMessage('Loan data is required'),
  body('creditScore').optional().isInt({ min: 300, max: 850 }),
  validateRequest
], compareRates);

// @route   POST /api/loans/compare-multiple
// @desc    Compare multiple loan estimates
// @access  Private
router.post('/compare-multiple', protect, [
  body('loanIds').isArray({ min: 2 }).withMessage('At least 2 loan IDs required'),
  validateRequest
], compareMultipleLoanEstimates);

// ===============================================
// CALCULATION ROUTES
// ===============================================

// @route   POST /api/loans/calculate-scenarios
// @desc    Calculate different loan scenarios (down payments, terms)
// @access  Private
router.post('/calculate-scenarios', protect, [
  body('propertyValue').isNumeric().withMessage('Property value is required'),
  body('interestRate').isFloat({ min: 0, max: 20 }).withMessage('Interest rate is required'),
  body('downPaymentPercents').optional().isArray(),
  body('loanTerms').optional().isArray(),
  body('creditScore').optional().isInt({ min: 300, max: 850 }),
  validateRequest
], calculateScenarios);

// @route   POST /api/loans/refinance-breakeven
// @desc    Calculate refinance breakeven point
// @access  Private
router.post('/refinance-breakeven', protect, [
  body('currentLoanId').notEmpty().withMessage('Current loan ID is required'),
  body('newInterestRate').isFloat({ min: 0, max: 20 }).withMessage('New interest rate is required'),
  body('newClosingCosts').isNumeric().withMessage('New closing costs are required'),
  body('newLoanTerm').optional().isInt(),
  validateRequest
], calculateRefinanceBreakeven);

// ===============================================
// STATISTICS & ANALYTICS
// ===============================================

// @route   GET /api/loans/stats
// @desc    Get loan statistics for user
// @access  Private
router.get('/stats', protect, getLoanStatistics);

module.exports = router;

