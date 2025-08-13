import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ProductComparison from '../ProductComparison'

// Mock the PriceDisplay component
vi.mock('../PriceDisplay', () => ({
  default: ({ price, currency, className }: any) => (
    <span data-testid="price-display" className={className}>
      {currency} {price}
    </span>
  ),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockLocation = {
  state: null,
  pathname: '/compare',
  search: '',
  hash: '',
}

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}))

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    price: 100,
    currency: 'USD',
    availability: 'in_stock' as const,
    source: 'Amazon',
    imageUrl: 'https://example.com/image1.jpg',
    rating: 4.5,
    reviewCount: 100,
    url: 'https://amazon.com/product1',
    lastScraped: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Product 2',
    price: 150,
    currency: 'USD',
    availability: 'limited' as const,
    source: 'eBay',
    imageUrl: 'https://example.com/image2.jpg',
    rating: 4.0,
    reviewCount: 50,
    url: 'https://ebay.com/product2',
    lastScraped: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Test Product 3',
    price: 80,
    currency: 'USD',
    availability: 'in_stock' as const,
    source: 'Walmart',
    imageUrl: 'https://example.com/image3.jpg',
    rating: 3.5,
    reviewCount: 75,
    url: 'https://walmart.com/product3',
    lastScraped: '2024-01-01T00:00:00Z',
  },
]

