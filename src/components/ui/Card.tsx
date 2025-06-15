import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glassmorphism?: boolean;
  gradient?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glassmorphism = false,
  gradient,
  onClick,
}) => {
  return (
    <div 
      className={`
        rounded-xl shadow-sm overflow-hidden transition-all duration-300 
        ${glassmorphism 
          ? 'backdrop-blur-md bg-white/10 border border-white/20' 
          : gradient 
            ? '' 
            : 'bg-white'}
        ${onClick ? 'cursor-pointer active:scale-98 hover:shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
      style={
        gradient 
          ? { 
              background: gradient,
              borderRadius: '16px',
            } 
          : {}
      }
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`p-4 pt-0 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`p-4 pt-0 ${className}`}>
      {children}
    </div>
  );
};