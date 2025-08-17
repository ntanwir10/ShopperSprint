import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { apiClient } from '../lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validate token with backend
          const response = await apiClient.validateToken(token);
          if (response.data) {
            setAuthState({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token');
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('auth_token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();

    // React to auth_token changes across tabs or when localStorage is cleared
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiClient.login({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.user && response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (
    userData: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiClient.register(userData);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.user && response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const verifyEmail = async (
    token: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.verifyEmail(token);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // Update user state if email verification was successful
      if (response.data?.user) {
        setAuthState((prev) => ({
          ...prev,
          user: response.data.user,
        }));
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Email verification failed. Please try again.',
      };
    }
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.forgotPassword(email);

      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: 'Failed to send reset email. Please try again.',
      };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.resetPassword(token, newPassword);

      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Password reset failed. Please try again.',
      };
    }
  };

  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.updateProfile(updates);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.user) {
        setAuthState((prev) => ({
          ...prev,
          user: response.data.user,
        }));
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Profile update failed. Please try again.',
      };
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
