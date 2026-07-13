import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEventBus, apiService } from '../api/apiService'; 

interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface PriceItem {
  id: string;
  item_id: string;
  service_option_id: string;
  price: number;
  currency_code: string;
}

interface CatalogItem {
  id: string;
  category_id: string;
  name: string;
  code: string;
  prices: PriceItem[];
}

interface Category {
  id: string;
  name: string;
  code: string;
  items: CatalogItem[];
}

interface AppContextType {
  // Auth Matrix
  isAuthenticated: boolean;
  user: User | null;
  authLoading: boolean;
  loginState: (authData: { accessToken: string; refreshToken: string; user: User }) => Promise<void>;
  logoutState: () => Promise<void>;
  
  // --- ORDER RETENTION LAYER ---
  customerData: any;
  setCustomerData: React.Dispatch<React.SetStateAction<any>>;
  quantities: { [key: string]: number };
  setQuantities: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  
  // --- PRE-LOADED API DATA STREAM ---
  categories: Category[];
  catalog: CatalogItem[]; // FIXED: Added missing flat catalog signature contract
  isCatalogLoading: boolean;
  preloadCatalog: () => Promise<void>;
  clearOrderCache: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [customerData, setCustomerData] = useState<any>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(false);

  // EAGER FETCH ENGINE
  const preloadCatalog = async () => {
    try {
      setIsCatalogLoading(true);
      const response = await apiService.get('/catalog/full');
      
      const catalogData = response.data?.data || response.data || [];
      const validCategories = catalogData.filter((cat: any) => {
        return cat.is_active === undefined ? true : cat.is_active;
      });
      
      setCategories(validCategories);
    } catch (error) {
      console.error("Critical Runtime: Pre-loading active laundry aggregates failed:", error);
    } finally {
      setIsCatalogLoading(false);
    }
  };

  // CRITICAL MEMOIZED FIX: Flattening the tree structure to support $O(n)$ summary searching
  const catalog = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.reduce<CatalogItem[]>((acc, currentCategory) => {
      if (currentCategory && Array.isArray(currentCategory.items)) {
        return acc.concat(currentCategory.items);
      }
      return acc;
    }, []);
  }, [categories]);

  const clearOrderCache = () => {
    setCustomerData({});
    setQuantities({});
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          apiService.get('/catalog/full')
            .then(res => {
              const data = res.data?.data || res.data || [];
              setCategories(data.filter((cat: any) => cat.is_active !== false));
            })
            .catch(err => console.error("Silent catalog hydrate failed:", err));
        }
      } catch (e) {
        console.error("Critical: Storage memory extraction crashed:", e);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAsync();

    authEventBus.onLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      clearOrderCache(); 
    };
  }, []);

  const loginState = async (authData: { accessToken: string; refreshToken: string; user: User }) => {
    try {
      await AsyncStorage.setItem('accessToken', authData.accessToken);
      await AsyncStorage.setItem('refreshToken', authData.refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(authData.user));
      
      setUser(authData.user);
      setIsAuthenticated(true);
      
      await preloadCatalog();
    } catch (e) {
      console.error("AsyncStorage hardware allocation collision:", e);
      throw new Error("Failed to write credentials payload stream to disk.");
    }
  };

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
      clearOrderCache();
    }
  };

  return (
    <AppContext.Provider value={{ 
      isAuthenticated, 
      user, 
      authLoading, 
      loginState, 
      logoutState,
      customerData,
      setCustomerData,
      quantities,
      setQuantities,
      categories,
      catalog, // Inject fixed flat schema reference down to engine nodes
      isCatalogLoading,
      preloadCatalog,
      clearOrderCache
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be invoked strictly within an AppProvider execution tree.");
  }
  return context;
}