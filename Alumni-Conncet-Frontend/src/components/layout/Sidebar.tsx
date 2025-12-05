import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, User, Bell, Settings, LogOut } from 'lucide-react';
import StaggeredMenu, { type StaggeredMenuItem } from '@/components/ui/StaggeredMenu';

import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: StaggeredMenuItem[] = [
    { label: 'Home', link: '/', ariaLabel: 'Go to Home', icon: <Home className="w-5 h-5" /> },
    { label: 'Dashboard', link: '/dashboard', ariaLabel: 'Go to Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Profile', link: '/dashboard/profile', ariaLabel: 'Go to Profile', icon: <User className="w-5 h-5" /> },
    { label: 'Announcements', link: '/dashboard/announcements', ariaLabel: 'View Announcements', icon: <Bell className="w-5 h-5" /> },
    { label: 'Settings', link: '/dashboard/settings', ariaLabel: 'Go to Settings', icon: <Settings className="w-5 h-5" /> },
    { label: 'Logout', link: '#logout', ariaLabel: 'Logout', onClick: handleLogout, icon: <LogOut className="w-5 h-5" /> },
  ];

  const getCurrentLabel = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    const item = navItems.find(item => item.link === path);
    return item ? item.label : 'Menu';
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <StaggeredMenu
          items={navItems}
          position="left"
          logoUrl=""
          accentColor="var(--color-brand-accent)"
          menuButtonColor="var(--color-brand-text)"
          openMenuButtonColor="var(--color-brand-text)"
          currentPage={getCurrentLabel()}
        />
      </div>
    </div>
  );
}
