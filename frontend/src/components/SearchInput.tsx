import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock suggestions - in a real app, these would come from an API
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    if (query.length < 2) return [];

    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', text: `${query} laptop`, type: 'category' },
      { id: '2', text: `${query} smartphone`, type: 'category' },
      { id: '3', text: `${query} headphones`, type: 'category' },
      { id: '4', text: `${query} gaming`, type: 'popular' },
      { id: '5', text: `${query} wireless`, type: 'popular' },
    ];

    return mockSuggestions.slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear error when user starts typing
    if (newValue.length > 0) {
      setIsValid(true);
      setErrorMessage('');
    }

    // Generate and show suggestions
    if (newValue.length >= 2) {
      const newSuggestions = generateSuggestions(newValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
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
    setSuggestions([]);
    console.log('🚀 Search triggered for:', value.trim());
    onSearch(value.trim());
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

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between
                ${
                  index === selectedSuggestionIndex
                    ? 'bg-primary-50 border-l-4 border-l-primary-500'
                    : ''
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{suggestion.text}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`
                  px-2 py-1 text-xs rounded-full
                  ${
                    suggestion.type === 'recent'
                      ? 'bg-blue-100 text-blue-800'
                      : ''
                  }
                  ${
                    suggestion.type === 'popular'
                      ? 'bg-green-100 text-green-800'
                      : ''
                  }
                  ${
                    suggestion.type === 'category'
                      ? 'bg-purple-100 text-purple-800'
                      : ''
                  }
                `}
                >
                  {suggestion.type}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

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
