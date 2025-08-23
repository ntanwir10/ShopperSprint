import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, RefreshCw, BarChart3, Star, Store, ExternalLink, Eye } from 'lucide-react';
import Header from './Header';
import PriceDisplay from './PriceDisplay';
import SearchFilters from './SearchFilters';
import { type Product } from '../lib/api';
import { type FilterOptions } from './SearchFilters';

interface SearchResultsProps {}

const SearchResults: React.FC<SearchResultsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name' | 'date'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 0 },
    sources: [],
    availability: [],
    rating: null,
    categories: []
  });

  useEffect(() => {
    if (location.state?.query) {
      setQuery(location.state.query);
      performSearch(location.state.query);
    }
  }, [location.state]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock search - in real app this would call the API
      const mockResults: Product[] = Array.from({ length: 12 }, (_, i) => ({
        id: `product-${i + 1}`,
        name: `${searchQuery} Product ${i + 1} - High Quality Item with Great Features`,
        price: Math.floor(Math.random() * 1000) + 100,
        currency: 'USD',
        availability: ['in_stock', 'limited', 'out_of_stock'][Math.floor(Math.random() * 3)] as any,
        source: `Source ${['Amazon', 'Best Buy', 'Walmart', 'Target'][Math.floor(Math.random() * 4)]}`,
        imageUrl: `https://via.placeholder.com/300x200?text=Product+${i + 1}`,
        rating: Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 4 : undefined,
        reviewCount: Math.random() > 0.3 ? Math.floor(Math.random() * 100) + 10 : undefined,
        url: `https://example.com/product-${i + 1}`,
        lastScraped: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setResults(mockResults);
    } catch (err) {
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'text-success-600 bg-success-50 border-success-200 dark:text-success-400 dark:bg-success-900/20 dark:border-success-800';
      case 'out_of_stock':
        return 'text-error-600 bg-error-50 border-error-200 dark:text-error-400 dark:bg-error-900/20 dark:border-error-800';
      case 'limited':
        return 'text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-400 dark:bg-warning-900/20 dark:border-warning-800';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-dark-text-tertiary dark:bg-dark-bg-tertiary dark:border-dark-border';
    }
  };

  const getSourceDisplayName = (source: string) => {
    if (source.startsWith('Source ')) {
      return source.replace('Source ', '');
    }
    return source;
  };

  const handleProductSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleCompare = () => {
    if (selectedProducts.size < 2) return;
    
    const selectedProductsList = results.filter(p => selectedProducts.has(p.id));
    navigate('/compare', { state: { products: selectedProductsList } });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // In a real app, this would trigger a new search with filters
  };

  const getFilteredAndSortedResults = () => {
    let filtered = [...results];

    // Apply filters
    if (filters.priceRange.min > 0) {
      filtered = filtered.filter(p => p.price >= filters.priceRange.min);
    }
    if (filters.priceRange.max > 0) {
      filtered = filtered.filter(p => p.price <= filters.priceRange.max);
    }
    if (filters.sources.length > 0) {
      filtered = filtered.filter(p => filters.sources.includes(p.source));
    }
    if (filters.availability.length > 0) {
      filtered = filtered.filter(p => filters.availability.includes(p.availability));
    }
    if (filters.rating !== null) {
      filtered = filtered.filter(p => p.rating && p.rating >= filters.rating!);
    }
    if (filters.categories.length > 0) {
      // Mock category filtering - in real app this would use actual product categories
      filtered = filtered.filter(p => 
        filters.categories.some(cat => p.name.toLowerCase().includes(cat.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.lastScraped).getTime();
          bValue = new Date(b.lastScraped).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredResults = getFilteredAndSortedResults();
  const availableSources = Array.from(new Set(results.map(p => p.source)));
  const availableCategories = ['Electronics', 'Gaming', 'Fashion', 'Home & Garden', 'Sports', 'Books'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-secondary transition-colors duration-200">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-dark-bg-secondary shadow-soft border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors duration-200"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  Search Results
                </h1>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  {loading ? 'Searching...' : `${filteredResults.length} products found`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-dark-border rounded-xl text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {Object.values(filters).some(f => 
                  Array.isArray(f) ? f.length > 0 : f !== null && f !== 0
                ) && (
                  <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors duration-200"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-dark-bg-secondary text-primary-600 dark:text-primary-400 shadow-soft'
                      : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-dark-bg-secondary text-primary-600 dark:text-primary-400 shadow-soft'
                      : 'text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => performSearch(query)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {selectedProducts.size > 0 && (
              <button
                onClick={handleCompare}
                disabled={selectedProducts.size < 2}
                className="flex items-center space-x-2 px-4 py-2 bg-success-600 dark:bg-success-500 text-white rounded-xl hover:bg-success-700 dark:hover:bg-success-600 transition-colors duration-200 disabled:opacity-50"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Compare ({selectedProducts.size})</span>
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Showing {filteredResults.length} of {results.length} results
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              Searching for products...
            </h3>
            <p className="text-gray-500 dark:text-dark-text-tertiary">
              This may take a few moments
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-error-800 dark:text-error-200 mb-2">
                Search Error
              </h3>
              <p className="text-sm text-error-700 dark:text-error-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-200 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400 dark:text-dark-text-tertiary" />
              </div>
              <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-2">
                No products found
              </p>
              <p className="text-gray-500 dark:text-dark-text-tertiary">
                Try a different search term
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResults.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-medium hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100 dark:bg-dark-bg-tertiary">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Compare Checkbox */}
                      <button
                        onClick={() => handleProductSelect(product.id)}
                        className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                          selectedProducts.has(product.id)
                            ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500 text-white'
                            : 'bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        {selectedProducts.has(product.id) && (
                          <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="mb-3">
                        <PriceDisplay
                          price={product.price}
                          currency={product.currency}
                          className="text-xl font-bold text-gray-900 dark:text-dark-text-primary"
                        />
                      </div>

                      {/* Source and Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Store className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary" />
                          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                            {getSourceDisplayName(product.source)}
                          </span>
                        </div>
                        {product.rating ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                              {product.rating}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-dark-text-tertiary">No rating</span>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="mb-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                          product.availability
                        )}`}>
                          {product.availability.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                          className="flex-1 bg-primary-600 dark:bg-primary-500 text-white text-center py-2 px-3 rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary rounded-xl hover:bg-gray-200 dark:hover:bg-dark-bg-secondary transition-colors duration-200 flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-soft border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                    <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                          Availability
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-bg-secondary divide-y divide-gray-200 dark:divide-dark-border">
                      {filteredResults.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() => handleProductSelect(product.id)}
                                className="rounded border-gray-300 dark:border-dark-border text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400"
                              />
                              <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
                                <img
                                  src={product.imageUrl || 'https://via.placeholder.com/64x64?text=No+Image'}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                                  {product.name}
                                </h3>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <PriceDisplay
                              price={product.price}
                              currency={product.currency}
                              className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Store className="h-4 w-4 text-gray-400 dark:text-dark-text-tertiary" />
                              <span className="text-sm text-gray-900 dark:text-dark-text-primary">
                                {getSourceDisplayName(product.source)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {product.rating ? (
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                                  {product.rating}
                                </span>
                                {product.reviewCount && (
                                  <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                                    ({product.reviewCount})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-dark-text-tertiary">No rating</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                              product.availability
                            )}`}>
                              {product.availability.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-150"
                              >
                                View
                              </button>
                              <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary text-sm font-medium transition-colors duration-150"
                              >
                                External
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Filters Panel */}
      <SearchFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableSources={availableSources}
        availableCategories={availableCategories}
      />
    </div>
  );
};

export default SearchResults;
