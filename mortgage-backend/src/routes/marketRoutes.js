const express = require('express');
const router = express.Router();
const marketRateService = require('../services/marketRateService');
const { protect } = require('../middleware/authMiddleware');

// Get current market rates
router.get('/rates', protect, async (req, res) => {
  try {
    const { loanType = 'Conventional', loanTerm = 30, creditScore = 720 } = req.query;

    const rates = await marketRateService.fetchCurrentRates(
      loanType,
      parseInt(loanTerm),
      parseInt(creditScore)
    );

    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching market rates',
      error: error.message
    });
  }
});

// Get historical rates
router.get('/rates/history', protect, async (req, res) => {
  try {
    const { loanType = 'Conventional', loanTerm = 30, days = 30 } = req.query;

    const history = await marketRateService.getHistoricalRates(
      loanType,
      parseInt(loanTerm),
      parseInt(days)
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching historical rates',
      error: error.message
    });
  }
});

module.exports = router;
