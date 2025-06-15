import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  glassmorphism?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  fullWidth = true,
  glassmorphism = false,
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          px-3 py-2 bg-white border border-gray-300 placeholder-gray-400 
          focus:outline-none focus:border-blue-500 focus:ring-blue-500 block ${widthClass} 
          rounded-lg sm:text-sm focus:ring-1 ${error ? 'border-red-500' : ''}
          ${glassmorphism ? 'bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60' : ''}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};