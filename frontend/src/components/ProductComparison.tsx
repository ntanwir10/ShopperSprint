import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Star } from 'lucide-react'
import PriceDisplay from './PriceDisplay'

interface Product {
  id: string
  name: string
  price: number
  currency: string
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown'
  source: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  url: string
  lastScraped: string
}

const ProductComparison: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (location.state?.products) {
      setProducts(location.state.products)
    } else {
      // Redirect back to search if no products to compare
      navigate('/search')
    }
  }, [location.state, navigate])

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No products to compare</p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'text-green-600 bg-green-100'
      case 'out_of_stock':
        return 'text-red-600 bg-red-100'
      case 'limited':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getBestPrice = () => {
    const inStockProducts = products.filter(p => p.availability === 'in_stock')
    if (inStockProducts.length === 0) return null
    
    return inStockProducts.reduce((best, current) => 
      current.price < best.price ? current : best
    )
  }

  const getPriceDifference = (product: Product, bestPrice: number) => {
    const difference = product.price - bestPrice
    const percentage = ((difference / bestPrice) * 100).toFixed(1)
    
    if (difference === 0) return { text: 'Best Price', color: 'text-green-600' }
    if (difference > 0) return { text: `+${percentage}% more`, color: 'text-red-600' }
    return { text: `${percentage}% less`, color: 'text-green-600' }
  }

  const bestPrice = getBestPrice()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Search
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Product Comparison</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        {bestPrice && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              💰 Best Price Found
            </h3>
            <p className="text-green-700">
              <strong>{bestPrice.source}</strong> has the best price at{' '}
              <PriceDisplay price={bestPrice.price} currency={bestPrice.currency} />
            </p>
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product, index) => {
            const priceDiff = bestPrice ? getPriceDifference(product, bestPrice.price) : null
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Product Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {/* Source */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Source:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.source}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <PriceDisplay price={product.price} currency={product.currency} className="text-2xl" />
                    </div>
                    {priceDiff && (
                      <div className={`text-sm ${priceDiff.color} text-right mt-1`}>
                        {priceDiff.text}
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Availability:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(product.availability)}`}>
                      {product.availability.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Rating:</span>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-900">{product.rating}</span>
                        {product.reviewCount && (
                          <span className="ml-1 text-sm text-gray-500">({product.reviewCount} reviews)</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="mb-6">
                    <span className="text-sm text-gray-500">Last updated:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(product.lastScraped).toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary text-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2 inline" />
                      View Product
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Comparison</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    {products.map((product) => (
                      <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {product.source}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Product Name</td>
                    {products.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Price</td>
                    {products.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <PriceDisplay price={product.price} currency={product.currency} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Availability</td>
                    {products.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(product.availability)}`}>
                          {product.availability.replace('_', ' ')}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rating</td>
                    {products.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.rating ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{product.rating}</span>
                            {product.reviewCount && (
                              <span className="ml-1 text-gray-500">({product.reviewCount})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No rating</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Last Updated</td>
                    {products.map((product) => (
                      <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(product.lastScraped).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductComparison
