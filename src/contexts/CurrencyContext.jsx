import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState(process.env.REACT_APP_DEFAULT_CURRENCY || 'USD');

  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
    }
  }, [user]);

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    // Update user data in localStorage
    if (user) {
      const updatedUser = { ...user, currency: newCurrency };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    currency,
    setCurrency: updateCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};