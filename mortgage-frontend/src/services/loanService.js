// import api from './api';

export const loanService = {
  // Extract PDF
  extractPDF: async (pdfData) => {
    const response = await api.post('/loans/extract-pdf', { pdfData });
    return response.data;
  },

  // Get all loans
  getMyLoans: async (params = {}) => {
    const response = await api.get('/loans/my-estimates', { params });
    return response.data;
  },

  // Get single loan
  getLoan: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  // Create loan
  createLoan: async (loanData) => {
    const response = await api.post('/loans/create', loanData);
    return response.data;
  },

  // Save loan (from PDF)
  saveLoan: async (loanData) => {
    const response = await api.post('/loans/save', loanData);
    return response.data;
  },

  // Update loan
  updateLoan: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },

  // Delete loan
  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/loans/stats');
    return response.data;
  },

  // Calculate scenarios
  calculateScenarios: async (params) => {
    const response = await api.post('/loans/calculate-scenarios', params);
    return response.data;
  },

  // Refinance breakeven
  calculateRefinanceBreakeven: async (params) => {
    const response = await api.post('/loans/refinance-breakeven', params);
    return response.data;
  }
};