import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEventBus } from '../api/apiService'; // Strict mapping to interceptor channel

interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  authLoading: boolean;
  loginState: (authData: { accessToken: string; refreshToken: string; user: User }) => Promise<void>;
  logoutState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Hooking up the storage bootstrapping and interceptor events on application launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Critical: Storage memory extraction crashed:", e);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAsync();

    // Mapping the apiService event bus to atomic React state modifiers
    authEventBus.onLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
    };
  }, []);

  // Atomic state commit for production-grade logins
  const loginState = async (authData: { accessToken: string; refreshToken: string; user: User }) => {
    try {
      await AsyncStorage.setItem('accessToken', authData.accessToken);
      await AsyncStorage.setItem('refreshToken', authData.refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(authData.user));
      
      setUser(authData.user);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("AsyncStorage hardware allocation collision:", e);
      throw new Error("Failed to write credentials payload stream to disk.");
    }
  };

  // Safe manual teardown operation
  const logoutState = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      console.error("Storage memory cleaning sequence dropped:", e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, user, authLoading, loginState, logoutState }}>
      {children}
    </AppContext.Provider>
  );
}

// High-performance consumer validation hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be invoked strictly within an AppProvider execution tree.");
  }
  return context;
}