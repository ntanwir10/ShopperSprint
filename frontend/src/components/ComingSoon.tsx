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
  Clock,
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

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Launch date - 30 days from now
  const launchDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

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
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setIsSubscribed(false);
          setAlreadySubscribed(false);
        }, 5000);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-background to-purple-600/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-600/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-600/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-500" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Logo Container */}
              <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl">
                {/* Sprint Icon */}
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                {/* Logo Text */}
                <div className="text-white">
                  <div className="text-2xl font-bold tracking-tight">
                    Shopper<span className="text-orange-300">Sprint</span>
                  </div>
                  <div className="text-xs text-white/80 tracking-wider uppercase">
                    Price Tracker
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 -z-10"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <Badge
            variant="outline"
            className="mb-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20"
          >
            <Bell className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            ShopperSprint is Coming Soon
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Canada's smartest price comparison platform. Track prices, set
            alerts, and never overpay again. Get ready to sprint to the best
            deals!
          </p>
        </div>

        {/* Subscriber Count */}
        {subscriberCount > 0 && (
          <div className="mb-8">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
            >
              🎉 {subscriberCount}{' '}
              {subscriberCount === 1 ? 'person has' : 'people have'} joined the
              waitlist!
            </Badge>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300"
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: Search,
              title: 'Smart Search',
              description:
                'Find products across all major Canadian retailers instantly',
              color: 'text-blue-600',
            },
            {
              icon: DollarSign,
              title: 'Price Tracking',
              description:
                'Monitor price changes and get the best deals automatically',
              color: 'text-green-600',
            },
            {
              icon: AlertTriangle,
              title: 'Price Alerts',
              description: 'Get notified when your favorite items go on sale',
              color: 'text-orange-600',
            },
            {
              icon: BarChart3,
              title: 'Price History',
              description:
                'View detailed price trends and make informed decisions',
              color: 'text-purple-600',
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-${
                    feature.color.split('-')[1]
                  }-100 to-${feature.color.split('-')[1]}-200 dark:from-${
                    feature.color.split('-')[1]
                  }-900/30 dark:to-${
                    feature.color.split('-')[1]
                  }-800/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email Signup */}
        <Card className="bg-card/30 backdrop-blur-sm border-border/50 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Get Notified
            </CardTitle>
            <CardDescription>
              Get early access to Canada's best price tracking platform. No
              spam, just savings.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSubscribed ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {alreadySubscribed
                    ? "You're already on our waitlist! We'll notify you as soon as we launch."
                    : "Thanks for subscribing! We'll notify you when we launch."}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="flex-1 bg-background/50"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="submit"
                    className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? '...' : 'Notify Me'}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Launching {launchDate.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex justify-center items-center space-x-8 text-muted-foreground">
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
      </div>
    </div>
  );
};

export default ComingSoon;
