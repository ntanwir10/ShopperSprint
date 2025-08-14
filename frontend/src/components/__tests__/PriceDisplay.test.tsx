import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PriceDisplay from '../PriceDisplay'

describe('PriceDisplay Component', () => {
  describe('Price Formatting', () => {
    it('formats price correctly from cents to dollars', () => {
      render(<PriceDisplay price={1000} currency="USD" />)
      
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })

    it('handles zero price correctly', () => {
      render(<PriceDisplay price={0} currency="USD" />)
      
      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('handles large prices correctly', () => {
      render(<PriceDisplay price={999999} currency="USD" />)
      
      expect(screen.getByText('$9,999.99')).toBeInTheDocument()
    })

    it('handles decimal prices correctly', () => {
      render(<PriceDisplay price={1050} currency="USD" />)
      
      expect(screen.getByText('$10.50')).toBeInTheDocument()
    })
  })

  describe('Currency Display', () => {
    it('displays USD currency correctly', () => {
      render(<PriceDisplay price={1000} currency="USD" />)
      
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })

    it('displays EUR currency correctly', () => {
      render(<PriceDisplay price={1000} currency="EUR" />)
      
      expect(screen.getByText('€10.00')).toBeInTheDocument()
    })

    it('displays GBP currency correctly', () => {
      render(<PriceDisplay price={1000} currency="GBP" />)
      
      expect(screen.getByText('£10.00')).toBeInTheDocument()
    })

    it('handles empty currency string', () => {
      render(<PriceDisplay price={1000} currency="" />)
      
      // Should default to USD
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })
  })

  describe('Styling and Classes', () => {
    it('applies default classes correctly', () => {
      render(<PriceDisplay price={1000} currency="USD" />)
      
      const priceElement = screen.getByText('$10.00')
      expect(priceElement).toHaveClass('font-semibold', 'text-gray-900')
    })

    it('applies custom className correctly', () => {
      render(<PriceDisplay price={1000} currency="USD" className="text-2xl text-blue-600" />)
      
      const priceElement = screen.getByText('$10.00')
      expect(priceElement).toHaveClass('font-semibold', 'text-gray-900', 'text-2xl', 'text-blue-600')
    })

    it('handles undefined className gracefully', () => {
      render(<PriceDisplay price={1000} currency="USD" className={undefined} />)
      
      const priceElement = screen.getByText('$10.00')
      expect(priceElement).toHaveClass('font-semibold', 'text-gray-900')
    })
  })

  describe('Edge Cases', () => {
    it('handles negative prices correctly', () => {
      render(<PriceDisplay price={-1000} currency="USD" />)
      
      expect(screen.getByText('-$10.00')).toBeInTheDocument()
    })

    it('handles very small prices correctly', () => {
      render(<PriceDisplay price={1} currency="USD" />)
      
      expect(screen.getByText('$0.01')).toBeInTheDocument()
    })

    it('handles prices with many decimal places', () => {
      render(<PriceDisplay price={1001} currency="USD" />)
      
      expect(screen.getByText('$10.01')).toBeInTheDocument()
    })
  })
})
