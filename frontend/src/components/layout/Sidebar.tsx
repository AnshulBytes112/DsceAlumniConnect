import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Home, Users, User, Calendar, Megaphone, FileText, Briefcase, MessageSquare, Image, Settings, Shield, BarChart3, LogOut, LogIn, UserPlus, LayoutDashboard, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  show: boolean;
  isLogout?: boolean;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems: NavItem[] = [
    // Public items for all users (authenticated and non-authenticated)
    {
      title: 'Home',
      path: '/',
      icon: Home,
      show: true // Always show
    },
    {
      title: 'Alumni Directory',
      path: '/alumni',
      icon: Users,
      show: true // Always show
    },
    {
      title: 'Gallery',
      path: '/gallery',
      icon: Image,
      show: true // Always show
    },
    
    // Authenticated user items
    ...(isAuthenticated ? [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        show: isAuthenticated
      },
      {
        title: 'Profile',
        path: '/dashboard/profile',
        icon: User,
        show: isAuthenticated && user?.role !== 'ADMIN'
      },
      {
        title: 'Events',
        path: '/dashboard/events',
        icon: Calendar,
        show: isAuthenticated
      },
      {
        title: 'Announcements',
        path: '/dashboard/announcements',
        icon: Megaphone,
        show: isAuthenticated
      },
      {
        title: 'Posts',
        path: '/dashboard/posts',
        icon: FileText,
        show: isAuthenticated
      },
      {
        title: 'Jobs',
        path: '/jobs',
        icon: Briefcase,
        show: isAuthenticated
      },
      {
        title: 'Forums',
        path: '/dashboard/forums',
        icon: MessageSquare,
        show: isAuthenticated
      },
      {
        title: 'Settings',
        path: '/dashboard/settings',
        icon: Settings,
        show: isAuthenticated
      }
    ] : [
      // Non-authenticated user items
      {
        title: 'Login',
        path: '/login',
        icon: LogIn,
        show: !isAuthenticated
      },
      {
        title: 'Sign Up',
        path: '/register',
        icon: UserPlus,
        show: !isAuthenticated
      }
    ]),
    
    // Admin only items
    ...(isAuthenticated && user?.role === 'ADMIN' ? [
      {
        title: 'Admin Dashboard',
        path: '/admin/verification',
        icon: Shield,
        show: isAuthenticated && user?.role === 'ADMIN'
      },
      {
        title: 'Manage Alumni',
        path: '/admin/alumni',
        icon: Users,
        show: isAuthenticated && user?.role === 'ADMIN'
      },
      {
        title: 'Analytics',
        path: '/admin/analytics',
        icon: BarChart3,
        show: isAuthenticated && user?.role === 'ADMIN'
      },
      {
        title: 'Event Management',
        path: '/admin/events',
        icon: Calendar,
        show: isAuthenticated && user?.role === 'ADMIN'
      }
    ] : []),
    
    // Logout for authenticated users
    ...(isAuthenticated ? [
      {
        title: 'Logout',
        path: '#',
        icon: LogOut,
        show: isAuthenticated,
        isLogout: true
      }
    ] : [])
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-yellow-50/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-yellow-200/50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-200/50 bg-yellow-100/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-yellow-900">Navigation Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  console.log('Sidebar navigation clicked:', item.title, '->', item.path);
                  if (item.isLogout) {
                    logout();
                  }
                  onClose();
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-yellow-400/80 text-yellow-900 shadow-md backdrop-blur-sm border border-yellow-300/50'
                    : 'text-yellow-800 hover:bg-yellow-200/60 hover:text-yellow-900'
                  }
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {isAuthenticated && (
          <div className="p-4 border-t border-yellow-200/50 bg-yellow-100/50 backdrop-blur-sm">
            <Button
              onClick={() => {
                logout();
                onClose();
              }}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/80 backdrop-blur-sm"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
