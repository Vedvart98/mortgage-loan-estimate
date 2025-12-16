class ClaudeService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
  }

  async extractLoanData(base64PDF) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64PDF
                }
              },
              {
                type: 'text',
                text: this.getExtractionPrompt()
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const extractedText = data.content[0].text;
      
      // Remove markdown code blocks if present
      const cleanedText = extractedText.replace(/```json\n?|\n?```/g, '').trim();
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Claude extraction error:', error);
      throw new Error('Failed to extract loan data from PDF');
    }
  }

  getExtractionPrompt() {
    return `
You are extracting data from a CFPB Loan Estimate form or similar mortgage document.
Extract ALL the following fields and return ONLY valid JSON with no markdown formatting or explanation:

{
  "loanDetails": {
    "loanAmount": <number without commas or $>,
    "interestRate": <number as decimal, e.g., 4.25>,
    "apr": <number as decimal, e.g., 4.537>,
    "loanTerm": <number in years, e.g., 30>,
    "loanType": <string: "Conventional", "FHA", "VA", or "USDA">,
    "productType": <string: "Fixed Rate" or "Adjustable Rate">,
    "purpose": <string: "Purchase", "Refinance", or "Cash-Out Refinance">,
    "propertyValue": <number or null>
  },
  "monthlyPayment": {
    "principalInterest": <number>,
    "mortgageInsurance": <number or null>,
    "escrow": <number or null>,
    "total": <number>
  },
  "closingCosts": {
    "total": <number>,
    "loanCosts": <number or null>,
    "otherCosts": <number or null>,
    "lenderCredits": <number or null>
  },
  "pointsPaid": <number as decimal or null>,
  "mortgageInsuranceMonths": <number or null>,
  "fiveYearTotal": <number or null>,
  "totalInterestPercentage": <number or null>,
  "rateLock": <boolean>,
  "rateLockExpiration": <ISO date string or null>,
  "lenderName": <string or null>,
  "lenderContact": {
    "name": <string or null>,
    "email": <string or null>,
    "phone": <string or null>
  },
  "extractionConfidence": <number 0-100 representing your confidence>
}

Critical rules:
- Extract exact numbers without $, %, or commas
- Use null for missing fields
- Ensure all numbers are valid
- Return ONLY the JSON object
- Do not add any explanation or markdown
    `.trim();
  }

  async analyzeRateQuality(loanData, marketData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `Analyze this loan offer and provide recommendations:

Loan Details:
${JSON.stringify(loanData, null, 2)}

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide analysis as JSON:
{
  "rateQuality": "Excellent|Good|Fair|Poor",
  "percentileRank": <number 0-100>,
  "potentialSavings": <number in dollars over life of loan>,
  "warnings": [<array of strings>],
  "recommendations": [<array of strings>],
  "negotiationPoints": [<array of specific things to negotiate>]
}

Return ONLY valid JSON.`
          }]
        })
      });

      const data = await response.json();
      const cleanedText = data.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Rate analysis error:', error);
      return null;
    }
  }
}

module.exports = ClaudeService;
