import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-20">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <svg
                  width="18"
                  height="24"
                  viewBox="0 0 18 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M9 0C4.03 0 0 4.03 0 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"
                    fill="currentColor"
                  />
                  <path
                    d="M9 3v6l4.5 2.7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                PricePulse
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Compare
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Alerts
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Trending
              </a>
            </nav>
          </div>

          {/* Right side - Status and Actions */}
          <div className="flex items-center gap-4">
            {/* API Status */}
            <div className="bg-green-100 px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-800">API: Online</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-10 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle theme"
            >
              <svg
                width="14"
                height="20"
                viewBox="0 0 14 20"
                fill="none"
                className="text-gray-600"
              >
                <path d="M0 0h14v20H0z" fill="currentColor" />
              </svg>
            </button>

            {/* Settings */}
            <button
              className="w-7 h-10 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              aria-label="Settings"
            >
              <svg
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                className="text-gray-600"
              >
                <path d="M0 0h12v20H0z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
