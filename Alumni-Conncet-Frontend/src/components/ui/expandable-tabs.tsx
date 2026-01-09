"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { Transition } from "framer-motion";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: "0rem",
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : "0rem",
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition: Transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-dsce-gold-hover",
  onChange,
  activeTabIndex,
}: ExpandableTabsProps & { activeTabIndex?: number | null }) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef(null);

  useOnClickOutside(outsideClickRef, () => {
    // Only clear local selection if not controlled
    if (activeTabIndex === undefined) {
      setSelected(null);
      onChange?.(null);
    }
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        // Determine if this tab is active (either locally selected, controlled active, or hovered)
        const isHovered = hovered === index;
        const isAnyHovered = hovered !== null;
        const isSelected = selected === index || (activeTabIndex === index && !isAnyHovered);
        const isExpanded = isSelected || isHovered;

        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isExpanded}
            onClick={() => handleSelect(index)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
              isExpanded  
                ? cn("bg-muted", activeColor)
                : "text-muted-foreground hover:bg-muted hover:text-dsce-gold-hover"
            )}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
