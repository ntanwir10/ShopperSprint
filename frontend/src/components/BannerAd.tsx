import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const BannerAd: React.FC = () => {
  return (
    <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Get Price Drop Alerts
              </h3>
              <p className="text-blue-100 text-sm">
                Never miss a great deal! Set alerts for your favorite products.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="border-white hover:bg-white hover:text-blue-600 font-medium"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerAd;
