import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    }
  }, [token]);

  const verifyEmailToken = async () => {
    if (!token) return;

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setError(result.error || 'Email verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Verification Link</h2>
          <p className="text-muted-foreground mb-4">
            The email verification link is invalid or has expired.
          </p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Verifying Email</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
          <p className="text-muted-foreground mb-4">
            Your email has been successfully verified. You will be redirected to your profile shortly.
          </p>
          <p className="text-sm text-muted-foreground">
            You can now access all features of your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              Verify your email address to complete your account setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the button below to verify your email address.
              </p>
              
              <Button
                onClick={verifyEmailToken}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
