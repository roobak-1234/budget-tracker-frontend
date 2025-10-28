const currencyConfig = {
  INR: { locale: 'en-IN', symbol: '₹' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  JPY: { locale: 'ja-JP', symbol: '¥' },
  CAD: { locale: 'en-CA', symbol: 'C$' },
  AUD: { locale: 'en-AU', symbol: 'A$' }
};

export const formatCurrency = (amount, currency) => {
  // Get currency from user data in localStorage if not provided
  if (!currency) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      currency = userData.currency || process.env.REACT_APP_DEFAULT_CURRENCY || 'USD';
    } catch (error) {
      currency = process.env.REACT_APP_DEFAULT_CURRENCY || 'USD';
    }
  }
  
  if (amount === null || amount === undefined) return currencyConfig[currency]?.symbol + '0.00';
  
  const config = currencyConfig[currency] || currencyConfig.USD;
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${config.symbol}${amount}`;
  }
};

export const parseCurrency = (value) => {
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
};

export const getCurrencySymbol = (currency) => {
  // Get currency from user data in localStorage if not provided
  if (!currency) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      currency = userData.currency || process.env.REACT_APP_DEFAULT_CURRENCY || 'USD';
    } catch (error) {
      currency = process.env.REACT_APP_DEFAULT_CURRENCY || 'USD';
    }
  }
  return currencyConfig[currency]?.symbol || '$';
};