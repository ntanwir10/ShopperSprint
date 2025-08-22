import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Fetch subscriber count on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/waitlist/stats');
        const data = await response.json();
        if (data.success) {
          setSubscriberCount(data.data.currentlySubscribed);
        }
      } catch (err) {
        console.log('Could not fetch subscriber count');
      }
    };
    fetchStats();
  }, []);

  // Update subscriber count after successful subscription
  useEffect(() => {
    if (isSubscribed && !alreadySubscribed) {
      const fetchUpdatedStats = async () => {
        try {
          const response = await fetch('/api/waitlist/stats');
          const data = await response.json();
          if (data.success) {
            setSubscriberCount(data.data.currentlySubscribed);
          }
        } catch (err) {
          console.log('Could not fetch updated subscriber count');
        }
      };
      fetchUpdatedStats();
    }
  }, [isSubscribed, alreadySubscribed]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Submit to waitlist API
      const response = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        setAlreadySubscribed(data.alreadySubscribed || false);
        setEmail('');
        // Subscriber count will be updated by useEffect
      } else {
        setError(data.message || 'Failed to join waitlist. Please try again.');
      }
    } catch (err) {
      console.error('Waitlist subscription error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>ShopperSprint - Canada's Best Price Comparison Platform Coming Soon</title>
        <meta 
          name="description" 
          content="ShopperSprint is launching soon as Canada's most advanced price comparison platform. Find the best deals across Canadian retailers. Join our waitlist for early access." 
        />
        <meta 
          name="keywords" 
          content="ShopperSprint, Canada price comparison, Canadian deals, best prices Canada, online shopping Canada, price tracking, deal finder" 
        />
        
        {/* Open Graph for social sharing */}
        <meta property="og:title" content="ShopperSprint - Canada's Price Comparison Platform Coming Soon" />
        <meta property="og:description" content="The smartest way to shop in Canada is launching soon. Join our waitlist for early access to the best deals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shoppersprint.com" />
        <meta property="og:image" content="https://shoppersprint.com/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ShopperSprint - Coming Soon" />
        <meta name="twitter:description" content="Canada's smartest price comparison platform launching soon" />
        
        {/* Schema markup for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ShopperSprint",
            "url": "https://shoppersprint.com",
            "description": "Canada's premier price comparison and deal-finding platform",
            "foundingDate": "2025",
            "areaServed": "Canada",
            "serviceType": "Price Comparison Service"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 bg-clip-text text-transparent mb-4 animate-bounce-subtle">
                🛒 ShopperSprint
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-light">
                Canada's Smartest Price Comparison Platform
              </p>
            </div>

            {/* Main Message */}
            <div className="mb-12 animate-slide-up">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                The Best Deals in Canada<br />
                <span className="text-blue-600">Are Coming Soon</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We're building Canada's most comprehensive price comparison platform. 
                Compare prices across all major Canadian retailers, track deals, and never 
                overpay again. Get ready for smart shopping powered by real-time data.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 animate-slide-up animation-delay-200">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-4">🇨🇦</div>
                <h3 className="font-semibold text-gray-800 mb-2">Canadian Retailers</h3>
                <p className="text-gray-600 text-sm">Compare prices across Amazon.ca, Walmart, Best Buy, and more</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-semibold text-gray-800 mb-2">Price History</h3>
                <p className="text-gray-600 text-sm">Track price changes and find the best time to buy</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-4">🔔</div>
                <h3 className="font-semibold text-gray-800 mb-2">Price Alerts</h3>
                <p className="text-gray-600 text-sm">Get notified when your desired items go on sale</p>
              </div>
            </div>

            {/* Subscriber Count */}
            {subscriberCount > 0 && (
              <div className="mb-8 animate-fade-in">
                <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  🎉 {subscriberCount} {subscriberCount === 1 ? 'person has' : 'people have'} joined the waitlist!
                </div>
              </div>
            )}

            {/* Email Signup */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-200 shadow-lg animate-slide-up animation-delay-400">
              {!isSubscribed ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Join the Waitlist
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to access Canada's smartest shopping platform. Get early access and exclusive launch deals.
                  </p>
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 text-gray-800 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base font-medium"
                        required
                        disabled={isLoading}
                      />
                      {isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    
                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 animate-shake">
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Joining...
                        </span>
                      ) : (
                        'Get Early Access'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center animate-bounce-in">
                  <div className="text-4xl mb-4">{alreadySubscribed ? '👋' : '🎉'}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {alreadySubscribed ? 'You\'re Already In!' : 'Welcome to ShopperSprint!'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {alreadySubscribed 
                      ? 'You\'re already on our waitlist! We\'ll notify you as soon as we launch in Canada. Stay tuned for exclusive updates and early access!'
                      : 'Thanks for joining our waitlist! We\'ll notify you as soon as we launch in Canada with exclusive early access.'
                    }
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm font-medium">
                      {alreadySubscribed 
                        ? '📧 Keep an eye on your inbox for updates and launch announcements!'
                        : '📧 Check your email for a welcome message with more details!'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSubscribed(false);
                      setAlreadySubscribed(false);
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    {alreadySubscribed ? 'Subscribe another email' : 'Subscribe another email'}
                  </button>
                </div>
              )}
            </div>

            {/* Launch Timeline */}
            <div className="mt-12 text-center animate-fade-in animation-delay-600">
              <p className="text-gray-500 mb-2">Expected Launch</p>
              <p className="text-2xl font-bold text-blue-600">Q2 2025</p>
              <p className="text-sm text-gray-500 mt-2">Starting with major Canadian cities</p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex justify-center items-center space-x-8 text-gray-400 animate-slide-up animation-delay-800">
              <div className="text-center hover:scale-110 transition-transform">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-xs">Canadian Retailers</div>
              </div>
              <div className="text-center hover:scale-110 transition-transform">
                <div className="text-2xl font-bold text-green-600">Real-time</div>
                <div className="text-xs">Price Updates</div>
              </div>
              <div className="text-center hover:scale-110 transition-transform">
                <div className="text-2xl font-bold text-purple-600">Free</div>
                <div className="text-xs">Always</div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-12 text-center animate-fade-in animation-delay-1000">
              <p className="text-gray-500 text-sm mb-4">Trusted by smart shoppers across Canada</p>
              <div className="flex justify-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
                <span className="text-gray-600 text-sm ml-2">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </>
  );
};

export default ComingSoon;
