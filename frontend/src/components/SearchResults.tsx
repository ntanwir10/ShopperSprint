import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Star,
  ExternalLink,
  CheckSquare,
  Square,
  AlertCircle,
  Filter,
  Grid,
  List,
  Clock,
  Store,
  Search,
} from 'lucide-react';
import SearchInput from './SearchInput';
import PriceDisplay from './PriceDisplay';
import { apiClient, type Product } from '../lib/api';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    'price-asc' | 'price-desc' | 'rating' | 'source' | 'relevance'
  >('price-asc');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Prevent duplicate API calls
  const searchInProgress = useRef(false);
  const lastSearchQuery = useRef<string>('');

  useEffect(() => {
    if (location.state?.query) {
      setSearchQuery(location.state.query);
      performSearch(location.state.query);
    }

    // Check URL params for selected products
    const selected = searchParams.get('compare');
    if (selected) {
      const productIds = selected.split(',').filter(Boolean);
      setSelectedProducts(new Set(productIds));
    }
  }, [location.state, searchParams]);

  const performSearch = async (query: string) => {
    if (query.trim().length < 3) return;

    // Prevent duplicate searches
    if (searchInProgress.current || lastSearchQuery.current === query) {
      console.log('🔒 Preventing duplicate search:', query);
      return;
    }

    searchInProgress.current = true;
    lastSearchQuery.current = query;
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Performing search for:', query);

      const response = await apiClient.search({ query, maxResults: 50 });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        console.log('📊 Search results received:', response.data);
        setResults(response.data.results);
        setError(null);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
      searchInProgress.current = false;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  const getSortedResults = () => {
    const sorted = [...results];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'source':
        return sorted.sort((a, b) => a.source.localeCompare(b.source));
      case 'relevance':
        return sorted.sort(
          (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)
        );
      default:
        return sorted;
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);

    // Update URL with selected products
    if (newSelected.size > 0) {
      const selectedArray = Array.from(newSelected);
      setSearchParams({ compare: selectedArray.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleCompare = () => {
    if (selectedProducts.size >= 2) {
      const selectedArray = Array.from(selectedProducts);
      navigate('/compare', {
        state: {
          productIds: selectedArray,
          products: results.filter((p) => selectedProducts.has(p.id)),
        },
      });
    }
  };

  const handleRefresh = () => {
    performSearch(searchQuery);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'out_of_stock':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'limited':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSourceDisplayName = (source: string) => {
    // Extract meaningful source name from the source string
    if (source.startsWith('Source ')) {
      return source.replace('Source ', '');
    }
    return source;
  };

  const sortedResults = getSortedResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Search
            </button>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Search Results
            </h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search for products..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Search Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-gray-400 transition-colors duration-200"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="source">Source</option>
              <option value="relevance">Relevance</option>
            </select>

            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 shadow-sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh Prices
            </button>

            {selectedProducts.size >= 2 && (
              <button
                onClick={handleCompare}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm font-medium"
              >
                Compare Selected ({selectedProducts.size})
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {!loading && results.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Found{' '}
              <span className="font-semibold text-gray-900">
                {results.length}
              </span>{' '}
              products
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">
              Searching for products...
            </p>
            <p className="text-gray-500">This may take a few moments</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            {error ? (
              <div className="text-gray-600">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-lg mb-2">Search failed due to an error.</p>
                <p className="text-sm">
                  Please try again or check the backend server.
                </p>
              </div>
            ) : (
              <div>
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg text-gray-600 mb-2">No products found</p>
                <p className="text-gray-500">Try a different search term</p>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedResults.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    src={
                      product.imageUrl ||
                      'https://via.placeholder.com/300x200?text=No+Image'
                    }
                    alt={product.name}
                  />
                  <button
                    onClick={() => toggleProductSelection(product.id)}
                    className="absolute top-3 left-3 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors duration-200"
                  >
                    {selectedProducts.has(product.id) ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                  </h3>

                  {/* Source */}
                  <div className="flex items-center mb-3">
                    <Store className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {getSourceDisplayName(product.source)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <PriceDisplay
                      price={product.price}
                      currency={product.currency}
                      className="text-xl font-bold text-gray-900"
                    />
                  </div>

                  {/* Rating with Source */}
                  {product.rating && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {product.rating}
                        </span>
                        {product.reviewCount && (
                          <span className="ml-1 text-sm text-gray-500">
                            ({product.reviewCount})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {getSourceDisplayName(product.source)}
                      </span>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                        product.availability
                      )}`}
                    >
                      {product.availability.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4 mr-1 inline" />
                      View
                    </a>
                    <button
                      onClick={() =>
                        navigate(`/product/${product.id}`, {
                          state: { product },
                        })
                      }
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedResults.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          data-testid="checkbox"
                          onClick={() => toggleProductSelection(product.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                        >
                          {selectedProducts.has(product.id) ? (
                            <CheckSquare className="h-6 w-6 text-green-600" />
                          ) : (
                            <Square className="h-6 w-6" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img
                              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                              src={
                                product.imageUrl ||
                                'https://via.placeholder.com/64x64?text=No+Image'
                              }
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-150"
                              onClick={() =>
                                navigate(`/product/${product.id}`, {
                                  state: { product },
                                })
                              }
                            >
                              {product.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              Last updated:{' '}
                              {new Date(product.lastScraped).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriceDisplay
                          price={product.price}
                          currency={product.currency}
                          className="text-lg font-semibold"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Store className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {getSourceDisplayName(product.source)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getAvailabilityColor(
                            product.availability
                          )}`}
                        >
                          {product.availability.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.rating ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900">
                              {product.rating}
                            </span>
                            {product.reviewCount && (
                              <span className="ml-1 text-sm text-gray-500">
                                ({product.reviewCount})
                              </span>
                            )}
                            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {getSourceDisplayName(product.source)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No rating
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center text-sm font-medium transition-colors duration-150"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                          <button
                            onClick={() =>
                              navigate(`/product/${product.id}`, {
                                state: { product },
                              })
                            }
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-150"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
