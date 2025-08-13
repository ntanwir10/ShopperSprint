import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchResultsTable } from '@/components/SearchResultsTable';
import { apiClient } from '@/lib/api';
import type { SearchResponse } from '@/types';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim().length < 3) {
      setError('Search query must be at least 3 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const results = await apiClient.search(query.trim());
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during search'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!searchResults) return;

    setIsRefreshing(true);
    setError(null);

    try {
      // Get product IDs from current results
      const productIds = searchResults.results.map(result => result.id);
      
      // Call refresh API
      const refreshResponse = await apiClient.refreshPrices(
        searchResults.searchId,
        productIds
      );

      // For now, just show a success message
      // In a real implementation, you'd poll for job status and update results
      console.log('Refresh job queued:', refreshResponse.jobId);
      
      // Simulate refresh by updating timestamps
      setSearchResults(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map(result => ({
            ...result,
            lastScraped: new Date().toISOString(),
          })),
          metadata: {
            ...prev.metadata,
            cacheHit: false,
          },
        };
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during refresh'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCompare = (productIds: string[]) => {
    if (productIds.length < 2) return;

    // For now, just log the comparison
    // In a real implementation, you'd open a comparison modal or navigate to comparison page
    console.log('Comparing products:', productIds);
    
    const selectedProducts = searchResults?.results.filter(result => 
      productIds.includes(result.id)
    ) || [];
    
    alert(`Comparing ${selectedProducts.length} products:\n${selectedProducts.map(p => p.name || 'Unknown Product').join('\n')}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Product Price Tracker</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Search and compare prices across multiple retailers in real-time
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for products (minimum 3 characters)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                minLength={3}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || query.trim().length < 3}
              className="px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </form>

          {query.length > 0 && query.length < 3 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please enter at least 3 characters to search
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Search Results for "{query}"
              </h2>

              {searchResults.results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No products found for your search. Try a different query or
                    check back later.
                  </p>
                </div>
              ) : (
                <SearchResultsTable
                  searchResults={searchResults}
                  onRefresh={handleRefresh}
                  onCompare={handleCompare}
                  isLoading={isRefreshing}
                />
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Why Choose Price Tracker?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Search</h3>
              <p className="text-muted-foreground text-sm">
                Get instant price comparisons across multiple retailers
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Live Updates</h3>
              <p className="text-muted-foreground text-sm">
                Refresh prices in real-time to ensure accuracy
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Comparison</h3>
              <p className="text-muted-foreground text-sm">
                Compare products side-by-side with detailed specifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
