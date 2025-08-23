import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-white"
      style={{
        width: '1440px',
        height: 'auto',
        position: 'relative',
        left: '0px',
        top: '0px',
      }}
    >
      {/* Hero Section */}
      <section
        className="relative bg-white py-16"
        style={{
          width: '1440px',
          height: 'auto',
          position: 'relative',
          left: '0px',
          top: '0px',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-20"
          style={{
            width: '1440px',
            height: 'auto',
            position: 'relative',
            left: '0px',
            top: '0px',
          }}
        >
          <div
            className="text-center max-w-4xl mx-auto"
            style={{
              width: '800px',
              height: 'auto',
              position: 'relative',
              left: '320px',
              top: '0px',
            }}
          >
            <h1
              className="text-5xl font-bold text-gray-900 mb-6"
              style={{
                width: '800px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                fontFamily: 'Inter',
                fontSize: '48px',
                lineHeight: '56px',
                textAlign: 'center',
                color: '#111827',
              }}
            >
              Find the Best Prices Instantly
            </h1>
            <p
              className="text-xl text-gray-600 mb-12"
              style={{
                width: '800px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                fontFamily: 'Inter',
                fontSize: '20px',
                lineHeight: '28px',
                textAlign: 'center',
                color: '#6B7280',
              }}
            >
              Track prices across multiple sources in real-time. No account
              needed.
            </p>

            {/* Search Bar */}
            <div
              className="mb-12"
              style={{
                width: '800px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
              }}
            >
              <div
                className="relative max-w-2xl mx-auto"
                style={{
                  width: '640px',
                  height: 'auto',
                  position: 'relative',
                  left: '80px',
                  top: '0px',
                }}
              >
                <div className="flex bg-white rounded-full shadow-lg border border-gray-300">
                  <input
                    type="text"
                    placeholder="Search for products, brands, or categories..."
                    className="flex-1 px-6 py-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none rounded-l-full"
                    style={{
                      width: '640px',
                      height: '64px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#FFFFFF',
                      borderRadius: '32px',
                      fontFamily: 'Inter',
                      fontSize: '16px',
                      lineHeight: '24px',
                      textAlign: 'left',
                      color: '#111827',
                      boxShadow:
                        '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: '1px solid #D1D5DB',
                    }}
                  />
                  <button
                    className="bg-blue-600 text-white px-6 py-4 rounded-r-full hover:bg-blue-700 transition-colors flex items-center gap-3"
                    style={{
                      width: '120px',
                      height: '64px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#2563EB',
                      borderRadius: '0px 32px 32px 0px',
                      fontFamily: 'Inter',
                      fontSize: '16px',
                      lineHeight: '24px',
                      textAlign: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M12.5 11h-.79l-.28-.27A6.471 6.471 0 0 0 14 6.5 6.5 6.5 0 1 0 6.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L17.49 16l-4.99-5zm-6 0C3.01 11 1 8.99 1 6.5S3.01 2 6.5 2 12 4.01 12 6.5 8.99 11 6.5 11z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div
              className="flex flex-wrap justify-center gap-4 mb-12"
              style={{
                width: '800px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
              }}
            >
              {[
                'Electronics',
                'Smartphones',
                'Laptops',
                'Headphones',
                'Gaming',
                'Home Appliances',
              ].map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                  style={{
                    width: 'auto',
                    height: '32px',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    background: '#EFF6FF',
                    borderRadius: '16px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#1D4ED8',
                    border: '1px solid #DBEAFE',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div
              className="flex justify-center gap-16"
              style={{
                width: '800px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
              }}
            >
              <div className="text-center">
                <div
                  className="text-3xl font-bold text-blue-600 mb-2"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '30px',
                    lineHeight: '36px',
                    textAlign: 'center',
                    color: '#2563EB',
                  }}
                >
                  1.2M+
                </div>
                <div
                  className="text-sm text-gray-600"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  Products Tracked
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl font-bold text-blue-600 mb-2"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '30px',
                    lineHeight: '36px',
                    textAlign: 'center',
                    color: '#2563EB',
                  }}
                >
                  120+
                </div>
                <div
                  className="text-sm text-gray-600"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  Retailers
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl font-bold text-blue-600 mb-2"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '30px',
                    lineHeight: '36px',
                    textAlign: 'center',
                    color: '#2563EB',
                  }}
                >
                  5M+
                </div>
                <div
                  className="text-sm text-gray-600"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  Price Alerts
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-16 bg-white"
        style={{
          width: '1440px',
          height: 'auto',
          position: 'relative',
          left: '0px',
          top: '0px',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-20"
          style={{
            width: '1440px',
            height: 'auto',
            position: 'relative',
            left: '0px',
            top: '0px',
          }}
        >
          <div
            className="grid grid-cols-3 gap-8"
            style={{
              width: '1200px',
              height: 'auto',
              position: 'relative',
              left: '120px',
              top: '0px',
            }}
          >
            {/* Real-time Updates */}
            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              style={{
                width: '384px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow:
                  '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E5E7EB',
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 18 20"
                  fill="none"
                  className="text-blue-600"
                >
                  <path
                    d="M9 0C4.03 0 0 4.03 0 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"
                    fill="currentColor"
                  />
                  <path
                    d="M9 3v6l4.5 2.7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{
                  width: 'auto',
                  height: 'auto',
                  position: 'relative',
                  left: '0px',
                  top: '0px',
                  fontFamily: 'Inter',
                  fontSize: '20px',
                  lineHeight: '28px',
                  textAlign: 'left',
                  color: '#111827',
                }}
              >
                Real-time Updates
              </h3>
              <p
                className="text-gray-600 text-base leading-relaxed"
                style={{
                  width: 'auto',
                  height: 'auto',
                  position: 'relative',
                  left: '0px',
                  top: '0px',
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  lineHeight: '24px',
                  textAlign: 'left',
                  color: '#6B7280',
                }}
              >
                Get instant notifications when prices change on your favorite
                products.
              </p>
            </div>

            {/* Price History */}
            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              style={{
                width: '384px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow:
                  '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E5E7EB',
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  className="text-blue-600"
                >
                  <path
                    d="M2 16h16v-2H2v2zm0-4h16v-2H2v2zm0-4h16V6H2v2zm0-4h16V2H2v2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Price History
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                View detailed price history charts to identify trends and make
                informed decisions.
              </p>
            </div>

            {/* Anonymous Alerts */}
            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              style={{
                width: '384px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow:
                  '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E5E7EB',
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 18 20"
                  fill="none"
                  className="text-blue-600"
                >
                  <path
                    d="M9 0C4.03 0 0 4.03 0 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"
                    fill="currentColor"
                  />
                  <path
                    d="M9 3v6l4.5 2.7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Anonymous Alerts
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Set price alerts without creating an account. Get notified via
                browser when prices drop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section
        className="py-16 bg-gray-100"
        style={{
          width: '1440px',
          height: 'auto',
          position: 'relative',
          left: '0px',
          top: '0px',
          background: '#F3F4F6',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-20"
          style={{
            width: '1440px',
            height: 'auto',
            position: 'relative',
            left: '0px',
            top: '0px',
          }}
        >
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-12 relative overflow-hidden"
            style={{
              width: '1200px',
              height: 'auto',
              position: 'relative',
              left: '120px',
              top: '0px',
              background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
              borderRadius: '12px',
              padding: '48px',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="max-w-2xl">
                <h2
                  className="text-3xl font-bold text-white mb-6"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '32px',
                    lineHeight: '40px',
                    textAlign: 'left',
                    color: '#FFFFFF',
                  }}
                >
                  Save More with PriceGuard Premium
                </h2>
                <p
                  className="text-blue-100 text-base mb-8 leading-relaxed"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '16px',
                    lineHeight: '24px',
                    textAlign: 'left',
                    color: '#BFDBFE',
                  }}
                >
                  Get advanced price predictions, unlimited alerts, and early
                  access to deals. Try free for 14 days.
                </p>
                <div
                  className="flex gap-4"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <button
                    className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                    style={{
                      width: 'auto',
                      height: '48px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#FFFFFF',
                      borderRadius: '24px',
                      fontFamily: 'Inter',
                      fontSize: '16px',
                      lineHeight: '24px',
                      textAlign: 'center',
                      color: '#2563EB',
                      padding: '12px 24px',
                    }}
                  >
                    Try Free
                  </button>
                  <button
                    className="border border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-blue-600 transition-colors"
                    style={{
                      width: 'auto',
                      height: '48px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: 'transparent',
                      borderRadius: '24px',
                      fontFamily: 'Inter',
                      fontSize: '16px',
                      lineHeight: '24px',
                      textAlign: 'center',
                      color: '#FFFFFF',
                      border: '1px solid #FFFFFF',
                      padding: '12px 24px',
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
              <div className="w-64 h-64 bg-gray-300 rounded-lg shadow-lg">
                {/* Premium feature illustration */}
              </div>
            </div>
            <div className="absolute top-0 right-0 bg-white text-gray-600 text-xs px-2 py-1 rounded-bl-lg">
              Ad
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section
        className="py-16 bg-white"
        style={{
          width: '1440px',
          height: 'auto',
          position: 'relative',
          left: '0px',
          top: '0px',
          background: '#FFFFFF',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-20"
          style={{
            width: '1440px',
            height: 'auto',
            position: 'relative',
            left: '0px',
            top: '0px',
          }}
        >
          <div
            className="flex justify-between items-center mb-12"
            style={{
              width: '1200px',
              height: 'auto',
              position: 'relative',
              left: '120px',
              top: '0px',
            }}
          >
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{
                width: 'auto',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                fontFamily: 'Inter',
                fontSize: '24px',
                lineHeight: '32px',
                textAlign: 'left',
                color: '#111827',
              }}
            >
              Trending Products
            </h2>
            <div
              className="flex gap-2"
              style={{
                width: 'auto',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
              }}
            >
              <button
                className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                style={{
                  width: '40px',
                  height: '40px',
                  position: 'relative',
                  left: '0px',
                  top: '0px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #D1D5DB',
                }}
              >
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  className="text-gray-600"
                  style={{
                    width: '10px',
                    height: '16px',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <path
                    d="M8 2L2 8l6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                style={{
                  width: '40px',
                  height: '40px',
                  position: 'relative',
                  left: '0px',
                  top: '0px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #D1D5DB',
                }}
              >
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  className="text-gray-600"
                  style={{
                    width: '10px',
                    height: '16px',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <path
                    d="M2 2l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-4 gap-6"
            style={{
              width: '1200px',
              height: 'auto',
              position: 'relative',
              left: '120px',
              top: '0px',
            }}
          >
            {/* iPhone 14 Pro */}
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              style={{
                width: '288px',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow:
                  '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E5E7EB',
              }}
            >
              <div className="relative">
                <div className="w-full h-48 bg-gray-200"></div>
                <div
                  className="absolute top-3 left-3"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                  }}
                >
                  <span
                    className="bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#10B981',
                      borderRadius: '12px',
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      lineHeight: '16px',
                      textAlign: 'center',
                      color: '#FFFFFF',
                      padding: '4px 8px',
                    }}
                  >
                    -12%
                  </span>
                </div>
                <button
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
                  style={{
                    width: '32px',
                    height: '32px',
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow:
                      '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-600"
                    style={{
                      width: '16px',
                      height: '16px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <path
                      d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div
                className="p-4"
                style={{
                  width: 'auto',
                  height: 'auto',
                  position: 'relative',
                  left: '0px',
                  top: '0px',
                  padding: '16px',
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <span
                    className="text-xs font-medium text-gray-600"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      lineHeight: '16px',
                      textAlign: 'left',
                      color: '#6B7280',
                    }}
                  >
                    Apple
                  </span>
                  <span
                    className="text-gray-400"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      color: '#9CA3AF',
                    }}
                  >
                    •
                  </span>
                  <div
                    className="flex items-center gap-1"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <svg
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                      className="text-yellow-400"
                      style={{
                        width: '14px',
                        height: '12px',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                      }}
                    >
                      <path
                        d="M7 0l2.5 7.5H14l-6 4.5 2.5 7.5L7 12l-6 4.5 2.5-7.5L0 7.5h4.5L7 0z"
                        fill="currentColor"
                      />
                    </svg>
                    <span
                      className="text-xs font-medium text-gray-900"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        fontFamily: 'Inter',
                        fontSize: '12px',
                        lineHeight: '16px',
                        textAlign: 'left',
                        color: '#111827',
                      }}
                    >
                      4.8
                    </span>
                  </div>
                </div>
                <h3
                  className="text-base font-medium text-gray-900 mb-3 leading-tight"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '16px',
                    lineHeight: '24px',
                    textAlign: 'left',
                    color: '#111827',
                  }}
                >
                  iPhone 14 Pro - 256GB - Deep Purple
                </h3>
                <div
                  className="flex items-center gap-3 mb-3"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <span
                    className="text-xl font-bold text-gray-900"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '20px',
                      lineHeight: '28px',
                      textAlign: 'left',
                      color: '#111827',
                    }}
                  >
                    $949.00
                  </span>
                  <span
                    className="text-sm text-gray-600 line-through"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      lineHeight: '20px',
                      textAlign: 'left',
                      color: '#6B7280',
                    }}
                  >
                    $1,099.00
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <div
                    className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      width: '24px',
                      height: '24px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#2563EB',
                      borderRadius: '12px',
                    }}
                  >
                    A
                  </div>
                  <div
                    className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      width: '24px',
                      height: '24px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#EF4444',
                      borderRadius: '12px',
                    }}
                  >
                    T
                  </div>
                  <div
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      width: '24px',
                      height: '24px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#10B981',
                      borderRadius: '12px',
                    }}
                  >
                    W
                  </div>
                </div>
                <button
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  style={{
                    width: '100%',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    color: '#2563EB',
                  }}
                >
                  Compare
                </button>
              </div>
            </div>

            {/* Sony Headphones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    -20%
                  </span>
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-600"
                  >
                    <path
                      d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-600">
                    Sony
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <svg
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                      className="text-yellow-400"
                    >
                      <path
                        d="M7 0l2.5 7.5H14l-6 4.5 2.5 7.5L7 12l-6 4.5 2.5-7.5L0 7.5h4.5L7 0z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">
                      4.7
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-3 leading-tight">
                  Sony WH-1000XM5 Wireless Noise Cancelling Headphones
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    $299.99
                  </span>
                  <span className="text-sm text-gray-600 line-through">
                    $399.99
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    A
                  </div>
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    B
                  </div>
                </div>
                <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Compare
                </button>
              </div>
            </div>

            {/* PlayStation 5 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200"></div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-600"
                  >
                    <path
                      d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-600">
                    Sony
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <svg
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                      className="text-yellow-400"
                    >
                      <path
                        d="M7 0l2.5 7.5H14l-6 4.5 2.5 7.5L7 12l-6 4.5 2.5-7.5L0 7.5h4.5L7 0z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">
                      4.9
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-3 leading-tight">
                  PlayStation 5 Slim Console (Disc Version)
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    $499.99
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    A
                  </div>
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    G
                  </div>
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    T
                  </div>
                </div>
                <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Compare
                </button>
              </div>
            </div>

            {/* Samsung Galaxy */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="absolute top-3 left-3">
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-600"
                  >
                    <path
                      d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-600">
                    Samsung
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <svg
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                      className="text-yellow-400"
                    >
                      <path
                        d="M7 0l2.5 7.5H14l-6 4.5 2.5 7.5L7 12l-6 4.5 2.5-7.5L0 7.5h4.5L7 0z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">
                      4.6
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-3 leading-tight">
                  Samsung Galaxy S24 Ultra - 512GB - Titanium
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    $1,299.99
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    A
                  </div>
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    T
                  </div>
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    B
                  </div>
                </div>
                <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Compare
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Section */}
      <section
        className="py-16 bg-gray-50"
        style={{
          width: '1440px',
          height: 'auto',
          position: 'relative',
          left: '0px',
          top: '0px',
          background: '#F9FAFB',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-20"
          style={{
            width: '1440px',
            height: 'auto',
            position: 'relative',
            left: '0px',
            top: '0px',
          }}
        >
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            style={{
              width: '1200px',
              height: 'auto',
              position: 'relative',
              left: '120px',
              top: '0px',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow:
                '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E5E7EB',
              padding: '24px',
            }}
          >
            <div
              className="grid grid-cols-2 gap-8"
              style={{
                width: 'auto',
                height: 'auto',
                position: 'relative',
                left: '0px',
                top: '0px',
              }}
            >
              {/* Left Column - Product Images */}
              <div>
                <div
                  className="mb-4"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <div
                    className="w-full h-80 bg-gray-200 rounded-lg relative"
                    style={{
                      width: '576px',
                      height: '320px',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#F3F4F6',
                      borderRadius: '8px',
                    }}
                  >
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <svg
                        width="14"
                        height="16"
                        viewBox="0 0 14 16"
                        fill="none"
                        className="text-gray-600"
                      >
                        <path d="M0 0h14v16H0z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                  <div
                    className="flex gap-4 mt-4"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <div
                      className="w-35 h-21 border-2 border-blue-600 rounded-lg overflow-hidden"
                      style={{
                        width: '140px',
                        height: '84px',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        border: '2px solid #2563EB',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        className="w-full h-full bg-gray-200"
                        style={{
                          width: '140px',
                          height: '84px',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          background: '#F3F4F6',
                        }}
                      ></div>
                    </div>
                    <div
                      className="w-35 h-21 border border-gray-300 rounded-lg overflow-hidden"
                      style={{
                        width: '140px',
                        height: '84px',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        className="w-full h-full bg-gray-200"
                        style={{
                          width: '140px',
                          height: '84px',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          background: '#F3F4F6',
                        }}
                      ></div>
                    </div>
                    <div
                      className="w-35 h-21 border border-gray-300 rounded-lg overflow-hidden"
                      style={{
                        width: '140px',
                        height: '84px',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        className="w-full h-full bg-gray-200"
                        style={{
                          width: '140px',
                          height: '84px',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          background: '#F3F4F6',
                        }}
                      ></div>
                    </div>
                    <div
                      className="w-35 h-21 border border-gray-300 rounded-lg overflow-hidden"
                      style={{
                        width: '140px',
                        height: '84px',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        className="w-full h-full bg-gray-200"
                        style={{
                          width: '140px',
                          height: '84px',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          background: '#F3F4F6',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div>
                <div
                  className="flex items-center gap-2 mb-4"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <span
                    className="text-sm font-medium text-gray-600"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      lineHeight: '20px',
                      textAlign: 'left',
                      color: '#6B7280',
                    }}
                  >
                    Apple
                  </span>
                  <span
                    className="text-gray-400"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      color: '#9CA3AF',
                    }}
                  >
                    •
                  </span>
                  <div
                    className="flex items-center gap-1"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      className="text-yellow-400"
                      style={{
                        width: '16px',
                        height: '14px',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                      }}
                    >
                      <path
                        d="M8 0l2.5 7.5H16l-6 4.5 2.5 7.5L8 14l-6 4.5 2.5-7.5L0 7.5h5.5L8 0z"
                        fill="currentColor"
                      />
                    </svg>
                    <span
                      className="text-sm font-medium text-gray-900"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        lineHeight: '20px',
                        textAlign: 'left',
                        color: '#111827',
                      }}
                    >
                      4.8 (2,345 reviews)
                    </span>
                  </div>
                </div>

                <h1
                  className="text-3xl font-bold text-gray-900 mb-4"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                    fontFamily: 'Inter',
                    fontSize: '30px',
                    lineHeight: '36px',
                    textAlign: 'left',
                    color: '#111827',
                  }}
                >
                  iPhone 14 Pro - 256GB - Deep Purple
                </h1>

                <div
                  className="flex items-center gap-4 mb-4"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <span
                    className="text-3xl font-bold text-gray-900"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '30px',
                      lineHeight: '36px',
                      textAlign: 'left',
                      color: '#111827',
                    }}
                  >
                    $949.00
                  </span>
                  <span
                    className="text-lg text-gray-600 line-through"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '18px',
                      lineHeight: '28px',
                      textAlign: 'left',
                      color: '#6B7280',
                    }}
                  >
                    $1,099.00
                  </span>
                  <span
                    className="bg-green-500 text-white text-sm px-3 py-1 rounded-md"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      background: '#10B981',
                      borderRadius: '6px',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      lineHeight: '20px',
                      textAlign: 'center',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                    }}
                  >
                    Save $150 (14%)
                  </span>
                </div>

                <div
                  className="mb-6"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    left: '0px',
                    top: '0px',
                  }}
                >
                  <p
                    className="text-sm font-medium text-gray-700 mb-2"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      lineHeight: '20px',
                      textAlign: 'left',
                      color: '#374151',
                    }}
                  >
                    Available at:
                  </p>
                  <div
                    className="space-y-2"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      position: 'relative',
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <div
                      className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        position: 'relative',
                        left: '0px',
                        top: '0px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        padding: '8px',
                      }}
                    >
                      <div
                        className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          width: '24px',
                          height: '24px',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          background: '#2563EB',
                          borderRadius: '12px',
                        }}
                      >
                        A
                      </div>
                      <span
                        className="text-base font-medium text-gray-900"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          fontFamily: 'Inter',
                          fontSize: '16px',
                          lineHeight: '24px',
                          textAlign: 'left',
                          color: '#111827',
                        }}
                      >
                        Amazon
                      </span>
                      <span
                        className="ml-auto bg-green-500 text-white text-sm px-2 py-1 rounded"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          position: 'relative',
                          left: '0px',
                          top: '0px',
                          background: '#10B981',
                          borderRadius: '4px',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          lineHeight: '20px',
                          textAlign: 'center',
                          color: '#FFFFFF',
                          padding: '4px 8px',
                        }}
                      >
                        $949.00
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        T
                      </div>
                      <span className="text-base font-medium text-gray-900">
                        Target
                      </span>
                      <span className="ml-auto text-gray-600">$999.00</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        B
                      </div>
                      <span className="text-base font-medium text-gray-900">
                        Best Buy
                      </span>
                      <span className="ml-auto text-gray-600">$979.00</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <svg
                      width="14"
                      height="16"
                      viewBox="0 0 14 16"
                      fill="none"
                      className="text-white"
                    >
                      <path d="M0 0h14v16H0z" fill="currentColor" />
                    </svg>
                    Set Price Alert
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <svg
                      width="14"
                      height="16"
                      viewBox="0 0 14 16"
                      fill="none"
                      className="text-gray-600"
                    >
                      <path d="M0 0h14v16H0z" fill="currentColor" />
                    </svg>
                    Add to Compare
                  </button>
                </div>

                {/* Key Specifications */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Key Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-gray-600 mt-1"
                      >
                        <path
                          d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
                          fill="currentColor"
                        />
                        <path
                          d="M8 4v4l3 2"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Processor
                        </p>
                        <p className="text-sm text-gray-600">A16 Bionic</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        width="18"
                        height="16"
                        viewBox="0 0 18 16"
                        fill="none"
                        className="text-gray-600 mt-1"
                      >
                        <path
                          d="M2 0h14v2H2V0zm0 4h14v2H2V4zm0 4h14v2H2V8zm0 4h14v2H2v-2z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Storage
                        </p>
                        <p className="text-sm text-gray-600">256GB</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        width="12"
                        height="16"
                        viewBox="0 0 12 16"
                        fill="none"
                        className="text-gray-600 mt-1"
                      >
                        <path
                          d="M0 0h12v2H0V0zm0 4h12v2H0V4zm0 4h12v2H0V8zm0 4h12v2H0v-2z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Display
                        </p>
                        <p className="text-sm text-gray-600">
                          6.1" Super Retina XDR
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-gray-600 mt-1"
                      >
                        <path
                          d="M12 4H10V2H6v2H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Camera
                        </p>
                        <p className="text-sm text-gray-600">
                          48MP + 12MP + 12MP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price History Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-20">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Price History</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  7d
                </button>
                <button className="px-4 py-2 text-gray-600 rounded-full text-sm font-medium">
                  30d
                </button>
                <button className="px-4 py-2 text-gray-600 rounded-full text-sm font-medium">
                  90d
                </button>
                <button className="px-4 py-2 text-gray-4 py-2 text-gray-600 rounded-full text-sm font-medium">
                  1y
                </button>
              </div>
            </div>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Price history chart will be displayed here
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Comparison Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-20">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Price Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Retailer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Shipping
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          A
                        </div>
                        <span className="text-base font-medium text-gray-900">
                          Amazon
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-medium text-green-600">
                        $949.00
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">Free</td>
                    <td className="px-4 py-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        In Stock
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      5 mins ago
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View Deal
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          B
                        </div>
                        <span className="text-base font-medium text-gray-900">
                          Best Buy
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-medium text-gray-900">
                        $979.00
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">Free</td>
                    <td className="px-4 py-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        In Stock
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      1 hour ago
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View Deal
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          T
                        </div>
                        <span className="text-base font-medium text-gray-900">
                          Target
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-medium text-gray-900">
                        $999.00
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">Free</td>
                    <td className="px-4 py-4">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Limited Stock
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      3 hours ago
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View Deal
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          W
                        </div>
                        <span className="text-base font-medium text-gray-900">
                          Walmart
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-medium text-gray-900">
                        $999.00
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">$5.99</td>
                    <td className="px-4 py-4">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      5 hours ago
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-gray-400 cursor-not-allowed">
                        View Deal
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">
            Compare Products
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-blue-700">
                  Comparing 3 products
                </span>
                <div className="w-px h-6 bg-blue-300"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white border-2 border-blue-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-200"></div>
                  </div>
                  <div className="w-8 h-8 bg-white border-2 border-blue-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-200"></div>
                  </div>
                  <div className="w-8 h-8 bg-white border-2 border-blue-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Add Another Product
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
