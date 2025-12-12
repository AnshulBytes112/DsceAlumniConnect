import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LayoutDashboard, User, Users, LogOut, LogIn, UserPlus, Bell, Settings, Calendar } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { MobileNavbar } from './MobileNavbar';

export default function GlobalNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = isAuthenticated ? [
    { title: 'Home', icon: GraduationCap, href: '/' },
    { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'Profile', icon: User, href: '/dashboard/profile' },
    { title: 'Alumni', icon: Users, href: '/alumni' },
    { title: 'Announcements', icon: Bell, href: '/dashboard/announcements' },
    { title: 'Events', icon: Calendar, href: '/dashboard/events' },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { type: 'separator' } as const,
    { title: 'Logout', icon: LogOut, onClick: handleLogout },
  ] : [
    { title: 'Home', icon: GraduationCap, href: '/' },
    { title: 'Alumni', icon: Users, href: '/alumni' },
    { type: 'separator' } as const,
    { title: 'Login', icon: LogIn, href: '/login' },
    { title: 'Sign Up', icon: UserPlus, href: '/register' },
  ];

  // Calculate active tab index based on current path - Longest match wins
  const activeTabIndex = tabs
    .map((tab, index) => {
      if (tab.type === 'separator') return { index, match: false, length: 0 };
      if (tab.href === '/') return { index, match: location.pathname === '/', length: 1 };
      const match = tab.href && location.pathname.startsWith(tab.href);
      return { index, match, length: tab.href ? tab.href.length : 0 };
    })
    .filter(item => item.match)
    .sort((a, b) => b.length - a.length)[0]?.index ?? -1;

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    const tab = tabs[index];
    if (tab.type === 'separator') return;
    
    if (tab.onClick) {
      tab.onClick();
    } else if (tab.href) {
      navigate(tab.href);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
        {/* Logo Section - Pointer events enabled for interaction */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-white/20">
          <img 
            src="https://www.eduopinions.com/wp-content/uploads/2021/12/dayananda-sagar-college-of-engineering-1-350x334.jpg"
            alt="DSCE Logo"
            className="h-8 w-auto rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight text-dsce-blue">DSCE Alumni Connect</span>
        </div>

        {/* Desktop Navigation Section - Hidden on mobile */}
        <div className="pointer-events-auto hidden md:block">
          <ExpandableTabs 
            tabs={tabs.map(t => t.type === 'separator' ? { type: 'separator' } : { title: t.title, icon: t.icon })} 
            onChange={handleTabChange}
            activeTabIndex={activeTabIndex !== -1 ? activeTabIndex : null}
            activeColor="text-dsce-gold-hover"
            className="border-dsce-blue/20 bg-white/90 backdrop-blur-md"
          />
        </div>
      </div>

      {/* Mobile Navigation Section - Visible only on mobile */}
      <MobileNavbar tabs={tabs} activeTabIndex={activeTabIndex} />
    </>
  );
}
