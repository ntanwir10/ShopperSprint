import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onSearch: (query: string) => void;
  showSearchBar?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-[#5482ef] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              PricePulse
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/compare')}
            >
              Compare
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate('/alerts')}
            >
              Alerts
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                navigate('/compare');
                setIsMobileMenuOpen(false);
              }}
            >
              Compare
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start relative"
              onClick={() => {
                navigate('/alerts');
                setIsMobileMenuOpen(false);
              }}
            >
              Alerts
              <Badge className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
