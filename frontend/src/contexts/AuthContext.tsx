import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const userData: User = {
        id: '1',
        email,
        name: 'Noble Prince',
        phone: '+250781234567',
        paymentMethods: [
          {
            id: '1',
            type: 'mtn_mobile_money',
            identifier: '+256701234567',
            isDefault: true
          }
        ]
      };
      
      setUser(userData);
      localStorage.setItem('travvel_user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        paymentMethods: [
          {
            ...userData.paymentMethod,
            id: '1',
            isDefault: true
          }
        ]
      };
      
      setUser(newUser);
      localStorage.setItem('travvel_user', JSON.stringify(newUser));
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