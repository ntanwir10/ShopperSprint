import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  RefreshCw,
  Compare,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProductListing, SearchResponse } from '@/types';

interface SearchResultsTableProps {
  searchResults: SearchResponse;
  onRefresh: () => void;
  onCompare: (productIds: string[]) => void;
  isLoading?: boolean;
}

type SortField = 'price' | 'name' | 'rating' | 'lastScraped';
type SortDirection = 'asc' | 'desc';

export function SearchResultsTable({
  searchResults,
  onRefresh,
  onCompare,
  isLoading = false,
}: SearchResultsTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  const sortedAndFilteredResults = useMemo(() => {
    let filtered = [...searchResults.results];

    // Filter by availability
    if (filterAvailability !== 'all') {
      filtered = filtered.filter(
        (result) => result.availability === filterAvailability
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'lastScraped':
          aValue = new Date(a.lastScraped).getTime();
          bValue = new Date(b.lastScraped).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchResults.results, sortField, sortDirection, filterAvailability]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleProductSelection = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleCompare = () => {
    onCompare(Array.from(selectedProducts));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(sortedAndFilteredResults.map((r) => r.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      in_stock: 'default',
      limited: 'secondary',
      out_of_stock: 'destructive',
      unknown: 'outline',
    };

    const labels: Record<string, string> = {
      in_stock: 'In Stock',
      limited: 'Limited',
      out_of_stock: 'Out of Stock',
      unknown: 'Unknown',
    };

    return (
      <Badge variant={variants[availability] || 'outline'}>
        {labels[availability] || availability}
      </Badge>
    );
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRating = (rating?: number, reviewCount?: number) => {
    if (!rating) return '-';

    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{rating.toFixed(1)}</span>
        {reviewCount && (
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh Prices
          </Button>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Availability</option>
            <option value="in_stock">In Stock</option>
            <option value="limited">Limited</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedProducts.size} selected
          </span>
          <Button
            onClick={handleCompare}
            disabled={selectedProducts.size < 2}
            size="sm"
          >
            <Compare className="h-4 w-4 mr-2" />
            Compare Selected
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedAndFilteredResults.length} of{' '}
        {searchResults.results.length} results
        {searchResults.metadata.cacheHit && ' (cached)'}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedProducts.size === sortedAndFilteredResults.length &&
                    sortedAndFilteredResults.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('price')}
                  className="h-auto p-0 font-semibold"
                >
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('rating')}
                  className="h-auto p-0 font-semibold"
                >
                  Rating
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('lastScraped')}
                  className="h-auto p-0 font-semibold"
                >
                  Last Updated
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.has(result.id)}
                    onCheckedChange={(checked) =>
                      handleProductSelection(result.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-3">
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt={result.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {result.name || 'Unknown Product'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {result.productId}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(result.price, result.currency)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {result.source.name}
                    </span>
                    <Badge
                      variant={
                        result.source.category === 'popular'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs w-fit"
                    >
                      {result.source.category}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {getAvailabilityBadge(result.availability)}
                </TableCell>
                <TableCell>
                  {renderRating(result.rating, result.reviewCount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(result.lastScraped)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                      title="View Product"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {sortedAndFilteredResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
