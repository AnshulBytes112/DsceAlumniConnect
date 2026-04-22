import { Button } from "./Button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionHref,
  icon
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/40 backdrop-blur-md border border-dsce-blue/10 rounded-3xl shadow-lg">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-dsce-gold/20 blur-3xl rounded-full"></div>
        {icon ? (
          <div className="relative text-dsce-blue/30">{icon}</div>
        ) : (
          <img 
            src="/empty_state_community_1776093735488.png" 
            alt="Empty State" 
            className="relative h-48 w-auto object-contain"
          />
        )}
      </div>
      <h3 className="text-2xl font-bold text-dsce-text-dark mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-8">{description}</p>
      {actionLabel && actionHref && (
        <Link to={actionHref}>
          <Button className="rounded-full bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover font-semibold px-8 shadow-md">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
};
