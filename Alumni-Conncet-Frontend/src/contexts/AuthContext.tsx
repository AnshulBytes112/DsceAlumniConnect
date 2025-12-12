import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  loading: boolean;
  isTokenExpired: () => boolean;
}

const TOKEN_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = () => {
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (!tokenTimestamp) return true;
    
    const timestamp = parseInt(tokenTimestamp);
    const now = Date.now();
    return (now - timestamp) > TOKEN_EXPIRY_TIME;
  };

  const clearExpiredSession = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
    setUser(null);
  };

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('user');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');

    if (storedToken && storedUser && tokenTimestamp) {
      try {
        // Check if token is expired
        if (isTokenExpired()) {
          console.log('Token expired, clearing session');
          clearExpiredSession();
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        clearExpiredSession();
      }
    } else {
      // Clear any partial session data
      clearExpiredSession();
    }
    setLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    setUser(authData);
    localStorage.setItem('jwtToken', authData.jwtToken);
    localStorage.setItem('user', JSON.stringify(authData));
    localStorage.setItem('tokenTimestamp', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    clearExpiredSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        isTokenExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
