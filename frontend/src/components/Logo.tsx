import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textClassName?: string;
  to?: string; // destination when clicked, defaults to /dashboard
}

const sizeMap = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
} as const;

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', showText = false, textClassName, to = '/dashboard' }) => {
  return (
    <Link
      to={to}
      aria-label="Go to Dashboard"
      className={cn('flex items-center gap-2 hover:opacity-95 active:opacity-90 transition-opacity', className)}
    >
      <img
        src="/logo.svg"
        alt="TRAVVEL"
        className={cn(sizeMap[size], 'w-auto cursor-pointer')}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = 'https://via.placeholder.com/48';
        }}
      />
      {showText && (
        <span className={cn('font-extrabold tracking-wide cursor-pointer text-sidebar-primary', textClassName)}>
          TRAVVEL
        </span>
      )}
    </Link>
  );
};

export default Logo;
