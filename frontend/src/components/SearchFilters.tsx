import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, DollarSign, Star, Store, Package } from 'lucide-react';

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  sources: string[];
  availability: string[];
  rating: number | null;
  categories: string[];
}

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableSources: string[];
  availableCategories: string[];
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableSources,
  availableCategories,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    sources: true,
    availability: true,
    rating: true,
    categories: true
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const newPriceRange = { ...localFilters.priceRange, [type]: numValue };
    handleFilterChange('priceRange', newPriceRange);
  };

  const handleSourceToggle = (source: string) => {
    const newSources = localFilters.sources.includes(source)
      ? localFilters.sources.filter(s => s !== source)
      : [...localFilters.sources, source];
    handleFilterChange('sources', newSources);
  };

  const handleAvailabilityToggle = (availability: string) => {
    const newAvailability = localFilters.availability.includes(availability)
      ? localFilters.availability.filter(a => a !== availability)
      : [...localFilters.availability, availability];
    handleFilterChange('availability', newAvailability);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    handleFilterChange('categories', newCategories);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      priceRange: { min: 0, max: 0 },
      sources: [],
      availability: [],
      rating: null,
      categories: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.priceRange.min > 0 || localFilters.priceRange.max > 0) count++;
    if (localFilters.sources.length > 0) count++;
    if (localFilters.availability.length > 0) count++;
    if (localFilters.rating !== null) count++;
    if (localFilters.categories.length > 0) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Filters Panel */}
      <div className={`relative bg-white dark:bg-dark-bg-secondary shadow-strong border-l border-gray-200 dark:border-dark-border w-full max-w-sm h-full overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                Filters
              </h2>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-dark-text-tertiary hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full px-3 py-2 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors duration-200"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="p-4 space-y-6">
          {/* Price Range Filter */}
          <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">Price Range</span>
              </div>
              {expandedSections.price ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              )}
            </button>
            
            {expandedSections.price && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-dark-text-tertiary mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={localFilters.priceRange.min || ''}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-dark-text-tertiary mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={localFilters.priceRange.max || ''}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                  Leave empty for no limit
                </div>
              </div>
            )}
          </div>

          {/* Sources Filter */}
          <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
            <button
              onClick={() => toggleSection('sources')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">Sources</span>
                {localFilters.sources.length > 0 && (
                  <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    {localFilters.sources.length}
                  </span>
                )}
              </div>
              {expandedSections.sources ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              )}
            </button>
            
            {expandedSections.sources && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableSources.map((source) => (
                  <label key={source} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.sources.includes(source)}
                      onChange={() => handleSourceToggle(source)}
                      className="rounded border-gray-300 dark:border-dark-border text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                      {source.replace('Source ', '')}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Availability Filter */}
          <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
            <button
              onClick={() => toggleSection('availability')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">Availability</span>
                {localFilters.availability.length > 0 && (
                  <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    {localFilters.availability.length}
                  </span>
                )}
              </div>
              {expandedSections.availability ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              )}
            </button>
            
            {expandedSections.availability && (
              <div className="space-y-2">
                {[
                  { value: 'in_stock', label: 'In Stock', color: 'text-success-600 dark:text-success-400' },
                  { value: 'limited', label: 'Limited Stock', color: 'text-warning-600 dark:text-warning-400' },
                  { value: 'out_of_stock', label: 'Out of Stock', color: 'text-error-600 dark:text-error-400' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.availability.includes(option.value)}
                      onChange={() => handleAvailabilityToggle(option.value)}
                      className="rounded border-gray-300 dark:border-dark-border text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className={`text-sm ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
            <button
              onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">Minimum Rating</span>
                {localFilters.rating !== null && (
                  <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    {localFilters.rating}+
                  </span>
                )}
              </div>
              {expandedSections.rating ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              )}
            </button>
            
            {expandedSections.rating && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', localFilters.rating === rating ? null : rating)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors duration-200 ${
                        localFilters.rating === rating
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg-secondary text-gray-700 dark:text-dark-text-secondary hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{rating}+</span>
                    </button>
                  ))}
                </div>
                {localFilters.rating !== null && (
                  <button
                    onClick={() => handleFilterChange('rating', null)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Clear rating filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">Categories</span>
                {localFilters.categories.length > 0 && (
                  <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    {localFilters.categories.length}
                  </span>
                )}
              </div>
              {expandedSections.categories ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-dark-text-tertiary" />
              )}
            </button>
            
            {expandedSections.categories && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableCategories.map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded border-gray-300 dark:border-dark-border text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
