import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      // Optionally persist expiresAt if needed
      // Redirect to home or previous page
      navigate('/');
    } else if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [params, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center text-foreground flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Completing sign-in...
      </div>
    </div>
  );
};

export default OAuthCallback;
