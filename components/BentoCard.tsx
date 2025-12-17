import React from 'react';

interface BentoCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  action,
  noPadding = false
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-start px-6 pt-6 mb-2">
          <div>
            {title && <h3 className="text-sm font-medium text-gray-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-normal">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};