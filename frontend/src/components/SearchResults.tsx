import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  CheckSquare,
  Square,
  AlertCircle,
  ArrowLeft,
  Star,
  Store,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import PriceDisplay from './PriceDisplay';
import { mockProducts } from '../data/mockData';
import { Product } from '../lib/api';

interface SearchResultsProps {
  searchQuery?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery: propSearchQuery,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { query: urlQuery } = useParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Get search query from multiple sources in order of priority
    const query =
      propSearchQuery || location.state?.searchQuery || urlQuery || '';

    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [propSearchQuery, location.state?.searchQuery, urlQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter mock products based on search query
      const filteredResults = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.toLowerCase().includes(query.toLowerCase()) ||
          product.source.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filteredResults);

      if (filteredResults.length === 0) {
        setError(`No products found for "${query}"`);
      }
    } catch (err) {
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  const getSortedResults = () => {
    const sorted = [...results];

    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
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
      navigate(`/search/${searchQuery}?compare=${selectedArray.join(',')}`);
    } else {
      navigate(`/search/${searchQuery}`);
    }
  };

  const handleCompare = () => {
    if (selectedProducts.size >= 2) {
      const selectedArray = Array.from(selectedProducts);
      navigate('/compare-products', {
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
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'limited':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                Search Results
              </h1>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-destructive">
                    Search Error
                  </h3>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>

            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background hover:border-ring hover:bg-accent/50 dark:hover:bg-accent/30 transition-all duration-200 text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
            >
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>

            <div className="flex items-center border border-border rounded-lg overflow-hidden hover:border-ring transition-colors duration-200">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none hover:bg-accent/80 dark:hover:bg-accent/60"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none hover:bg-accent/80 dark:hover:bg-accent/60"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh Prices
            </Button>

            {selectedProducts.size >= 2 && (
              <Button
                onClick={handleCompare}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg dark:hover:shadow-green-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                Compare Selected ({selectedProducts.size})
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading
              ? 'Searching...'
              : `Found ${results.length} results for "${searchQuery}"`}
          </p>
        </div>

        {/* Results Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {sortedResults.map((product) => (
              <Card
                key={product.id}
                className={`group cursor-pointer hover:shadow-lg dark:hover:shadow-accent/20 transition-all duration-200 hover:-translate-y-1 hover:border-ring ${
                  viewMode === 'list' ? 'flex gap-4' : ''
                }`}
                onClick={() => {
                  if (product.slug) {
                    navigate(`/product/${product.slug}`, {
                      state: { product },
                    });
                  }
                }}
              >
                <CardContent
                  className={`p-4 ${viewMode === 'list' ? 'flex gap-4' : ''}`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProductSelection(product.id);
                      }}
                      className="p-1 bg-background/80 backdrop-blur-sm rounded hover:bg-background/90 transition-colors"
                    >
                      {selectedProducts.has(product.id) ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Image Section */}
                  <div
                    className={`relative ${
                      viewMode === 'list'
                        ? 'w-32 h-32 flex-shrink-0'
                        : 'aspect-square mb-4'
                    } overflow-hidden rounded-lg bg-muted`}
                  >
                    <img
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Availability Badge */}
                    <Badge
                      className={`absolute bottom-2 left-2 ${getAvailabilityColor(
                        product.availability
                      )}`}
                    >
                      {product.availability === 'in_stock'
                        ? 'In Stock'
                        : product.availability === 'limited'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </Badge>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    {/* Source */}
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getSourceDisplayName(product.source)}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.rating} (
                          {product.reviewCount?.toLocaleString() || 0})
                        </span>
                      </div>
                    )}

                    {/* Price Section */}
                    <div className="mb-4">
                      <PriceDisplay product={product} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (product.slug) {
                            navigate(`/product/${product.slug}`, {
                              state: { product },
                            });
                          }
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (selectedProducts.has(product.id)) {
                            setSelectedProducts((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(product.id);
                              return newSet;
                            });
                          } else {
                            setSelectedProducts((prev) =>
                              new Set(prev).add(product.id)
                            );
                          }
                        }}
                      >
                        {selectedProducts.has(product.id)
                          ? 'Remove'
                          : 'Compare'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse our popular
                categories.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scroll to top button */}
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      </main>
    </div>
  );
};

export default SearchResults;
