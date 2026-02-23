
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}
export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}
export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[]; // Kept for API compatibility
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  currentPage?: string;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = '/src/assets/logos/reactbits-gh-white.svg',
  menuButtonColor = '#000',
  openMenuButtonColor = '#000',
  changeMenuColorOnOpen = true,
  accentColor = '#5227FF',
  isFixed = false,
  onMenuOpen,
  onMenuClose,
  currentPage
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLElement | null>(null);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const textWrapRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close']);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !icon || !textInner) return;

      // Initial state: hidden, scaled down slightly, and moved up
      gsap.set(panel, { 
        autoAlpha: 0, 
        y: -20, 
        scale: 0.95,
        transformOrigin: position === 'right' ? 'top right' : 'top left'
      });

      if (!currentPage) {
        const plusH = plusHRef.current;
        const plusV = plusVRef.current;
        if (plusH && plusV) {
          gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
          gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
        }
      }
      
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position, currentPage]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
    ) as HTMLElement[];
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];

    // Reset elements for animation
    if (itemEls.length) gsap.set(itemEls, { yPercent: 100, rotate: 3 });
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 10, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    // Card entrance
    gsap.set(panel, { 
      clipPath: 'inset(0 0 100% 0)', 
      autoAlpha: 1, 
      y: 0, 
      scale: 1 
    });

    tl.to(panel, { 
      clipPath: 'inset(0 0 0% 0)',
      duration: 1.2, 
      ease: 'power4.out' 
    });

    const contentStart = 0.4;

    if (itemEls.length) {
      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 0.8, ease: 'power3.out', stagger: { each: 0.08, from: 'start' } },
        contentStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: 'power2.out', ['--sm-num-opacity' as any]: 1, stagger: { each: 0.08, from: 'start' } },
          contentStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = contentStart + 0.4;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.6, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: { each: 0.05, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.05
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    if (!panel) return;

    closeTweenRef.current?.kill();

    closeTweenRef.current = gsap.to(panel, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.8,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        gsap.set(panel, { autoAlpha: 0 });
        busyRef.current = false;
      }
    });
  }, []);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;

    spinTweenRef.current?.kill();

    if (currentPage) {
       // Rotate chevron 180 degrees when opening
       gsap.to(icon, { rotate: opening ? 180 : 0, duration: 0.5, ease: 'power4.out' });
       return;
    }

    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!h || !v) return;

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, [currentPage]);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    if (currentPage) return; // No text animation if currentPage is set

    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;

    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, [currentPage]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  return (
    <div className={`sm-scope ${isFixed ? 'fixed top-0 left-0 w-full' : 'relative w-full'} z-50 ${className || ''}`}>
      <header
            className={`staggered-menu-header relative w-full flex items-center ${position === 'left' ? 'justify-start gap-0' : 'justify-between'} p-[2em] bg-transparent pointer-events-none z-20`}
            aria-label="Main navigation header"
          >
            <div 
              className="sm-logo flex items-center select-none pointer-events-auto cursor-pointer" 
              aria-label="Toggle menu via Logo"
              role="button"
              tabIndex={0}
              onClick={toggleMenu}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleMenu();
                }
              }}
            >
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="sm-logo-img block h-8 w-auto object-contain"
                  draggable={false}
                  width={110}
                  height={24}
                />
              )}
            </div>

            <div className="relative pointer-events-auto">
              {!logoUrl && (
                <button
                  ref={toggleBtnRef}
                  className={`sm-toggle relative inline-flex items-center gap-0 bg-brand-accent-light/10 hover:bg-brand-accent-light/20 border border-brand-accent/60 cursor-pointer font-medium leading-none overflow-visible rounded-xl px-4 py-2 transition-all duration-300 ${
                    open ? 'text-white bg-white/10' : 'text-[#e9e9ef]'
                  }`}
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  aria-expanded={open}
                  aria-controls="staggered-menu-panel"
                  onClick={toggleMenu}
                  type="button"
                >
                  <span
                    ref={textWrapRef}
                    className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap w-[var(--sm-toggle-width,auto)] min-w-[var(--sm-toggle-width,auto)]"
                    aria-hidden="true"
                  >
                    <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col leading-none">
                      {currentPage ? (
                        <span className="sm-toggle-line block h-[1em] leading-none">
                          {currentPage}
                        </span>
                      ) : (
                        textLines.map((l, i) => (
                          <span className="sm-toggle-line block h-[1em] leading-none" key={i}>
                            {l}
                          </span>
                        ))
                      )}
                    </span>
                  </span>

                  <span
                    ref={iconRef}
                    className="sm-icon relative w-[14px] h-[14px] shrink-0 inline-flex items-center justify-center [will-change:transform]"
                    aria-hidden="true"
                  >
                    {currentPage ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    ) : (
                      <>
                        <span
                          ref={plusHRef}
                          className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
                        />
                        <span
                          ref={plusVRef}
                          className="sm-icon-line sm-icon-line-v absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
                        />
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>
          </header>

          <aside
            id="staggered-menu-panel"
            ref={panelRef}
            className={`staggered-menu-panel absolute top-full ${position === 'right' ? 'right-[2em]' : 'left-[2em]'} mt-[-15px] w-80 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-col p-[2em] overflow-hidden z-50 invisible`}
            aria-hidden={!open}
            style={{
              ['--sm-accent' as any]: accentColor
            }}
          >
            <div className="sm-panel-inner flex-1 flex flex-col gap-4">
              <ul
                className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
                role="list"
                data-numbering={displayItemNumbering || undefined}
              >
                {items && items.length ? (
                  items.map((it, idx) => (
                    <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                      <Link
                        className="sm-panel-item relative text-white font-medium text-2xl cursor-pointer leading-tight tracking-tight uppercase transition-[color] duration-200 ease-out inline-flex items-center gap-3 no-underline py-1 hover:text-[var(--sm-accent,#ff0000)]"
                        to={it.link}
                        aria-label={it.ariaLabel}
                        data-index={idx + 1}
                        onClick={(e) => {
                          it.onClick?.();
                          toggleMenu();
                          if (it.link.startsWith('#')) {
                            e.preventDefault();
                            const id = it.link.substring(1);
                            const element = document.getElementById(id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }}
                      >
                        {it.icon && (
                          <span className="sm-panel-icon inline-flex items-center justify-center text-[0.8em] opacity-70">
                            {it.icon}
                          </span>
                        )}
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                          {it.label}
                        </span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                    <span className="sm-panel-item relative text-white/50 font-medium text-xl cursor-pointer leading-tight tracking-tight uppercase inline-block no-underline">
                      <span className="sm-panel-itemLabel inline-block">
                        No items
                      </span>
                    </span>
                  </li>
                )}
              </ul>

              {displaySocials && socialItems && socialItems.length > 0 && (
                <div className="sm-socials mt-4 pt-4 border-t border-white/10 flex flex-col gap-2" aria-label="Social links">
                  <h3 className="sm-socials-title m-0 text-xs font-medium text-white/60 uppercase tracking-widest">Socials</h3>
                  <ul
                    className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap"
                    role="list"
                  >
                    {socialItems.map((s, i) => (
                      <li key={s.label + i} className="sm-socials-item">
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm-socials-link text-sm font-medium text-white/80 no-underline relative inline-block py-[2px] transition-[color,opacity] duration-300 ease-linear hover:text-[var(--sm-accent,#ff0000)]"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>


      <style>{`
.sm-scope .sm-toggle:focus-visible { outline: 2px solid #ffffffaa; outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.5em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; width: var(--sm-toggle-width, auto); min-width: var(--sm-toggle-width, auto); }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.3em; right: -1.5em; font-size: 0.4em; font-weight: 400; color: var(--sm-accent, #ff0000); letter-spacing: 0; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
