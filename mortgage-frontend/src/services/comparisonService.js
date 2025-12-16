import api from './api';

export const comparisonService = {
  // Compare to market
  compareToMarket: async (loanData, creditScore) => {
    const response = await api.post('/comparison/compare-to-market', {
      loanData,
      creditScore
    });
    return response.data;
  },

  // Compare two loans
  compareTwo: async (loanId1, loanId2) => {
    const response = await api.post('/comparison/compare-two', {
      loanId1,
      loanId2
    });
    return response.data;
  },

  // Comparison matrix
  getMatrix: async (loanIds) => {
    const response = await api.post('/comparison/matrix', { loanIds });
    return response.data;
  },

  // Market trends
  getTrends: async (params) => {
    const response = await api.get('/comparison/trends', { params });
    return response.data;
  },

  // Fee analysis
  analyzeFees: async (params) => {
    const response = await api.post('/comparison/fee-analysis', params);
    return response.data;
  }
};
