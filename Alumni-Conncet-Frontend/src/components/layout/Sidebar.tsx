import { useLocation, useNavigate } from 'react-router-dom';
import PillNav from '@/components/ui/PillNav';
import { dashboardUser } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/dashboard/profile' },
    { label: 'Announcements', href: '/dashboard/announcements' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Logout', href: '#logout', onClick: handleLogout, hoverColor: '#ef4444' },
  ];

  return (
    <div className="fixed top-0 left-5 w-full z-50 pointer-events-none ">
      <div className="pointer-events-auto">
        <PillNav
          logo="https://cdn-icons-png.flaticon.com/512/2997/2997295.png" // Placeholder logo or use local asset
          logoAlt="DSCE Alumni"
          avatar={dashboardUser.avatar}
          items={navItems}
          activeHref={pathname}
          baseColor="var(--color-brand-accent)"
          pillColor="var(--color-secondary)"
          pillTextColor="var(--color-foreground)"
          hoveredPillTextColor="var(--color-foreground)"
          className="p-4"
          onMobileMenuClick={() => {}}
        />
      </div>
    </div>
  );
}
