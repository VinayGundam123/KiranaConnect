import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, User, Menu, X, LogOut, Package, Heart, Bell, Settings, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/lib/theme';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // Update the document class when dark mode changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const handleSellerSignup = () => {
    navigate('/auth/seller-signup');
  };

  const handleLogout = async () => {
    try {
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/buyer');
  };

  const buyerNavItems = [
    { icon: Package, label: 'Orders', path: '/buyer/orders' },
    { icon: Heart, label: 'Wishlist', path: '/buyer/wishlist' },
    { icon: ShoppingBag, label: 'Cart', path: '/buyer/cart' },
    { icon: Bell, label: 'Notifications', path: '/buyer/notifications' },
    { icon: Settings, label: 'Settings', path: '/buyer/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={handleLogoClick} className="flex items-center">
              <Store className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">KiranaConnect</span>
            </button>
            
            {isHome ? (
              <nav className="hidden md:flex space-x-8">
                <Button variant="ghost" onClick={() => navigate('/how-it-works')}>
                  How it Works
                </Button>
                <Button variant="ghost" onClick={handleSellerSignup}>
                  For Sellers
                </Button>
                <Button variant="ghost" onClick={() => navigate('/about')}>
                  About Us
                </Button>
                <Button
                  variant="ghost"
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                {isAuthenticated ? (
                  <Button variant="primary" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleGetStarted}>
                    Get Started
                  </Button>
                )}
              </nav>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                {buyerNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate(item.path)}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {isHome ? (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/how-it-works');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      How it Works
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleSellerSignup();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      For Sellers
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/about');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      About Us
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-5 w-5 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                    {isAuthenticated ? (
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => {
                          handleGetStarted();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {buyerNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Button
                          key={item.path}
                          variant={isActive ? 'primary' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="h-5 w-5 mr-2" />
                          {item.label}
                        </Button>
                      );
                    })}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-5 w-5 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">KiranaConnect</h3>
              <p className="text-gray-400">Digitalizing local Kirana stores for a connected future.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/about')}
                  >
                    About Us
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/contact')}
                  >
                    Contact
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/careers')}
                  >
                    Careers
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/blog')}
                  >
                    Blog
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/terms')}
                  >
                    Terms of Service
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/privacy')}
                  >
                    Privacy Policy
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white transition-colors p-0"
                    onClick={() => navigate('/cookies')}
                  >
                    Cookie Policy
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}