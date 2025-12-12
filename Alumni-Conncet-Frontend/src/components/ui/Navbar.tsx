import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  onClick?: () => void;
}

interface NavbarProps {
  logo: string;
  logoAlt?: string;
  avatar?: string;
  items: NavItem[];
  activeHref?: string;
  className?: string;
}

const Navbar = ({
  logo,
  logoAlt = 'Logo',
  avatar,
  items,
  activeHref,
  className = ''
}: NavbarProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '#logout') return false;
    return activeHref === href || location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav className={`bg-[#003366] shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src={avatar || logo} 
                alt={logoAlt}
                className="h-10 w-10 rounded-full object-cover border-2 border-[#FFD700]"
              />
              <span className="ml-3 text-xl font-bold text-[#FFD700]">DSCE Alumni</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {items.map((item) => (
              item.onClick ? (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.href === '#logout' 
                      ? 'text-white hover:bg-red-600 hover:text-white'
                      : isActive(item.href)
                      ? 'text-[#FFD700] bg-[#003366]/20 border-b-2 border-[#FFD700]'
                      : 'text-white hover:text-[#FFD700] hover:bg-[#003366]/20'
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-[#FFD700] bg-[#003366]/20 border-b-2 border-[#FFD700]'
                      : 'text-white hover:text-[#FFD700] hover:bg-[#003366]/20'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {items.map((item) => (
                item.onClick ? (
                  <button
                    key={item.href}
                    onClick={() => {
                      item.onClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                      item.href === '#logout'
                        ? 'text-white hover:bg-red-600'
                        : isActive(item.href)
                        ? 'text-[#FFD700] bg-[#003366]/20'
                        : 'text-white hover:text-[#FFD700] hover:bg-[#003366]/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'text-[#FFD700] bg-[#003366]/20'
                        : 'text-white hover:text-[#FFD700] hover:bg-[#003366]/20'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
