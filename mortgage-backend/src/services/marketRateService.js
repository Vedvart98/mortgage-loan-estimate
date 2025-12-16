const MarketRate = require('../models/MarketRate');

class MarketRateService {
  // Fetch current market rates (mock - replace with real API)
  async fetchCurrentRates(loanType, loanTerm, creditScore) {
    try {
      // In production, call real APIs here
      // For now, return mock data
      
      const mockRates = this.getMockMarketRates(loanType, loanTerm, creditScore);
      
      // Save to database
      const marketRate = new MarketRate({
        loanType,
        loanTerm,
        rates: mockRates.rates,
        sources: mockRates.sources,
        creditScoreRange: {
          min: creditScore - 20,
          max: creditScore + 20
        }
      });
      
      await marketRate.save();
      
      return mockRates;
    } catch (error) {
      console.error('Error fetching market rates:', error);
      throw error;
    }
  }

  getMockMarketRates(loanType, loanTerm, creditScore) {
    // Base rate varies by term
    let baseRate;
    if (loanTerm === 30) baseRate = 6.8;
    else if (loanTerm === 15) baseRate = 6.2;
    else baseRate = 7.0;

    // Adjust for credit score
    if (creditScore >= 760) baseRate -= 0.5;
    else if (creditScore >= 700) baseRate -= 0.25;
    else if (creditScore < 680) baseRate += 0.25;

    // Generate rates from multiple "sources"
    const sources = [
      { provider: 'Lender A', rate: baseRate - 0.125, apr: baseRate - 0.05, points: 0.5 },
      { provider: 'Lender B', rate: baseRate, apr: baseRate + 0.15, points: 0 },
      { provider: 'Lender C', rate: baseRate + 0.125, apr: baseRate + 0.25, points: 0 },
      { provider: 'Lender D', rate: baseRate - 0.25, apr: baseRate - 0.1, points: 1.0 },
      { provider: 'Lender E', rate: baseRate + 0.25, apr: baseRate + 0.35, points: 0 }
    ];

    const rates = sources.map(s => s.rate);
    
    return {
      rates: {
        average: Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 1000) / 1000,
        min: Math.min(...rates),
        max: Math.max(...rates),
        median: this.calculateMedian(rates)
      },
      sources
    };
  }

  calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Get historical rates
  async getHistoricalRates(loanType, loanTerm, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await MarketRate.find({
      loanType,
      loanTerm,
      date: { $gte: startDate }
    }).sort({ date: -1 });
  }

  // Compare user's rate to market
  compareToMarket(userRate, marketData) {
    const { average, min, max } = marketData.rates;
    const difference = userRate - average;
    const percentile = this.calculatePercentile(userRate, marketData.sources.map(s => s.rate));

    let quality;
    if (userRate <= min + 0.125) quality = 'Excellent';
    else if (userRate <= average) quality = 'Good';
    else if (userRate <= average + 0.25) quality = 'Fair';
    else quality = 'Poor';

    return {
      quality,
      difference,
      percentile,
      betterThanPercent: 100 - percentile,
      marketAverage: average,
      marketRange: { min, max }
    };
  }

  calculatePercentile(value, array) {
    const sorted = [...array].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    if (index === -1) return 100;
    return Math.round((index / sorted.length) * 100);
  }
}

module.exports = new MarketRateService();
