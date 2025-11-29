import { type HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        {(title || action) && (
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            {action && <div>{action}</div>}
          </div>
        )}
        <div className="text-brand-accent-light">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
