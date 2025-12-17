import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Plus, ChevronDown, Calculator, GraduationCap, Home, Building2, Phone, Users, Search } from 'lucide-react';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import logo from '../../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isAuthenticated, logout, isSubscribed } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
    <header className="sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Nav Row */}
        <div className={cn(
          "flex items-center justify-between h-16 px-6 my-2 rounded-full transition-all duration-300",
          scrolled ? "bg-white shadow-lg border border-gray-100" : "bg-gray-50"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Bada Builder" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
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
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handlePostProperty}
              className="hidden sm:flex gap-2 bg-gray-900 text-white hover:bg-gray-800 rounded-full"
            >
              <Plus className="w-4 h-4" />
              Post Property
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <Avatar className="h-8 w-8 bg-gray-900 text-white">
                      <AvatarFallback className="bg-gray-900 text-white text-sm">
                        {userData?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg rounded-xl">
                  <DropdownMenuItem className="text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    {userData?.name || 'User'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="hidden md:flex items-center justify-center pb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-full"
              />
            </div>
            <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full h-10 px-6">
              Search
            </Button>
          </form>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
