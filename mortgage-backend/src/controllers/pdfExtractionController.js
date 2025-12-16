const ClaudeService = require('../services/claudeService');
const LoanEstimate = require('../models/LoanEstimate');

const claudeService = new ClaudeService(process.env.ANTHROPIC_API_KEY);

exports.extractPDF = async (req, res) => {
  try {
    const { pdfData } = req.body;

    if (!pdfData) {
      return res.status(400).json({
        success: false,
        message: 'PDF data is required'
      });
    }

    // Extract data using Claude
    const extractedData = await claudeService.extractLoanData(pdfData);

    // Validate extracted data
    if (!extractedData.loanDetails || !extractedData.loanDetails.loanAmount) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract valid loan data from PDF'
      });
    }

    res.json({
      success: true,
      data: extractedData,
      message: 'PDF extracted successfully'
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract PDF data',
      error: error.message
    });
  }
};

exports.saveLoanEstimate = async (req, res) => {
  try {
    const userId = req.user.id;
    const loanData = req.body;

    const loanEstimate = new LoanEstimate({
      userId,
      ...loanData
    });

    await loanEstimate.save();

    res.status(201).json({
      success: true,
      data: loanEstimate,
      message: 'Loan estimate saved successfully'
    });

  } catch (error) {
    console.error('Save loan estimate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save loan estimate',
      error: error.message
    });
  }
};
