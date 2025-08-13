import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search for products...',
  className = '',
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear error when user starts typing
    if (newValue.length > 0) {
      setIsValid(true);
      setErrorMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (value.trim().length < 3) {
      setIsValid(false);
      setErrorMessage('Search query must be at least 3 characters long');
      return;
    }

    onSearch(value.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={`
              w-full px-4 py-3 pl-12 pr-20 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200
              ${
                isValid
                  ? 'border-gray-300 focus:border-transparent'
                  : 'border-red-500 focus:ring-red-500'
              }
            `}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Search
          </button>
        </div>
      </form>

      {!isValid && errorMessage && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {errorMessage}
        </p>
      )}

      {value.length > 0 && value.length < 3 && (
        <p className="mt-2 text-sm text-gray-500">
          Type at least {3 - value.length} more character
          {3 - value.length !== 1 ? 's' : ''} to search
        </p>
      )}
    </div>
  );
};

export default SearchInput;
