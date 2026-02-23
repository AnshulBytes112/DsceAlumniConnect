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
    return <Navigate to="/" replace />;
  }

  // Redirect to verification pending if not approved (and not admin)
  // Check if we are already on the pending page to avoid infinite redirect
  if (user?.role !== 'ADMIN' &&
    (user?.verificationStatus === 'PENDING' || user?.verificationStatus === 'REJECTED') &&
    location.pathname !== '/verification-pending') {
    return <Navigate to="/verification-pending" replace />;
  }

  // If verification is pending, but we ARE on the page, allow it (by falling through to Outlet, 
  // BUT we need to ensure we don't render Outlet for other protected routes if unverified.
  // Actually, ProtectedRoute wraps all protected routes.
  // So if we are unverified, we should ONLY allow /verification-pending.
  // Wait, /verification-pending is likely NOT inside ProtectedRoute in App.tsx?
  // Let's check App.tsx structure. 
  // In App.tsx:
  // <Route element={<ProtectedRoute />}>
  //    <Route path="/home" ... />
  //    <Route path="/verification-pending" ... /> 
  // </Route>
  // So /verification-pending IS inside ProtectedRoute.

  // So if unverified:
  // - If at /verification-pending: Render Outlet (which renders VerificationPending).
  // - If at /home: Redirect to /verification-pending.

  if (user?.role !== 'ADMIN' &&
    (user?.verificationStatus === 'PENDING' || user?.verificationStatus === 'REJECTED') &&
    location.pathname === '/verification-pending') {
    return <Outlet />;
  }


  // If profile is not complete and user is not on profile setup page, redirect to profile setup
  if (user && user.role !== 'ADMIN' && !user.profileComplete && location.pathname !== '/profile-setup' && location.pathname !== '/verification-pending' && location.pathname !== '/dashboard' && location.pathname !== '/dashboard/profile') {
    // Allow access to profile-setup and profile, but redirect dashboard to profile-setup
    if (location.pathname === '/dashboard') {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return <Outlet />;
}
