import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, setAuthToken, getAuthToken } from '../config/api';
import { toast } from 'sonner';
import type { RegisterData } from './types';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  paymentMethods: PaymentMethod[];
}

interface PaymentMethod {
  id: string;
  type: 'mtn_mobile_money' | 'mastercard' | 'visa' | 'airtel_money';
  identifier: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string, usePhone?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  checkAuth: () => Promise<void>;
}

// RegisterData is imported from './types'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const checkAuth = async () => {
    const token = getAuthToken();
    const storedUser = localStorage.getItem('travvel_user');
    
    if (!token || !storedUser) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      // Verify token with server
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const payload = await response.json();
        const userData = payload?.data || payload; // support both shapes
        const safeName = userData?.name && String(userData.name).trim().length > 0
          ? userData.name
          : (userData?.email ? String(userData.email).split('@')[0] : 'Traveler');
        const normalized = {
          id: String(userData.id || userData._id),
          email: String(userData.email || ''),
          name: safeName,
          phone: String(userData.phoneNumber || ''),
          paymentMethods: Array.isArray(userData.paymentMethods) ? userData.paymentMethods : []
        };
        setUser(normalized);
        localStorage.setItem('travvel_user', JSON.stringify(normalized));
      } else {
        // If token is invalid, clear auth data
        localStorage.removeItem('travvel_user');
        setAuthToken('');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('travvel_user');
      setAuthToken('');
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string, usePhone: boolean = false) => {
    setIsLoading(true);
    try {
      // Prepare login data based on identifier type
      const loginData = usePhone 
        ? { phoneNumber: identifier, password }
        : { email: identifier, password };

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials and try again.');
      }

      // Set auth token and user data
      setAuthToken(data.token);
      
      const safeName = data?.user?.name && data.user.name.trim().length > 0
        ? data.user.name
        : (data?.user?.email ? String(data.user.email).split('@')[0] : 'Traveler');
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: safeName,
        phone: data.user.phoneNumber,
        paymentMethods: data.user.paymentMethods || []
      };
      
      setUser(userData);
      localStorage.setItem('travvel_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // First, register the user
      const registerResponse = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phoneNumber: userData.phone,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      // Auto-login after successful registration using provided identifier
      const identifier = userData.email && userData.email.trim().length > 0
        ? userData.email
        : userData.phone;
      const usePhone = !(userData.email && userData.email.trim().length > 0);
      await login(identifier, userData.password, usePhone);

      // Add payment method if provided (after successful registration and login)
      if (userData.paymentMethod) {
        try {
          await addPaymentMethod(userData.paymentMethod);
        } catch (error) {
          console.error('Failed to add payment method:', error);
          // Don't fail registration if payment method fails
          toast.error('Account created, but failed to save payment method. You can add it later.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('travvel_user');
    setAuthToken('');
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    if (user) {
      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString()
      };
      
      const updatedUser = {
        ...user,
        paymentMethods: [...user.paymentMethods, newMethod]
      };
      
      setUser(updatedUser);
      localStorage.setItem('travvel_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      login, 
      register, 
      logout, 
      isLoading, 
      addPaymentMethod,
      checkAuth 
    }}>
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};