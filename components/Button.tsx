import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // Attio-style: precise, 4px radius, font-medium but not bold
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight";
  
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 shadow-sm border border-transparent",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-transparent",
    outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent",
    danger: "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};