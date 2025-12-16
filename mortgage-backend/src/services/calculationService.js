class CalculationService {
  // Calculate monthly payment (P&I only)
  calculateMonthlyPayment(principal, annualRate, termYears) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return Math.round(payment * 100) / 100;
  }

  // Calculate APR from rate and fees
  calculateAPR(principal, rate, fees, termYears) {
    // Simplified APR calculation
    // Real APR requires iterative calculation
    const monthlyPayment = this.calculateMonthlyPayment(principal, rate, termYears);
    const totalPaid = monthlyPayment * termYears * 12;
    const totalCost = totalPaid + fees;
    
    const apr = ((totalCost - principal) / principal / termYears) * 100;
    return Math.round(apr * 1000) / 1000;
  }

  // Calculate total interest over loan life
  calculateTotalInterest(principal, monthlyPayment, termYears) {
    const totalPaid = monthlyPayment * termYears * 12;
    return totalPaid - principal;
  }

  // Calculate loan-to-value ratio
  calculateLTV(loanAmount, propertyValue) {
    if (!propertyValue || propertyValue === 0) return null;
    return Math.round((loanAmount / propertyValue) * 10000) / 100;
  }

  // Calculate PMI (rough estimate)
  calculatePMI(loanAmount, ltv, creditScore) {
    if (ltv <= 80) return 0;
    
    let rate;
    if (creditScore >= 760) rate = 0.003;
    else if (creditScore >= 700) rate = 0.005;
    else if (creditScore >= 680) rate = 0.007;
    else rate = 0.01;
    
    return Math.round((loanAmount * rate / 12) * 100) / 100;
  }

  // Calculate 5-year total cost
  calculateFiveYearCost(monthlyPayment, closingCosts) {
    return (monthlyPayment * 60) + closingCosts;
  }

  // Calculate breakeven for points
  calculatePointsBreakeven(pointsCost, monthlySavings) {
    if (monthlySavings <= 0) return Infinity;
    return Math.ceil(pointsCost / monthlySavings);
  }

  // Calculate refinance breakeven
  calculateRefinanceBreakeven(closingCosts, monthlySavings) {
    if (monthlySavings <= 0) return null;
    return Math.ceil(closingCosts / monthlySavings);
  }

  // Compare two loans
  compareLoanOffers(loan1, loan2) {
    const comparison = {
      monthlyPaymentDiff: loan2.monthlyPayment.total - loan1.monthlyPayment.total,
      aprDiff: loan2.loanDetails.apr - loan1.loanDetails.apr,
      closingCostsDiff: loan2.closingCosts.total - loan1.closingCosts.total,
      fiveYearDiff: loan2.fiveYearTotal - loan1.fiveYearTotal,
      betterOption: null
    };

    // Determine better option based on 5-year cost
    comparison.betterOption = comparison.fiveYearDiff < 0 ? 'loan2' : 'loan1';

    return comparison;
  }
}

module.exports = new CalculationService();
