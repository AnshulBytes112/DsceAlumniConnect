import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TabItem {
  title?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  type?: 'separator';
}

interface MobileNavbarProps {
  tabs: TabItem[];
  activeTabIndex: number;
}

export function MobileNavbar({ tabs, activeTabIndex }: MobileNavbarProps) {
  const navigate = useNavigate();
  
  // Filter out separators for mobile view
  const navItems = tabs.filter(tab => tab.type !== 'separator');

  const handleTabClick = (tab: TabItem) => {
    if (tab.onClick) {
      tab.onClick();
    } else if (tab.href) {
      navigate(tab.href);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="flex items-center justify-around bg-white/90 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl p-2">
        {navItems.map((tab, index) => {
          const Icon = tab.icon!;
          // We need to find the original index to match activeTabIndex because we filtered separators
          const originalIndex = tabs.indexOf(tab);
          const isActive = activeTabIndex === originalIndex;

          return (
            <button
              key={index}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300",
                isActive ? "text-dsce-blue" : "text-gray-400 hover:text-dsce-blue/70"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-dsce-gold/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={24} className={cn("relative z-10", isActive && "stroke-[2.5px]")} />
              {/* Optional: Show label for active item or all items if space permits */}
              {/* <span className="text-[10px] font-medium mt-1">{tab.title}</span> */}
            </button>
          );
        })}
      </div>
    </div>
  );
}
