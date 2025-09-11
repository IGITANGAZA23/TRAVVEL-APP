import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, setAuthToken, getAuthToken } from '../config/api';

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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  paymentMethod: Omit<PaymentMethod, 'id'>;
}

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('travvel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
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

  const register = async (userData: RegisterData & { password: string }) => {
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

      // Auto-login after successful registration
      const loginResponse = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        // Registration was successful but auto-login failed
        throw new Error('Registration successful, but automatic login failed. Please log in manually.');
      }

      // Set auth token and user data
      setAuthToken(loginData.token);
      
      const userDataResponse = {
        id: loginData.user.id,
        email: loginData.user.email,
        name: loginData.user.name,
        phone: userData.phone,
        paymentMethods: []
      };
      
      setUser(userDataResponse);
      localStorage.setItem('travvel_user', JSON.stringify(userDataResponse));
      
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

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    addPaymentMethod
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};