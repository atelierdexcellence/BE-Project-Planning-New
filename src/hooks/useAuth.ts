import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
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
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Map Supabase user to our User type
        const mappedUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'team_member',
          initials: (session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'U')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
        };
        setUser(mappedUser);
      } else {
        // Fallback to localStorage for demo
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Fallback to localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try Supabase auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Fallback to mock authentication
        const foundUser = MOCK_USERS.find(u => u.email === email);
        if (foundUser && password === 'password') {
          setUser(foundUser);
          localStorage.setItem('user', JSON.stringify(foundUser));
        } else {
          throw new Error('Invalid credentials');
        }
      } else if (data.user) {
        const mappedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'team_member',
          initials: (data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'U')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
        };
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, login, logout, isLoading };
};