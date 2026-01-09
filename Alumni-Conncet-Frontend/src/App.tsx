import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Lazy load components
const Landing = lazy(() => import('./pages/Landing'));
const HomeAuthenticated = lazy(() => import('./pages/HomeAuthenticated'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Alumni = lazy(() => import('./pages/Alumni'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'));
const Events = lazy(() => import('./pages/Events'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Posts = lazy(() => import('./pages/Posts'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-black text-white">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
  </div>
);

import MainLayout from './components/layout/MainLayout';

// ... imports

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />

              {/* Public Routes */}
              <Route path="/alumni" element={<Alumni />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<HomeAuthenticated />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/dashboard/profile/edit-profile" element={<EditProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                <Route path="/dashboard/events" element={<Events />} />
                <Route path="/dashboard/announcements" element={<Announcements />} />
                <Route path="/dashboard/posts" element={<Posts />} />
                <Route path="/dashboard/settings" element={<Settings />} />
              </Route>
              
              {/* Public fallback for unauthenticated users */}
              <Route path="*" element={<Landing />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
