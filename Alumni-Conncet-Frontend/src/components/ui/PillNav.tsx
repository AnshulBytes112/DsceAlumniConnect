import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

interface NavItem {
  label: string;
  href: string;
  ariaLabel?: string;
  onClick?: () => void;
  hoverColor?: string;
}

interface PillNavProps {
  logo: string;
  logoAlt?: string;
  avatar?: string;
  items: NavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  avatar,
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}: PillNavProps) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      hoverRefs.current.forEach((hoverEl, index) => {
        if (!hoverEl?.parentElement) return;

        const pill = hoverEl.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        // Reset styles for calculation
        hoverEl.style.width = `${w}px`;
        hoverEl.style.height = `${h}px`;
        hoverEl.style.top = '0px';
        hoverEl.style.left = '0px';
        
        gsap.set(hoverEl, {
          scaleX: 0.8,
          scaleY: 0,
          opacity: 0,
          transformOrigin: 'center bottom'
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        // Animate the background rectangle
        tl.to(hoverEl, { 
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: 0.4, 
          ease, 
          overwrite: 'auto' 
        }, 0);

        if (label) {
          tl.to(label, { y: -h/2, opacity: 0, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: h/2, opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  useEffect(() => {
    const navItems = navItemsRef.current;
    if (!navItems) return;

    if (isExpanded) {
      gsap.to(navItems, {
        width: 'auto',
        opacity: 1,
        duration: 0.4,
        ease,
        overwrite: 'auto'
      });
    } else {
      gsap.to(navItems, {
        width: 0,
        opacity: 0,
        duration: 0.4,
        ease,
        overwrite: 'auto'
      });
    }
  }, [isExpanded, ease]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const menu = mobileMenuRef.current;

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: -10, scaleY: 0.95 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          scaleY: 0.95,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = (href: string) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = (href: string) => href && !isExternalLink(href);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      toggleMobileMenu();
    }
  };

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor,
    '--nav-h': '44px', // Slightly taller
    '--logo': '36px',
    '--pill-pad-x': '18px', // More padding
    '--pill-gap': '4px'
  } as CSSProperties;

  return (
    <div className="absolute top-4 z-[1000] w-full left-0 md:w-auto md:left-auto px-4 md:px-6">
      <nav
        className={`w-full md:w-max flex items-center justify-between md:justify-start box-border ${className}`}
        aria-label="Primary"
        style={cssVars}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {isRouterLink(items?.[0]?.href) ? (
          <Link
            to={items[0].href}
            aria-label="Home"
            onClick={handleLogoClick}
            onMouseEnter={() => {
              handleLogoEnter();
              setIsExpanded(true);
            }}
            role="menuitem"
            ref={(el) => {
              if (el) logoRef.current = el;
            }}
            className="rounded-2xl p-2 inline-flex items-center justify-center overflow-hidden shadow-sm border border-white/10 backdrop-blur-sm transition-transform hover:scale-105"
            style={{
              width: 'var(--nav-h)',
              height: 'var(--nav-h)',
              background: 'var(--base, #000)'
            }}
          >
            <img src={avatar || logo} alt={logoAlt} ref={logoImgRef} className="w-full h-full object-cover block rounded-xl" />
          </Link>
        ) : (
          <a
            href={items?.[0]?.href || '#'}
            aria-label="Home"
            onClick={handleLogoClick}
            onMouseEnter={() => {
              handleLogoEnter();
              setIsExpanded(true);
            }}
            ref={(el) => {
              if (el) logoRef.current = el;
            }}
            className="rounded-2xl p-2 inline-flex items-center justify-center overflow-hidden shadow-sm border border-white/10 backdrop-blur-sm transition-transform hover:scale-105"
            style={{
              width: 'var(--nav-h)',
              height: 'var(--nav-h)',
              background: 'var(--base, #000)'
            }}
          >
            <img src={avatar || logo} alt={logoAlt} ref={logoImgRef} className="w-full h-full object-cover block rounded-xl" />
          </a>
        )}

        <div
          ref={navItemsRef}
          className="relative items-center rounded-2xl hidden md:flex ml-3 overflow-hidden shadow-sm border border-white/10 backdrop-blur-md"
          style={{
            height: 'var(--nav-h)',
            background: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
            width: 0, // Start hidden
            opacity: 0
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-1 h-full"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              const pillStyle: CSSProperties = {
                background: 'transparent',
                color: 'var(--pill-text, #fff)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              };

              const PillContent = (
                <>
                  <span
                    className="hover-rect absolute left-0 top-0 w-full h-full rounded-xl z-[1] block pointer-events-none"
                    style={{
                      background: item.hoverColor || '#fff',
                      willChange: 'transform, opacity'
                    }}
                    aria-hidden="true"
                    ref={(el) => {
                      hoverRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-[1] z-[2]">
                    <span
                      className="pill-label relative z-[2] inline-block leading-[1]"
                      style={{ willChange: 'transform' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                      style={{
                        color: 'var(--hover-text, #000)',
                        willChange: 'transform, opacity'
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-[4px] -translate-x-1/2 w-8 h-[2px] rounded-full z-[4]"
                      style={{ background: 'currentColor' }}
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              const basePillClasses =
                'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-xl box-border font-medium text-[14px] leading-[0] tracking-[0.2px] whitespace-nowrap cursor-pointer px-0 transition-colors';

              return (
                <li key={item.href} role="none" className="flex h-full">
                  {item.onClick ? (
                    <button
                      role="menuitem"
                      onClick={(e) => {
                        item.onClick?.();
                        handleLogoClick(e);
                      }}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </button>
                  ) : isRouterLink(item.href) ? (
                    <Link
                      role="menuitem"
                      to={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[4em] left-4 right-4 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md z-[998] origin-top overflow-hidden"
        style={{
          ...cssVars,
          background: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <ul className="list-none m-0 p-2 flex flex-col gap-1">
          {items.map(item => {
            const defaultStyle: CSSProperties = {
              background: 'transparent',
              color: '#000'
            };
            const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            };
            const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = 'transparent';
            };

            const linkClasses =
              'block py-3 px-4 text-[15px] font-medium rounded-xl transition-all duration-200';

            return (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    to={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
