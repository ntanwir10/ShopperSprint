import { useState, useEffect } from 'react';

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  popularity?: number;
  type?: 'suggestion' | 'history' | 'trending';
}

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Mock suggestions for now - replace with actual API call
    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', text: `${query} laptop`, category: 'Electronics', type: 'suggestion' as const },
      { id: '2', text: `${query} phone`, category: 'Electronics', type: 'suggestion' as const },
      { id: '3', text: `${query} headphones`, category: 'Audio', type: 'suggestion' as const },
      { id: '4', text: `${query} tablet`, category: 'Electronics', type: 'suggestion' as const },
      { id: '5', text: `${query} accessories`, category: 'General', type: 'suggestion' as const },
    ].filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate API delay
    const timer = setTimeout(() => {
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const updateSuggestions = (newSuggestions: SearchSuggestion[]) => {
    setSuggestions(newSuggestions);
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  const addToHistory = (suggestion: SearchSuggestion) => {
    // Mock implementation - in real app, this would save to localStorage or API
    console.log('Adding to history:', suggestion);
  };

  return { 
    suggestions, 
    isLoading, 
    updateSuggestions, 
    clearSuggestions, 
    addToHistory 
  };
}
