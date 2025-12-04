import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#003366] shadow-lg">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD700]">
          <GraduationCap className="h-5 w-5 text-[#003366]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">DSCE Alumni</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-white">Welcome back!</span>
            <div className="flex items-center gap-2">
              <Link to="/dashboard/profile">
                <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                  Profile
                </Button>
              </Link>
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
              <Button 
                variant="ghost" 
                onClick={logout}
                className="text-white hover:text-red-400 text-sm"
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
  );
}
