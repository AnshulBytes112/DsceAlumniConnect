import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type AuthResponse, type UserProfile } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  loading: boolean;
  isTokenExpired: () => boolean;
  setUser: (user: UserProfile | null) => void;
}

const TOKEN_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes (matches backend) 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const isTokenExpired = () => {
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (!tokenTimestamp) return true;
    
    const timestamp = parseInt(tokenTimestamp);
    const now = Date.now();
    return (now - timestamp) > TOKEN_EXPIRY_TIME;
  };

  // React Query to fetch user profile
  const { data: user, isLoading: loading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) return null;
      if (isTokenExpired()) {
        logout();
        return null;
      }
      return await apiClient.getProfile();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache profile for 5 mins
  });

  const login = (authData: AuthResponse) => {
    localStorage.setItem('jwtToken', authData.jwtToken);
    localStorage.setItem('tokenTimestamp', Date.now().toString());
    // Directly set the user data in cache to avoid an extra fetch
    queryClient.setQueryData(['user'], authData); 
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('tokenTimestamp');
    localStorage.removeItem('user'); // Cleanup legacy
    queryClient.setQueryData(['user'], null);
    queryClient.clear();
  };

  const setUser = (userData: UserProfile | null) => {
    queryClient.setQueryData(['user'], userData);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isAdmin,
        login,
        logout,
        loading,
        isTokenExpired,
        setUser,
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
