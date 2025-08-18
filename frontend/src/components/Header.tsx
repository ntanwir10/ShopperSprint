import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

import { ThemeToggle } from './ThemeToggle';
import { Menu, X, TestTube } from 'lucide-react';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-foreground">
              PricePulse
            </span>
          </Link>

          {/* Desktop Navigation - simplified (removed Home/Compare) */}
          <nav className="hidden md:flex items-center space-x-6" />

          {/* Search Bar removed from header by default */}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Test Link (Development Only) */}
            <Link
              to="/test-alerts"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline-block">Test Alerts</span>
            </Link>

            {/* Theme Toggle moved to the far right */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar removed */}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/test-alerts"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Test Alerts
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
