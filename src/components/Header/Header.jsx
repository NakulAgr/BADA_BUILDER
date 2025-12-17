import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Plus, ChevronDown, Calculator, Search } from 'lucide-react';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import logo from '../../assets/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isAuthenticated, logout, isSubscribed, currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Close search and profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchExpanded && !e.target.closest('.search-container')) {
        setSearchExpanded(false);
      }
      if (showProfileDropdown && profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchExpanded, showProfileDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Helper functions for user data
  const getUserInitials = () => {
    if (userData?.name) {
      return userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    return userData?.name || currentUser?.displayName || 'User';
  };

  const getUserEmail = () => {
    return userData?.email || currentUser?.email || 'No email';
  };

  const getUserPhone = () => {
    return userData?.phone || currentUser?.phoneNumber || 'Not provided';
  };

  const handlePostProperty = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/post-property' } });
    } else if (!isSubscribed) {
      navigate('/subscription-plans');
    } else {
      navigate('/post-property');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchExpanded(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/exhibition', label: 'Properties' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
  ];

  const learnLinks = [
    { to: '/investments', label: 'REITs Investment' },
    { to: '/working', label: 'How It Works' },
  ];

  const calculatorLinks = [
    { to: '/npv-calculator', label: 'NPV Calculator' },
    { to: '/dcf-calculator', label: 'DCF Calculator' },
  ];

  return (
    <header className="sticky top-5 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Nav Row - Pill shaped */}
        <div className={cn(
          "relative flex items-center justify-between h-16 px-6 my-2 rounded-full transition-all duration-300",
          scrolled ? "bg-white shadow-lg border border-gray-100" : "bg-gray-50"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Bada Builder" className="h-8" />
          </Link>

          {/* Desktop Navigation - Hidden when search expanded */}
          <AnimatePresence>
            {!searchExpanded && (
              <motion.nav 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden lg:flex items-center gap-1"
              >
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => cn(
                      "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                      isActive 
                        ? "border border-gray-900 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Learn Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      Learn <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-xl">
                    {learnLinks.map((link) => (
                      <DropdownMenuItem key={link.to} asChild>
                        <Link to={link.to} className="text-gray-700 hover:text-gray-900">{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Calculator Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Calculator className="w-4 h-4" /> Calculator <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-xl">
                    {calculatorLinks.map((link) => (
                      <DropdownMenuItem key={link.to} asChild>
                        <Link to={link.to} className="text-gray-700 hover:text-gray-900">{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.nav>
            )}
          </AnimatePresence>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {!searchExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Button 
                    onClick={handlePostProperty}
                    className="hidden sm:flex gap-2 bg-gray-900 text-white hover:bg-gray-800 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                    Post Property
                  </Button>

                  {isAuthenticated ? (
                    <div className="relative" ref={profileDropdownRef}>
                      <button 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Avatar className="h-8 w-8 bg-gray-900 text-white">
                          <AvatarFallback className="bg-gray-900 text-white text-sm">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </button>

                      <AnimatePresence>
                        {showProfileDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="profile-dropdown absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-xl z-50"
                          >
                          <div className="profile-dropdown-header p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="profile-dropdown-avatar w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold">
                                {getUserInitials()}
                              </div>
                              <div className="profile-dropdown-info flex-1">
                                <div className="profile-dropdown-name font-semibold text-gray-900">
                                  {getUserDisplayName()}
                                </div>
                                <div className="profile-dropdown-email text-sm text-gray-600">
                                  {getUserEmail()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="profile-dropdown-divider"></div>

                          <div className="profile-dropdown-details p-4 space-y-3">
                            <div className="profile-detail-item flex justify-between">
                              <span className="profile-detail-label text-sm font-medium text-gray-500">Name:</span>
                              <span className="profile-detail-value text-sm text-gray-900">{getUserDisplayName()}</span>
                            </div>
                            <div className="profile-detail-item flex justify-between">
                              <span className="profile-detail-label text-sm font-medium text-gray-500">Email:</span>
                              <span className="profile-detail-value text-sm text-gray-900">{getUserEmail()}</span>
                            </div>
                            <div className="profile-detail-item flex justify-between">
                              <span className="profile-detail-label text-sm font-medium text-gray-500">Phone:</span>
                              <span className="profile-detail-value text-sm text-gray-900">{getUserPhone()}</span>
                            </div>
                          </div>

                          <div className="profile-dropdown-divider border-t border-gray-100"></div>

                          <div className="p-2">
                            <button 
                              onClick={handleLogout}
                              className="profile-dropdown-logout w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Logout
                            </button>
                          </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate('/login')}
                      className="gap-2 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 bg-gray-50 border-gray-200 rounded-full"
                  />
                </div>
                <Button type="submit" size="sm" className="bg-gray-900 text-white rounded-full">
                  Search
                </Button>
              </form>

              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
              <Button onClick={handlePostProperty} className="w-full mt-4 bg-gray-900 text-white hover:bg-gray-800 rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Post Property
              </Button>

              {/* Mobile Profile Section */}
              {isAuthenticated && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{getUserDisplayName()}</div>
                      <div className="text-xs text-gray-600">{getUserEmail()}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900">{getUserPhone()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full mt-4 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
