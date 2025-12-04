import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/ui/Navbar';
import { dashboardUser } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { apiClient, type UserProfile } from '@/lib/api';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const userAvatar = userProfile?.profilePicture || dashboardUser.avatar;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/dashboard/profile' },
    { label: 'Alumni', href: '/alumni' },
    { label: 'Announcements', href: '/dashboard/announcements' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Logout', href: '#logout', onClick: handleLogout, hoverColor: '#dc2626' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Navbar
        logo="https://cdn-icons-png.flaticon.com/512/2997/2997295.png" // Placeholder logo or use local asset
        logoAlt="DSCE Alumni"
        avatar={userAvatar}
        items={navItems}
        activeHref={pathname}
      />
    </div>
  );
}
