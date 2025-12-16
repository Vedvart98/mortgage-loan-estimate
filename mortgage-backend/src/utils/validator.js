class Validators {
  static isValidLoanAmount(amount) {
    return amount > 0 && amount <= 10000000; // Max $10M
  }

  static isValidInterestRate(rate) {
    return rate > 0 && rate < 20; // 0-20%
  }

  static isValidLoanTerm(term) {
    return [10, 15, 20, 25, 30].includes(term);
  }

  static isValidAPR(apr, interestRate) {
    // APR should be greater than or equal to interest rate
    return apr >= interestRate && apr < 25;
  }

  static isValidLTV(ltv) {
    return ltv > 0 && ltv <= 100;
  }

  static isValidCreditScore(score) {
    return score >= 300 && score <= 850;
  }

  static isValidPropertyValue(value) {
    return value > 0 && value <= 50000000; // Max $50M
  }

  static validateLoanData(loanData) {
    const errors = [];

    if (!this.isValidLoanAmount(loanData.loanDetails.loanAmount)) {
      errors.push('Invalid loan amount');
    }

    if (!this.isValidInterestRate(loanData.loanDetails.interestRate)) {
      errors.push('Invalid interest rate');
    }

    if (!this.isValidLoanTerm(loanData.loanDetails.loanTerm)) {
      errors.push('Invalid loan term');
    }

    if (!this.isValidAPR(loanData.loanDetails.apr, loanData.loanDetails.interestRate)) {
      errors.push('Invalid APR - must be greater than or equal to interest rate');
    }

    if (loanData.loanDetails.propertyValue && 
        !this.isValidPropertyValue(loanData.loanDetails.propertyValue)) {
      errors.push('Invalid property value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;
