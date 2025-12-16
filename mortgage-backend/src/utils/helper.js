class Helpers {
  // Format currency
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Format percentage
  static formatPercentage(value, decimals = 3) {
    return `${value.toFixed(decimals)}%`;
  }

  // Convert base64 to buffer
  static base64ToBuffer(base64) {
    return Buffer.from(base64, 'base64');
  }

  // Generate unique filename
  static generateFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = originalName.split('.').pop();
    return `${timestamp}-${random}.${ext}`;
  }

  // Calculate months until date
  static monthsUntil(date) {
    const now = new Date();
    const target = new Date(date);
    const months = (target.getFullYear() - now.getFullYear()) * 12 
                  + (target.getMonth() - now.getMonth());
    return months;
  }

  // Deep clone object
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Remove null/undefined values from object
  static cleanObject(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
}

module.exports = Helpers;
