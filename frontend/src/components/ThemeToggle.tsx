import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-full p-2 transition-all duration-200
        bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg-secondary dark:hover:bg-dark-bg-tertiary
        text-gray-700 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary
        border border-gray-200 dark:border-dark-border
        hover:shadow-soft dark:hover:shadow-soft
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className={`${iconSizes[size]} transition-transform duration-200 hover:rotate-12`} />
      ) : (
        <Sun className={`${iconSizes[size]} transition-transform duration-200 hover:rotate-12`} />
      )}
    </button>
  );
};

export default ThemeToggle;