describe('ProductComparison Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset location state
    mockLocation.state = null
  })

  describe('Component Rendering', () => {
    it('renders comparison header correctly', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Product Comparison')).toBeInTheDocument()
      expect(screen.getByText('Back to Search')).toBeInTheDocument()
    })

    it('redirects to search when no products are provided', () => {
      mockLocation.state = null

      render(<ProductComparison />)

      expect(mockNavigate).toHaveBeenCalledWith('/search')
    })

    it('shows "No products to compare" message when products array is empty', () => {
      mockLocation.state = { products: [] }

      render(<ProductComparison />)

      expect(screen.getByText('No products to compare')).toBeInTheDocument()
      expect(screen.getByText('Back to Search')).toBeInTheDocument()
    })
  })

  describe('Best Price Summary', () => {
    it('displays best price summary when products are available', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('💰 Best Price Found')).toBeInTheDocument()
      expect(screen.getByText(/Walmart has the best price at/)).toBeInTheDocument()
    })

    it('does not show best price summary when no products are in stock', () => {
      const outOfStockProducts = [
        { ...mockProducts[0], availability: 'out_of_stock' as const },
        { ...mockProducts[1], availability: 'out_of_stock' as const },
        { ...mockProducts[2], availability: 'out_of_stock' as const },
      ]

      mockLocation.state = { products: outOfStockProducts }

      render(<ProductComparison />)

      expect(screen.queryByText('💰 Best Price Found')).not.toBeInTheDocument()
    })
  })

  describe('Product Grid Display', () => {
    it('renders product cards for each product', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
    })

    it('displays product images correctly', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      const images = screen.getAllByAltText(/Test Product/)
      expect(images).toHaveLength(3)
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg')
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg')
      expect(images[2]).toHaveAttribute('src', 'https://example.com/image3.jpg')
    })

    it('shows placeholder image when no image URL is provided', () => {
      const productsWithoutImages = [
        { ...mockProducts[0], imageUrl: undefined },
      ]

      mockLocation.state = { products: productsWithoutImages }

      render(<ProductComparison />)

      const placeholderImage = screen.getByAltText('Test Product 1')
      expect(placeholderImage).toHaveAttribute('src', 'https://via.placeholder.com/300x200?text=No+Image')
    })

    it('displays product source information', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText(/Source:/)).toBeInTheDocument()
      expect(screen.getByText('Amazon')).toBeInTheDocument()
      expect(screen.getByText('eBay')).toBeInTheDocument()
      expect(screen.getByText('Walmart')).toBeInTheDocument()
    })

    it('displays product prices correctly', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      const priceDisplays = screen.getAllByTestId('price-display')
      expect(priceDisplays).toHaveLength(6) // 3 in grid + 3 in table
      expect(priceDisplays[0]).toHaveTextContent('USD 100')
      expect(priceDisplays[1]).toHaveTextContent('USD 150')
      expect(priceDisplays[2]).toHaveTextContent('USD 80')
    })
  })

  describe('Price Difference Calculation', () => {
    it('shows "Best Price" for the lowest priced product', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Best Price')).toBeInTheDocument()
    })

    it('shows percentage difference for higher priced products', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      // Amazon (100) vs Walmart (80) = +25% more
      expect(screen.getByText('+25.0% more')).toBeInTheDocument()
      // eBay (150) vs Walmart (80) = +87.5% more
      expect(screen.getByText('+87.5% more')).toBeInTheDocument()
    })

    it('handles products with same price correctly', () => {
      const samePriceProducts = [
        { ...mockProducts[0], price: 100 },
        { ...mockProducts[1], price: 100 },
      ]

      mockLocation.state = { products: samePriceProducts }

      render(<ProductComparison />)

      expect(screen.getAllByText('Best Price')).toHaveLength(2)
    })
  })

  describe('Availability Display', () => {
    it('displays availability status with correct styling', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('in stock')).toBeInTheDocument()
      expect(screen.getByText('limited')).toBeInTheDocument()
    })

    it('formats availability text correctly (replaces underscores with spaces)', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('in stock')).toBeInTheDocument()
      expect(screen.getByText('out of stock')).toBeInTheDocument()
    })
  })

  describe('Rating Display', () => {
    it('displays rating with star icon when available', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('4.5')).toBeInTheDocument()
      expect(screen.getByText('4.0')).toBeInTheDocument()
      expect(screen.getByText('3.5')).toBeInTheDocument()
    })

    it('shows review count when available', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('(100 reviews)')).toBeInTheDocument()
      expect(screen.getByText('(50 reviews)')).toBeInTheDocument()
      expect(screen.getByText('(75 reviews)')).toBeInTheDocument()
    })

    it('handles products without ratings gracefully', () => {
      const productsWithoutRating = [
        { ...mockProducts[0], rating: undefined, reviewCount: undefined },
      ]

      mockLocation.state = { products: productsWithoutRating }

      render(<ProductComparison />)

      // Should not show rating section
      expect(screen.queryByText(/Rating:/)).not.toBeInTheDocument()
    })
  })

  describe('Last Updated Information', () => {
    it('displays last scraped date in readable format', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
      // The exact format depends on locale, so we just check that it's displayed
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()
    })
  })

  describe('Product Actions', () => {
    it('displays "View Product" button for each product', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      const viewButtons = screen.getAllByText('View Product')
      expect(viewButtons).toHaveLength(3)
    })

    it('links to correct product URLs', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      const viewButtons = screen.getAllByText('View Product')
      expect(viewButtons[0]).toHaveAttribute('href', 'https://amazon.com/product1')
      expect(viewButtons[1]).toHaveAttribute('href', 'https://ebay.com/product2')
      expect(viewButtons[2]).toHaveAttribute('href', 'https://walmart.com/product3')
    })

    it('opens product links in new tab', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      const viewButtons = screen.getAllByText('View Product')
      viewButtons.forEach(button => {
        expect(button).toHaveAttribute('target', '_blank')
        expect(button).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Comparison Table', () => {
    it('renders detailed comparison table', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Detailed Comparison')).toBeInTheDocument()
    })

    it('displays table headers for each source', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Feature')).toBeInTheDocument()
      expect(screen.getByText('Amazon')).toBeInTheDocument()
      expect(screen.getByText('eBay')).toBeInTheDocument()
      expect(screen.getByText('Walmart')).toBeInTheDocument()
    })

    it('shows product names in comparison table', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Product Name')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
    })

    it('shows prices in comparison table', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Price')).toBeInTheDocument()
      // Prices are displayed via PriceDisplay component
      const priceDisplays = screen.getAllByTestId('price-display')
      expect(priceDisplays.length).toBeGreaterThan(0)
    })

    it('shows availability in comparison table', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Availability')).toBeInTheDocument()
      expect(screen.getByText('in stock')).toBeInTheDocument()
      expect(screen.getByText('limited')).toBeInTheDocument()
      expect(screen.getByText('out of stock')).toBeInTheDocument()
    })

    it('shows ratings in comparison table', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Rating')).toBeInTheDocument()
      expect(screen.getByText('4.5')).toBeInTheDocument()
      expect(screen.getByText('4.0')).toBeInTheDocument()
      expect(screen.getByText('3.5')).toBeInTheDocument()
    })

    it('shows last updated in comparison table', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Last Updated')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates back to search when back button is clicked', () => {
      mockLocation.state = { products: mockProducts }

      render(<ProductComparison />)

      const backButton = screen.getByText('Back to Search')
      fireEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/search')
    })
  })

  describe('Edge Cases', () => {
    it('handles single product comparison', () => {
      const singleProduct = [mockProducts[0]]

      mockLocation.state = { products: singleProduct }

      render(<ProductComparison />)

      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Best Price')).toBeInTheDocument()
    })

    it('handles products with missing optional fields', () => {
      const minimalProducts = [
        {
          id: '1',
          name: 'Minimal Product',
          price: 50,
          currency: 'USD',
          availability: 'in_stock' as const,
          source: 'Test Store',
          url: 'https://test.com',
          lastScraped: '2024-01-01T00:00:00Z',
        },
      ]

      mockLocation.state = { products: minimalProducts }

      render(<ProductComparison />)

      expect(screen.getByText('Minimal Product')).toBeInTheDocument()
      expect(screen.getByText('Test Store')).toBeInTheDocument()
      // Should not crash when optional fields are missing
      expect(screen.getByText('Best Price')).toBeInTheDocument()
    })
  })
})
