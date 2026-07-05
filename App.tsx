import React, { useState } from 'react';
import { AppProvider } from './src/context/AppContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Splash' | 'Home' | 'Receipt'>('Splash');
  const [activeOrderData, setActiveOrderData] = useState<any>(null);

  const navigateToReceipt = (orderData: any) => {
    setActiveOrderData(orderData);
    setCurrentScreen('Receipt');
  };

  return (
    <AppProvider>
      {currentScreen === 'Splash' && (
        <SplashScreen navigation={{ replace: () => setCurrentScreen('Home') }} />
      )}
      {currentScreen === 'Home' && (
        <HomeScreen onOrderSubmit={navigateToReceipt} />
      )}
      {currentScreen === 'Receipt' && (
        <ReceiptScreen 
          orderData={activeOrderData} 
          onBackToHome={() => {
            setActiveOrderData(null);
            setCurrentScreen('Home');
          }} 
        />
      )}
    </AppProvider>
  );
}