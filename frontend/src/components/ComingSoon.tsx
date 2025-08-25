import React, { useState, useEffect } from 'react';
import {
  Mail,
  Bell,
  Zap,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Search,
  DollarSign,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { waitlistAPI } from '../lib/api';

interface WaitlistStats {
  currentlySubscribed: number;
  totalSubscribers: number;
  todaySubscribers: number;
  weekSubscribers: number;
}

const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  // Fetch initial stats
  useEffect(() => {
    fetchWaitlistStats();
  }, []);

  const fetchWaitlistStats = async () => {
    try {
      const data = (await waitlistAPI.getStats()) as any;
      if (data.success) {
        setStats(data.data);
        setSubscriberCount(data.data.currentlySubscribed);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist stats:', error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const data = (await waitlistAPI.subscribe(
        email,
        'coming_soon_page'
      )) as any;

      if (data.success) {
        setIsSubscribed(true);
        setAlreadySubscribed(data.alreadySubscribed || false);
        setEmail('');

        // Refresh stats to get updated count
        await fetchWaitlistStats();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setIsSubscribed(false);
          setAlreadySubscribed(false);
        }, 5000);
      } else {
        setEmailError(
          data.message || 'Failed to join waitlist. Please try again.'
        );
      }
    } catch (error) {
      console.error('Waitlist subscription error:', error);
      setEmailError(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.08),transparent_50%)]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-600/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-600/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-500" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* Logo Container */}
              <div className="flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
                {/* Sprint Icon */}
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Logo Text */}
                <div className="text-white">
                  <div className="text-3xl font-bold tracking-tight">
                    Shopper<span className="text-orange-300">Sprint</span>
                  </div>
                  <div className="text-sm text-white/80 tracking-wider uppercase">
                    Price Tracker
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 -z-10"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-16">
          <Badge
            variant="outline"
            className="mb-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20 px-4 py-2 text-sm"
          >
            <Bell className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            ShopperSprint is Coming Soon
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-16 leading-relaxed">
            Canada's smartest price comparison platform. Track prices, set
            alerts, and never overpay again. Get ready to sprint to the best
            deals!
          </p>
        </div>

        {/* Subscriber Count */}
        {subscriberCount > 0 && (
          <div className="mb-12">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 px-6 py-3 text-base"
            >
              🎉 {subscriberCount}{' '}
              {subscriberCount === 1 ? 'person has' : 'people have'} joined the
              waitlist!
            </Badge>
            {stats && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-4">
                  📈 {stats.weekSubscribers} this week
                </span>
                <span>📊 {stats.totalSubscribers} total signups</span>
              </div>
            )}
          </div>
        )}

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Search,
              title: 'Smart Search',
              description:
                'Find products across all major Canadian retailers instantly',
              color: 'text-blue-600',
              bgColor: 'from-blue-100 to-blue-200',
              darkBgColor: 'from-blue-900/30 to-blue-800/30',
            },
            {
              icon: DollarSign,
              title: 'Price Tracking',
              description:
                'Monitor price changes and get the best deals automatically',
              color: 'text-green-600',
              bgColor: 'from-green-100 to-green-200',
              darkBgColor: 'from-green-900/30 to-green-800/30',
            },
            {
              icon: AlertTriangle,
              title: 'Price Alerts',
              description: 'Get notified when your favorite items go on sale',
              color: 'text-orange-600',
              bgColor: 'from-orange-100 to-orange-200',
              darkBgColor: 'from-orange-900/30 to-orange-800/30',
            },
            {
              icon: BarChart3,
              title: 'Price History',
              description:
                'View detailed price trends and make informed decisions',
              color: 'text-purple-600',
              bgColor: 'from-purple-100 to-purple-200',
              darkBgColor: 'from-purple-900/30 to-purple-800/30',
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 group shadow-lg hover:shadow-xl"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.bgColor} dark:${feature.darkBgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email Signup */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/20 dark:border-gray-700/20 max-w-lg mx-auto shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center gap-3 justify-center text-2xl">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Get Notified
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              Get early access to Canada's best price tracking platform. No
              spam, just savings.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            {isSubscribed ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200 text-base">
                  {alreadySubscribed
                    ? "You're already on our waitlist! We'll notify you as soon as we launch."
                    : "Thanks for subscribing! We'll notify you when we launch."}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className="flex-1 bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 text-base py-3"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : 'Notify Me'}
                  </Button>
                </div>

                {emailError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="text-base">
                      {emailError}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-16 flex items-center justify-center">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20 px-6 py-3 text-base"
          >
            Launching Soon
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
