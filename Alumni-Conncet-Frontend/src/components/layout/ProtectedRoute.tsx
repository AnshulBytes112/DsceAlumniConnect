import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-brand-bg text-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If profile is not complete and user is not on profile setup page, redirect to profile setup
  if (user && !user.profileComplete && location.pathname !== '/profile-setup' && location.pathname !== '/dashboard') {
    // Allow access to profile-setup, but redirect dashboard to profile-setup
    if (location.pathname === '/dashboard') {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return <Outlet />;
}
