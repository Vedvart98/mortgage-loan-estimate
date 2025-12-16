const mongoose = require('mongoose');
const loanEstimateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanDetails: {
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    apr: { type: Number, required: true },
    loanTerm: { type: Number, required: true },
    loanType: { type: String, required: true },
    productType: { type: String, required: true },
    purpose: String,
    propertyValue: Number
  },
  monthlyPayment: {
    principalInterest: Number,
    mortgageInsurance: Number,
    escrow: Number,
    total: Number
  },
  closingCosts: {
    total: Number,
    loanCosts: Number,
    otherCosts: Number,
    lenderCredits: Number
  },
  pointsPaid: Number,
  mortgageInsuranceMonths: Number,
  fiveYearTotal: Number,
  totalInterestPercentage: Number,
  rateLock: Boolean,
  rateLockExpiration: Date,
  lenderName: String,
  lenderContact: {
    name: String,
    email: String,
    phone: String
  },
  pdfUrl: String,
  extractionConfidence: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Calculate LTV
loanEstimateSchema.virtual('ltv').get(function() {
  if (!this.loanDetails.propertyValue) return null;
  return (this.loanDetails.loanAmount / this.loanDetails.propertyValue) * 100;
});

module.exports = mongoose.model('LoanEstimate', loanEstimateSchema);
