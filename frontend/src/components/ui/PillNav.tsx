import { useState, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface DropdownItem {
  title: string;
  desc: string;
  icon?: ReactNode;
  href: string;
  onClick?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  ariaLabel?: string;
  onClick?: () => void;
  hoverColor?: string;
  hoverTextColor?: string;
  isAvatar?: boolean;
  avatarUrl?: string;
  dropdownItems?: DropdownItem[];
}

interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: NavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  initialLoadAnimation?: boolean;
}

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
}: PillNavProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [itemWidths, setItemWidths] = useState<Record<number, number>>({});

  const navItemsRef = useRef<HTMLDivElement>(null);

  const isRouterLink = (href: string) => href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#');

  const cssVars = {
    '--base': '#001e40',
    '--pill-bg': 'rgba(255, 255, 255, 0.85)',
    '--indicator-bg': '#f2efed',
    '--nav-h': '52px',
    '--pill-pad-x': '20px',
    '--pill-gap': '4px'
  } as CSSProperties;

  const springConfig = { type: 'spring' as const, stiffness: 350, damping: 30 };

  return (
    <LayoutGroup>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-max max-w-[95vw] px-4">
        <nav
          className={`relative w-full md:w-max flex items-center justify-center box-border ${className}`}
          aria-label="Primary"
          style={cssVars}
        >
          {/* LOGO */}
          <Link
            to="/"
            className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgba(0,51,102,0.08)] bg-white/85 backdrop-blur-xl transition-transform hover:scale-105 z-20"
            style={{ width: 'var(--nav-h)', height: 'var(--nav-h)' }}
          >
            <img src={logo} alt={logoAlt} className="w-full h-full object-cover block rounded-full" />
          </Link>

          {/* DESKTOP NAV ITEMS */}
          <div
            className="relative items-center rounded-full hidden md:flex ml-3 shadow-[0_8px_30px_rgba(0,51,102,0.08)] bg-white/85 backdrop-blur-xl z-10"
            style={{ height: 'var(--nav-h)', width: 'auto', opacity: 1, overflow: 'visible' }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <ul role="menubar" className="list-none flex items-stretch m-0 p-1.5 h-full relative" style={{ gap: 'var(--pill-gap)' }}>
              {items.map((item, i) => {
                const isActive = activeHref === item.href;
                const hasDropdown = !!item.dropdownItems;
                const isHovered = hoveredIndex === i;

                const PillContent = (
                  <span className="label-stack relative inline-flex items-center justify-center w-full leading-[1] z-[2]">
                    <span className="pill-label relative z-[2] inline-flex items-center gap-1.5 leading-[1]">
                      {item.isAvatar ? <img src={item.avatarUrl || logo} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-[#001e40]/10" /> : item.label}
                      {hasDropdown && <svg className="w-3.5 h-3.5 opacity-60 mt-[1px] transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>}
                      {isActive && !hasDropdown && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c6a355]" aria-hidden="true" />
                      )}
                    </span>
                  </span>
                );

                const baseClasses = 'relative inline-flex items-center justify-center h-full no-underline rounded-full box-border font-medium text-[14px] font-jakarta whitespace-nowrap cursor-pointer transition-colors focus:outline-none text-[#001e40] px-5';

                return (
                  <li 
                    key={item.label} 
                    role="none" 
                    className="relative flex h-full group"
                    onMouseEnter={(e) => {
                      setHoveredIndex(i);
                      const width = e.currentTarget.getBoundingClientRect().width;
                      setItemWidths(prev => ({ ...prev, [i]: width }));
                    }}
                  >
                    {/* GLIDING PILL INDICATOR (Sole owner of the layoutId for stability) */}
                    {isHovered && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full bg-white z-[1]"
                        transition={springConfig}
                      />
                    )}





                    {isRouterLink(item.href) && !hasDropdown ? (
                      <Link to={item.href} className={baseClasses}>
                        {PillContent}
                      </Link>
                    ) : (
                      <button onClick={item.onClick} className={baseClasses}>
                        {PillContent}
                      </button>
                    )}

                    {/* FLUID DROPDOWN MENU */}
                    <AnimatePresence>
                      {hasDropdown && isHovered && (
                        <div 
                          className="absolute top-[calc(100%+2px)] left-1/2 -translate-x-1/2 w-max min-w-[320px] pt-4 z-[1001]"
                          style={{ '--neck-w': `${itemWidths[i] || 60}px` } as CSSProperties}
                        >

                          <div className="absolute top-0 left-0 w-full h-4 bg-transparent" />
                          
                          {/* DROPDOWN CARD BACKGROUND (Coordinated expansion, no layoutId conflict) */}
                          <motion.div
                            initial={{ scaleY: 0, opacity: 0, originY: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            className="absolute inset-0 top-4 rounded-[24px] bg-white shadow-[0_15px_45px_rgba(0,51,102,0.12)] z-[1]"
                            transition={springConfig}
                          >
                             {/* T-Flow Junction (Unified 'Neck' and Seamless Fillets) */}
                             <div className="absolute -top-[27px] left-1/2 -translate-x-1/2 h-[28px] pointer-events-none" style={{ width: 'calc(var(--neck-w, 60px) - 32px)' }}>
                               {/* Solid Neck Bridge */}
                               <div className="absolute inset-0 bg-white" />
                               
                               {/* Bottom Fillets (Neck -> Card) */}
                               <div 
                                 className="absolute bottom-0 right-full w-3 h-3" 
                                 style={{ background: 'radial-gradient(circle at 0% 0%, transparent 12px, #ffffff 13px)' }} 
                               />
                               <div 
                                 className="absolute bottom-0 left-full w-3 h-3" 
                                 style={{ background: 'radial-gradient(circle at 100% 0%, transparent 12px, #ffffff 13px)' }} 
                               />
                               
                               {/* Top Fillets (Neck -> Pill) */}
                               <div 
                                 className="absolute top-0 right-full w-3 h-3" 
                                 style={{ background: 'radial-gradient(circle at 0% 100%, transparent 12px, #ffffff 13px)' }} 
                               />
                               <div 
                                 className="absolute top-0 left-full w-3 h-3" 
                                 style={{ background: 'radial-gradient(circle at 100% 100%, transparent 12px, #ffffff 13px)' }} 
                               />

                             </div>





                          </motion.div>


                          {/* Dropdown Card Content */}
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 relative z-10 overflow-hidden"
                          >
                            <ul className="flex flex-col">
                              {item.dropdownItems?.map((subItem) => (
                                <li key={subItem.title}>
                                  <Link
                                    to={subItem.href}
                                    onClick={subItem.onClick}
                                    className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[#f6f3f2] transition-colors duration-200"
                                  >
                                    {subItem.icon && (
                                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fbf9f8] flex items-center justify-center text-[#001e40]">
                                        {subItem.icon}
                                      </span>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-[14px] text-[#1b1c1c]">{subItem.title}</span>
                                      <span className="text-[12px] text-[#1b1c1c]/60">{subItem.desc}</span>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MOBILE HAMBURGER */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden ml-auto p-2 text-[#001e40] bg-white/85 rounded-full shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
          </button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
              className="md:hidden absolute top-[4.5em] left-4 right-4 rounded-[16px] shadow-[0_8px_30px_rgba(0,51,102,0.08)] z-[998] origin-top bg-white/95 backdrop-blur-xl p-4"
            >
              <ul className="flex flex-col gap-2">
                {items.map(item => (
                  <div key={item.label}>
                    {isRouterLink(item.href) && !item.dropdownItems ? (
                      <Link to={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 font-semibold text-[#001e40] rounded-[12px] hover:bg-[#f6f3f2]">
                        {item.label}
                      </Link>
                    ) : (
                      <div className="py-3 px-4 font-bold text-[#705d00] border-b border-[#f6f3f2] mb-2">{item.label}</div>
                    )}

                    {item.dropdownItems && (
                      <div className="pl-4 border-l-2 border-[#f6f3f2] ml-4 flex flex-col gap-1">
                        {item.dropdownItems.map(subItem => (
                          <Link key={subItem.title} to={subItem.href} onClick={(_e) => { subItem.onClick?.(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 py-2 text-[#1b1c1c] hover:text-[#001e40]">
                            <span className="w-6 h-6 flex-shrink-0">{subItem.icon}</span>
                            <span className="text-[14px] font-medium">{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};

export default PillNav;