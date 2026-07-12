import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper'; 
import { AppProvider, useApp } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import SelectItemsScreen from './src/screens/SelectedItemsScreen';
import OrderSummaryScreen from './src/screens/OrderSummaryScreen'; // IMPORT NEW LAYER

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    secondary: '#E9D5FF',
  },
};

// Strict State Types for Pipeline Navigation
type ScreenState = 'AuthGate' | 'Dashboard' | 'SelectItems' | 'OrderSummary' | 'Receipt';

function RootNavigation() {
  const { isAuthenticated, authLoading } = useApp();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('AuthGate');
  const [activeOrderData, setActiveOrderData] = useState<any>(null);
  
  // Pipeline Buffers to accumulate state layers across screens
  const [customerPayload, setCustomerPayload] = useState<any>(null);
  const [combinedSummaryPayload, setCombinedSummaryPayload] = useState<any>(null);

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

      {/* 2. HOME SCREEN: Gathers Customer, Address, and Schedule Meta */}
      {currentScreen === 'Dashboard' && isAuthenticated && (
        <HomeScreen 
          onOrderSubmit={(payload) => {
            setCustomerPayload(payload); // Store Payload 1
            setCurrentScreen('SelectItems'); 
          }} 
        />
      )}

      {/* 3. SELECT ITEMS SCREEN: Gathers Selected Items Matrix */}
      {currentScreen === 'SelectItems' && isAuthenticated && (
        <SelectItemsScreen 
          routePayload={customerPayload}
          onBack={() => setCurrentScreen('Dashboard')}
          onNext={(selectedItemsArray) => {
            // MERGE SYSTEM: Bundling Customer Meta and Selected Items together
            setCombinedSummaryPayload({
              customerData: customerPayload,
              selectedItems: selectedItemsArray // Store Payload 2
            });
            setCurrentScreen('OrderSummary'); // Shift navigation focus forward
          }}
        />
      )}

      {/* 4. ORDER SUMMARY SCREEN: Final review ledger & API mutations emitter */}
      {currentScreen === 'OrderSummary' && isAuthenticated && (
        <OrderSummaryScreen
          routePayload={combinedSummaryPayload}
          onBack={() => setCurrentScreen('SelectItems')}
          onOrderSuccess={(serverReceiptResponse) => {
            setActiveOrderData(serverReceiptResponse); // Inject finalized backend write log
            setCurrentScreen('Receipt'); // Pop view stack straight to transaction statement
          }}
        />
      )}

      {/* 5. TRANSACTION STATEMENT / RECEIPT LAYER */}
      {currentScreen === 'Receipt' && isAuthenticated && (
        <ReceiptScreen
          orderData={activeOrderData}
          onBackToHome={() => {
            // Memory Sweep: De-allocate dynamic memory states to prevent field bleeding
            setActiveOrderData(null);
            setCustomerPayload(null);
            setCombinedSummaryPayload(null);
            setCurrentScreen('Dashboard'); // Hard reset back to terminal home
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