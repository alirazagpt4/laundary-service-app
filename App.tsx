import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper'; 
import { AppProvider, useApp } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import SelectItemsScreen from './src/screens/SelectedItemsScreen';
import OrderSummaryScreen from './src/screens/OrderSummaryScreen';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    secondary: '#E9D5FF',
  },
};

// Strict State Types for Pipeline Navigation Matrix
type ScreenState = 'AuthGate' | 'Dashboard' | 'SelectItems' | 'OrderSummary' | 'Receipt';

function RootNavigation() {
  const { isAuthenticated, authLoading, customerData, clearOrderCache } = useApp();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('AuthGate');
  const [activeOrderData, setActiveOrderData] = useState<any>(null);

  // Sync Navigation Gate with Global Authentication State Matrix
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        setCurrentScreen('Dashboard');
      } else {
        setCurrentScreen('AuthGate');
      }
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      {/* 1. AUTH LAYER */}
      {currentScreen === 'AuthGate' && !isAuthenticated && (
        <LoginScreen />
      )}

      {/* 2. HOME SCREEN: Mutates and Retains Customer Data in Context */}
      {currentScreen === 'Dashboard' && isAuthenticated && (
        <HomeScreen 
          onOrderSubmit={() => {
            // No local allocation. Data is already preserved inside AppContext
            setCurrentScreen('SelectItems'); 
          }} 
        />
      )}

      {/* 3. SELECT ITEMS SCREEN: Quantities are globally bound to Context */}
      {currentScreen === 'SelectItems' && isAuthenticated && (
        <SelectItemsScreen 
          routePayload={customerData} // Pass direct context state node reference
          onBack={() => setCurrentScreen('Dashboard')}
          onNext={() => {
            // Drop redundant payload bundling wrapper. Summary will parse Context directly.
            setCurrentScreen('OrderSummary'); 
          }}
        />
      )}

      {/* 4. ORDER SUMMARY SCREEN: Pulls live data from Context and fires post mutations */}
      {currentScreen === 'OrderSummary' && isAuthenticated && (
        <OrderSummaryScreen
          routePayload={customerData}
          onBack={() => setCurrentScreen('SelectItems')}
          onOrderSuccess={(serverReceiptResponse) => {
            setActiveOrderData(serverReceiptResponse); // Retain invoice footprint for display
            setCurrentScreen('Receipt'); 
          }}
        />
      )}

      {/* 5. TRANSACTION STATEMENT / RECEIPT LAYER */}
      {currentScreen === 'Receipt' && isAuthenticated && (
        <ReceiptScreen
          orderData={activeOrderData}
          onBackToHome={() => {
            // CRITICAL RESET: Purge transactional order states globally to avoid payload bleeding
            clearOrderCache();
            setActiveOrderData(null);
            setCurrentScreen('Dashboard'); // Hard reset back to terminal home state
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <RootNavigation />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});