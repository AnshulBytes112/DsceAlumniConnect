import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu } from 'lucide-react';
// import Sidebar from './Sidebar';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Debug logging
  console.log("User role:", user?.role);

  const handleMenuClick = () => {
    console.log('Menu clicked!');
    setIsSidebarOpen(true);
    alert('Menu button clicked! Sidebar would open here.');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#003366] shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://www.eduopinions.com/wp-content/uploads/2021/12/dayananda-sagar-college-of-engineering-1-350x334.jpg"
            alt="DSCE Logo"
            className="h-8 w-auto rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight text-white">DSCE Alumni</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-white">Welcome back!</span>
              <div className="flex items-center gap-2">
                {/* Important pages in navbar */}
                <Link to="/dashboard">
                  <Button className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                    Alumni
                  </Button>
                </Link>
                
                {/* Admin specific important page */}
                {user && user?.role?.toUpperCase() === 'ADMIN' && (
                  <Link to="/admin/alumni">
                    <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                      Manage Alumni
                    </Button>
                  </Link>
                )}
                
                {/* Menu button for sidebar - show on all screens */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMenuClick}
                  className="text-white hover:text-[#FFD700] border border-white bg-blue-600"
                >
                  <Menu className="w-5 h-5" />
                  Menu
                </Button>
                
                {/* Logout button */}
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-white hover:text-red-400 text-sm hidden lg:block"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:text-[#00AEEF]">
                  Login
                </Button>
              </Link>
              <Link to="/alumni">
                <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                  Alumni
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar temporarily disabled */}
      {/* <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> */}
    </>
  );
}
