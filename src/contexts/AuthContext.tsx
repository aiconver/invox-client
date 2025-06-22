
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('invox_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name: email === 'admin@company.com' ? 'Admin User' : 'Employee User',
        role: email === 'admin@company.com' ? 'admin' : 'employee',
        organizationId: 'org-1'
      };
      
      setUser(mockUser);
      localStorage.setItem('invox_user', JSON.stringify(mockUser));
      
      toast({
        title: "✅ Login Successful",
        description: `Welcome back, ${mockUser.name}!`,
        className: "border-green-200 bg-green-50 text-green-800",
      });
    } catch (error) {
      toast({
        title: "❌ Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('invox_user');
    toast({
      title: "👋 Logged Out",
      description: "You have been successfully logged out.",
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
