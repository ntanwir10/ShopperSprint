import React from 'react'
import { ExternalLink } from 'lucide-react'

const BannerAd: React.FC = () => {
  // For Phase 2, this is a mock advertisement
  // In Phase 3, this will fetch real advertisements from the API
  
  const handleAdClick = () => {
    // Track advertisement click
    console.log('Banner ad clicked')
    // In Phase 3, this will call the advertisement tracking API
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">🎉 Special Offer!</h3>
            <p className="text-purple-100 mb-3">
              Get 20% off on all electronics this week. Limited time offer!
            </p>
            <button
              onClick={handleAdClick}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors duration-200 flex items-center"
            >
              Shop Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-purple-200 text-center">
          Advertisement • Sponsored Content
        </div>
      </div>
    </div>
  )
}

export default BannerAd
