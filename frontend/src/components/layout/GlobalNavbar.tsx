import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import PillNav from '@/components/ui/PillNav';
import {
  ShieldCheck,
  BarChart3,
  Users,
  Calendar,
  Megaphone,
  FileText,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Briefcase,
  Image
} from 'lucide-react';

export default function GlobalNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Format the profile picture URL safely
  const profilePic = user?.profilePicture
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:8080/${user.profilePicture}`)
    : undefined;

  // Hierarchical navigation array
  const navItems = [
    // 1. DISCOVER (Consolidated for space)
    {
      label: 'Explore',
      href: '#',
      dropdownItems: [
        { title: 'Alumni Directory', desc: 'Connect with peers', icon: <Users size={18} />, href: '/alumni' },
        { title: 'Gallery', desc: 'Event memories', icon: <Image size={18} />, href: '/gallery' },
      ]
    },

    // 2. PRIMARY AUTHENTICATED LINKS
    ...(isAuthenticated ? [
      { label: 'Dashboard', href: '/dashboard' },
      
      // 3. COMMUNITY DROPDOWN (Shortens navbar)
      {
        label: 'Community',
        href: '#',
        dropdownItems: [
          { title: 'Events', desc: 'Join upcoming gatherings', icon: <Calendar size={18} />, href: '/dashboard/events' },
          { title: 'Forums', desc: 'Topic-based groups', icon: <MessageSquare size={18} />, href: '/dashboard/forums' },
          { title: 'Job Board', desc: 'Career opportunities', icon: <Briefcase size={18} />, href: '/jobs' },
          { title: 'Announcements', desc: 'Official updates', icon: <Megaphone size={18} />, href: '/dashboard/announcements' },
          { title: 'Posts', desc: 'Alumni updates', icon: <FileText size={18} />, href: '/dashboard/posts' },
        ]
      }
    ] : []),


    // 4. ADMIN ONLY (Dropdown)
    ...(isAuthenticated && user?.role === 'ADMIN' ? [
      {
        label: 'Admin Tools',
        href: '#',
        dropdownItems: [
          { title: 'Verification', desc: 'Approve credentials', icon: <ShieldCheck size={18} />, href: '/admin/verification' },
          { title: 'Analytics', desc: 'Platform usage data', icon: <BarChart3 size={18} />, href: '/admin/analytics' },
          { title: 'Manage Alumni', desc: 'User database', icon: <Users size={18} />, href: '/admin/alumni' },
          { title: 'Event Admin', desc: 'Manage gatherings', icon: <Calendar size={18} />, href: '/admin/events' },
        ]
      }
    ] : []),

    // 5. GUEST ITEMS
    ...(!isAuthenticated ? [
      { label: 'Login', href: '/login' },
      { label: 'Sign Up', href: '/register' }
    ] : []),

    // 6. PROFILE Avatar
    ...(isAuthenticated ? [
      {
        label: 'Profile',
        href: '#',
        isAvatar: true,
        avatarUrl: profilePic,
        dropdownItems: [
          { title: 'My Profile', desc: 'Public presence', icon: <User size={18} />, href: '/dashboard/profile' },
          { title: 'Settings', desc: 'Account prefs', icon: <Settings size={18} />, href: '/dashboard/settings' },
          { title: 'Logout', desc: 'Sign out safely', icon: <LogOut size={18} className="text-red-500" />, href: '#', onClick: logout },
        ]
      }
    ] : [])
  ];

  return (
    <PillNav
      logo="https://www.eduopinions.com/wp-content/uploads/2021/12/dayananda-sagar-college-of-engineering-1-350x334.jpg"
      logoAlt="DSCE Logo"
      items={navItems}
      activeHref={location.pathname}
      baseColor="#001e40"
      pillColor="#ffffff"
    />
  );
}