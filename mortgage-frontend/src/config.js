export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const LOAN_TYPES = {
  CONVENTIONAL: 'Conventional',
  FHA: 'FHA',
  VA: 'VA',
  USDA: 'USDA'
};

export const LOAN_TERMS = [10, 15, 20, 25, 30];

export const RATE_QUALITY = {
  EXCELLENT: { color: 'green', label: 'Excellent' },
  GOOD: { color: 'blue', label: 'Good' },
  FAIR: { color: 'yellow', label: 'Fair' },
  POOR: { color: 'red', label: 'Poor' }
};