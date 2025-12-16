const mongoose = require('mongoose');
const marketRateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  loanType: {
    type: String,
    required: true
  },
  loanTerm: {
    type: Number,
    required: true
  },
  rates: {
    average: Number,
    min: Number,
    max: Number,
    median: Number
  },
  sources: [{
    provider: String,
    rate: Number,
    apr: Number,
    points: Number
  }],
  creditScoreRange: {
    min: Number,
    max: Number
  },
  region: String
});

// Index for fast querying
marketRateSchema.index({ date: -1, loanType: 1, loanTerm: 1 });

module.exports = mongoose.model('MarketRate', marketRateSchema);