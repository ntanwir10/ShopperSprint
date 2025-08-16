import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
  showSuggestions?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search for products...',
  className = '',
  size = 'default',
  showSuggestions = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions - in a real app, these would come from an API
  const suggestions = [
    'iPhone 15 Pro',
    'MacBook Pro M3',
    'Sony WH-1000XM5',
    'Nintendo Switch',
    'Samsung Galaxy S24',
    'iPad Air',
    'AirPods Pro',
    'PlayStation 5',
  ];

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    setShowClearButton(value.length > 0);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
  };

  const isLarge = size === 'large';
  const inputHeight = isLarge ? 'h-14' : 'h-10';
  const textSize = isLarge ? 'text-lg' : 'text-base';

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={`pl-10 pr-20 ${inputHeight} ${textSize} bg-input-background border-border focus:ring-2 focus:ring-ring focus:border-transparent`}
          />

          {/* Clear Button */}
          {showClearButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted dark:hover:bg-muted/80 hover:scale-105 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${inputHeight} px-6`}
            disabled={!value.trim()}
          >
            Search
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions &&
        isFocused &&
        value.length > 0 &&
        filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 dark:hover:bg-muted/30 hover:text-foreground transition-all duration-200 flex items-center gap-3"
              >
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

export default SearchInput;
