import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center font-bold text-primary-foreground shadow-lg">
              DS
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-foreground">DSCE Alumni Association</h1>
              <p className="text-xs text-primary">The Global Alumni Network</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {['Initiatives', 'Connect', 'Contribute', 'About', 'News', 'Shop'].map((item) => (
              <button key={item} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Search size={20} />
            </button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden md:flex items-center gap-2">
                    <User size={16} />
                    {user?.firstname}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.firstname} {user?.lastname}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="hidden md:block" onClick={() => navigate('/login')}>
                Login / Sign Up
              </Button>
            )}

            <button className="lg:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-card border-t border-border py-4 px-4 animate-fade-in">
          {['Initiatives', 'Connect', 'Contribute', 'About', 'News', 'Shop'].map((item) => (
            <button key={item} className="block w-full text-left py-2 text-muted-foreground hover:text-primary">
              {item}
            </button>
          ))}
          
          {isAuthenticated ? (
            <div className="mt-4 space-y-2">
              <div className="px-4 py-2 bg-card-foreground/5 rounded-lg">
                <p className="font-medium text-foreground">{user?.firstname} {user?.lastname}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button className="mt-4 w-full" onClick={() => navigate('/login')}>
              Login / Sign Up
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
