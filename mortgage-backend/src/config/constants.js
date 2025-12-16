const LOAN_TYPES = {
  CONVENTIONAL: 'Conventional',
  FHA: 'FHA',
  VA: 'VA',
  USDA: 'USDA'
};

const PRODUCT_TYPES = {
  FIXED: 'Fixed Rate',
  ARM: 'Adjustable Rate'
};

const LOAN_PURPOSES = {
  PURCHASE: 'Purchase',
  REFINANCE: 'Refinance',
  CASHOUT: 'Cash-Out Refinance'
};

const RATE_QUALITY = {
  EXCELLENT: { min: 0, max: 0.25, label: 'Excellent'},
  GOOD: { min: 0.25, max: 0.5, label: 'Good' },
  FAIR: { min: 0.5, max: 0.75, label: 'Fair' },
  POOR: { min: 0.75, max: Infinity, label: 'Poor' }
};

module.exports = {
  LOAN_TYPES,
  PRODUCT_TYPES,
  LOAN_PURPOSES,
  RATE_QUALITY
};
