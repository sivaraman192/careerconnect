import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} border-slate-800 border-t-brandIndigo rounded-full animate-spin`}></div>
      <span className="text-slate-400 text-sm animate-pulse tracking-wide font-medium">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
