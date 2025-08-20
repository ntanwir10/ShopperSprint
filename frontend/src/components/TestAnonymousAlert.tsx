import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import AnonymousPriceAlert from './AnonymousPriceAlert';

const TestAnonymousAlert: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          Test Anonymous Price Alert System
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Product 1 */}
          <Card>
            <CardHeader>
              <CardTitle>iPhone 15 Pro</CardTitle>
              <CardDescription>Test price alert for iPhone 15 Pro</CardDescription>
            </CardHeader>
            <CardContent>
              <AnonymousPriceAlert 
                productId="test-iphone-15-pro"
                productName="iPhone 15 Pro"
                currentPrice={99900} // $999.00 in cents
                onSuccess={() => console.log('Alert created for iPhone 15 Pro')}
              />
            </CardContent>
          </Card>

          {/* Test Product 2 */}
          <Card>
            <CardHeader>
              <CardTitle>MacBook Air M2</CardTitle>
              <CardDescription>Test price alert for MacBook Air M2</CardDescription>
            </CardHeader>
            <CardContent>
              <AnonymousPriceAlert 
                productId="test-macbook-air-m2"
                productName="MacBook Air M2"
                currentPrice={119900} // $1,199.00 in cents
                onSuccess={() => console.log('Alert created for MacBook Air M2')}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            This page is for testing the anonymous price alert system. 
            Try creating alerts for these test products to verify the functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestAnonymousAlert;
