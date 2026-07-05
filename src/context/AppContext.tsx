import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderState {
  fullName: string;
  phoneNumber: string;
  address: string;
  category: string;
}

interface AppContextType {
  order: OrderState;
  updateOrder: (fields: Partial<OrderState>) => void;
  resetOrder: () => void;
}

const defaultOrder: OrderState = {
  fullName: '',
  phoneNumber: '',
  address: '',
  category: 'Casual Wear',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [order, setOrder] = useState<OrderState>(defaultOrder);

  const updateOrder = (fields: Partial<OrderState>) => {
    setOrder((prev) => ({ ...prev, ...fields }));
  };

  const resetOrder = () => setOrder(defaultOrder);

  return (
    <AppContext.Provider value={{ order, updateOrder, resetOrder }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};