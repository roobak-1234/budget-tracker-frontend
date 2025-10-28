export const getEnabledCurrencies = () => {
  const storedCurrencies = localStorage.getItem('enabledCurrencies');
  if (storedCurrencies) {
    return JSON.parse(storedCurrencies);
  }
  
  // Default enabled currencies
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
  ];
};