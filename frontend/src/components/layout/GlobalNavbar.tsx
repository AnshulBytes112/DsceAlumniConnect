import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, ChevronDown, LogOut, Settings, Edit } from 'lucide-react';
import Sidebar from './Sidebar';

export default function GlobalNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('GlobalNavbar - User data:', user);
  console.log('GlobalNavbar - Profile picture:', user?.profilePicture);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
        {/* Logo Section - Pointer events enabled for interaction */}
        <Link to="/" className="pointer-events-auto flex items-center gap-2 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/20 hover:bg-white/90 hover:shadow-md transition-all duration-200 group">
          <img
            src="https://www.eduopinions.com/wp-content/uploads/2021/12/dayananda-sagar-college-of-engineering-1-350x334.jpg"
            alt="DSCE Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-8 lg:w-auto rounded-lg transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight text-dsce-blue transition-colors duration-200 group-hover:text-dsce-blue/80">
            <span className="hidden sm:inline">DSCE Alumni</span>
            <span className="sm:hidden">DSCE</span>
            <span className="hidden md:inline"> Connect</span>
          </span>
        </Link>

        {/* Right Section - Profile and Menu */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Profile Dropdown - Only show when authenticated */}
          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/90 backdrop-blur-md border border-yellow-200/50 hover:bg-yellow-50/80 transition-all duration-200 shadow-lg"
              >
                {/* Profile Avatar */}
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:8080/${user.profilePicture}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-yellow-300/50"
                    onError={(e) => {
                      console.log('Profile image failed to load:', user.profilePicture);
                      // Fallback to initial if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully:', user.profilePicture);
                    }}
                  />
                ) : null}
                {/* Fallback to initial if no profile picture or image fails */}
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold text-sm ${user?.profilePicture ? 'hidden' : ''}`}>
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-yellow-700 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-yellow-200/50 overflow-hidden z-50">
                  <div className="p-3 border-b border-yellow-200/30">
                    <p className="font-semibold text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-yellow-50/80 hover:text-yellow-900 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      to="/dashboard/profile/edit-profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-yellow-50/80 hover:text-yellow-900 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Link>

                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-yellow-50/80 hover:text-yellow-900 transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-yellow-200/30 py-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Menu Button for Sidebar - Always visible */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 rounded-xl bg-yellow-400/90 backdrop-blur-md border border-yellow-300/50 text-dsce-blue hover:bg-yellow-300 hover:scale-105 transition-all duration-200 shadow-lg"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
