import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

const UnsubscribePage = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const hasUnsubscribed = useRef(false); // Prevent double API calls

  useEffect(() => {
    const unsubscribeUser = async () => {
      // Prevent double execution in React Strict Mode
      if (hasUnsubscribed.current) {
        return;
      }
      hasUnsubscribed.current = true;

      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link. No token provided.');
        return;
      }

      try {
        console.log('🔄 Attempting to unsubscribe with token:', token.substring(0, 8) + '...');
        
        const response = await fetch('/api/waitlist/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        console.log('📧 Unsubscribe response:', { success: data.success, status: response.status });

        if (data.success) {
          setStatus('success');
          setMessage('You have been successfully unsubscribed from our waitlist.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to unsubscribe. Please try again.');
        }
      } catch (error) {
        console.error('❌ Unsubscribe error:', error);
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    unsubscribeUser();
  }, []); // Empty dependency array

  return (
    <>
      <Helmet>
        <title>Unsubscribe - ShopperSprint</title>
        <meta name="description" content="Unsubscribe from ShopperSprint waitlist" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
            {/* Logo */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                🛒 ShopperSprint
              </h1>
              <p className="text-gray-600">Canada's Smartest Price Comparison Platform</p>
            </div>

            {/* Status Content */}
            {status === 'loading' && (
              <div className="animate-pulse">
                <div className="text-4xl mb-4">⏳</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing...</h2>
                <p className="text-gray-600">Please wait while we unsubscribe you from our waitlist.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="animate-bounce-in">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-semibold text-green-600 mb-2">Successfully Unsubscribed</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm">
                    We're sorry to see you go! If you change your mind, you can always sign up again on our website.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="animate-shake">
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-xl font-semibold text-red-600 mb-2">Unsubscribe Failed</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    If you continue to have issues, please contact us directly.
                  </p>
                </div>
              </div>
            )}

            {/* Back to Home Button */}
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                ← Back to ShopperSprint
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </>
  );
};

export default UnsubscribePage;
