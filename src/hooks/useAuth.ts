import { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock authentication - replace with real auth
const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin', initials: 'AU' },
  { id: '2', name: 'Team Member', email: 'team@company.com', role: 'team_member', initials: 'TM' },
  { id: '3', name: 'Commercial User', email: 'commercial@company.com', role: 'commercial', initials: 'CU' },
  { id: '4', name: 'Atelier User', email: 'atelier@company.com', role: 'atelier', initials: 'AT' },
];

export const useAuthHook = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock login - replace with real authentication
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, login, logout, isLoading };
};