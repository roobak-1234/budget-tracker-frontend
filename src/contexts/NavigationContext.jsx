import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const showNavigation = () => setIsNavigating(true);
  const hideNavigation = () => setIsNavigating(false);

  return (
    <NavigationContext.Provider value={{ isNavigating, showNavigation, hideNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
};