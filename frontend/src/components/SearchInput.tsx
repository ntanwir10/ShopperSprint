import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Mic, X } from 'lucide-react';
import { useSearchSuggestions, SearchSuggestion } from '../hooks/useSearchSuggestions';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  suggestions?: SearchSuggestion[];
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search for products...',
  className = '',
  showSuggestions: externalShowSuggestions = true,
  suggestions: externalSuggestions = [],
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Use search suggestions hook
  const { suggestions, updateSuggestions, clearSuggestions, addToHistory } = useSearchSuggestions(value);

  // Use external suggestions if provided, otherwise use hook suggestions
  const currentSuggestions = externalSuggestions.length > 0 ? externalSuggestions : suggestions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear error when user starts typing
    if (newValue.length > 0) {
      setIsValid(true);
      setErrorMessage('');
    }

    // Update suggestions using the hook (hook automatically updates based on value)
    if (newValue.length >= 2) {
      setShowSuggestions(externalShowSuggestions);
      setSelectedSuggestionIndex(-1);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < currentSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(currentSuggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e as any);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (value.trim().length < 3) {
      setIsValid(false);
      setErrorMessage('Search query must be at least 3 characters long');
      return;
    }

    setShowSuggestions(false);
    clearSuggestions();
    // Add to search history
    addToHistory({ 
      id: Date.now().toString(), 
      text: value.trim(), 
      type: 'history' 
    });
    console.log('🚀 Search triggered for:', value.trim());
    onSearch(value.trim());
  };

  const clearInput = () => {
    onChange('');
    setShowSuggestions(false);
    clearSuggestions();
    setIsValid(true);
    setErrorMessage('');
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full px-6 py-4 pl-14 pr-24 text-lg border-2 rounded-2xl 
              focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 
              transition-all duration-200 bg-white dark:bg-dark-bg-secondary
              text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary
              ${
                isValid
                  ? 'border-gray-300 dark:border-dark-border focus:border-primary-500'
                  : 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
              }
            `}
          />
          
          {/* Search Icon */}
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-dark-text-tertiary" />
          
          {/* Voice Search Icon (Future Feature) */}
          <button
            type="button"
            className="absolute right-20 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors duration-200"
            aria-label="Voice search (coming soon)"
          >
            <Mic className="h-5 w-5" />
          </button>
          
          {/* Clear Button */}
          {value.length > 0 && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          {/* Search Button */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-soft hover:shadow-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-2xl shadow-strong max-h-60 overflow-y-auto"
        >
          {currentSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary 
                transition-colors duration-150 flex items-center justify-between
                ${
                  index === selectedSuggestionIndex
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                    : ''
                }
                ${index === 0 ? 'rounded-t-2xl' : ''}
                ${index === currentSuggestions.length - 1 ? 'rounded-b-2xl' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <Search className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary" />
                <span className="text-gray-900 dark:text-dark-text-primary">{suggestion.text}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`
                  px-2 py-1 text-xs rounded-full font-medium
                  ${
                    suggestion.type === 'history'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : ''
                  }
                  ${
                    suggestion.type === 'trending'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : ''
                  }
                  ${
                    suggestion.type === 'suggestion'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : ''
                  }
                `}
                >
                  {suggestion.type}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {!isValid && errorMessage && (
        <p className="mt-3 text-sm text-error-600 dark:text-error-400 flex items-center animate-fade-in">
          <span className="mr-2">⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Character Count */}
      {value.length > 0 && value.length < 3 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-dark-text-tertiary animate-fade-in">
          Type at least {3 - value.length} more character
          {3 - value.length !== 1 ? 's' : ''} to search
        </p>
      )}
    </div>
  );
};

export default SearchInput;
