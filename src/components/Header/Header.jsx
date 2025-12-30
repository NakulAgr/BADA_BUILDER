import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import UserTypeModal from '../UserTypeModal/UserTypeModal';
import SearchBar from '../SearchBar/SearchBar';
import './Header.css';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Long Live dropdown items for long-term rentals
const longLiveItems = [
  { label: 'Browse Rental Properties', href: '/long-live/browse' },
  { label: 'Post Rental Property', href: '/long-live/post' }
];

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileLongLiveOpen, setMobileLongLiveOpen] = useState(false);
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const timeoutRef = useRef(null);
  const calctimeoutRef = useRef(null);
  const profileTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  // Use AuthContext instead of direct Firebase listener
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
    setLoading(authLoading);
  }, [currentUser, authLoading]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (calctimeoutRef.current) clearTimeout(calctimeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  // Manage body class for modal
  useEffect(() => {
    if (showLogoutModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showLogoutModal]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showLogoutModal) {
        cancelLogout();
      }
    };

    if (showLogoutModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showLogoutModal]);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);

    try {
      await signOut(auth);
      navigate('/');
      setIsMobileMenuOpen(false);
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Handle login click - reset form if already on login page
  const handleLoginClick = (e) => {
    if (location.pathname === '/login') {
      e.preventDefault();
      // Trigger form reset by navigating with state
      navigate('/login', { state: { resetForm: true } });
    }
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <header className="custom-header flex justify-between items-center px-3 md:px-6 py-3 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex-1 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#58335e]"></div>
        </div>
      </header>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setMobileLongLiveOpen(false);
    }
  };

  const toggleMobileLongLive = () => {
    setMobileLongLiveOpen(!mobileLongLiveOpen);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  // Profile dropdown handlers
  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setShowProfileDropdown(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setShowProfileDropdown(false);
    }, 150);
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    return userProfile?.name || currentUser?.displayName || 'User';
  };

  // Get user email
  const getUserEmail = () => {
    return userProfile?.email || currentUser?.email || '';
  };

  // Get user phone
  const getUserPhone = () => {
    return userProfile?.phone || 'Not provided';
  };

  return (
    <>
      <header className="custom-header flex justify-between items-center px-3 md:px-6 py-3 bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        {/* Logo */}
        <div className="logo-container flex-shrink-0">
          <Link to="/" className="logo-link inline-block transition-transform duration-200 hover:scale-105">
            <img src={logo} alt="Logo" className="logo-image h-10 md:h-12 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex items-center space-x-3 hidden lg:flex font-semibold text-gray-900">
          <Link
            to="/exhibition"
            className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
          >
            Exhibition
          </Link>

          <Link
            to="/services"
            className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
          >
            Services
          </Link>

          <Link
            to="/short-stay"
            className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
          >
            Short Stay
          </Link>

          {/* Long Live Dropdown */}
          <div
            className="relative inline-block text-left"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`nav-link cursor-pointer py-2 px-3 text-gray-900 transition-all duration-200 flex items-center gap-1 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 whitespace-nowrap ${showDropdown ? 'text-[#58335e] after:w-full' : 'hover:text-[#58335e] hover:after:w-full'}`}>
              Long Live
              <span className={`inline-block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-2 animate-fadeIn">
                {longLiveItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className="block px-5 py-3 text-sm text-gray-800 hover:bg-purple-50 hover:text-[#58335e] transition-all duration-150 border-l-4 border-transparent hover:border-[#58335e] font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/investments"
            className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
          >
            Investment
          </Link>

          <Link
            to="/100-months"
            className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
          >
            💰 100 Months
          </Link>

          <Link
            to="/contact"
            className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
          >
            Contact Us
          </Link>

          <Link
            to="/about"
            className="nav-link relative py-2 px-2 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
          >
            Who are we
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setIsUserTypeModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 font-medium text-sm tracking-wide transform hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Post Property
          </button>
          {isLoggedIn ? (
            <div
              className="relative"
              onMouseEnter={handleProfileMouseEnter}
              onMouseLeave={handleProfileMouseLeave}
            >
              <button className="profile-avatar">
                <span className="profile-initials">
                  {getUserInitials()}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">
                      {getUserInitials()}
                    </div>
                    <div className="profile-dropdown-info">
                      <div className="profile-dropdown-name">
                        {getUserDisplayName()}
                      </div>
                      <div className="profile-dropdown-email">
                        {getUserEmail()}
                      </div>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider"></div>

                  <div className="profile-dropdown-details">
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Name:</span>
                      <span className="profile-detail-value">{getUserDisplayName()}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Email:</span>
                      <span className="profile-detail-value">{getUserEmail()}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Phone:</span>
                      <span className="profile-detail-value">{getUserPhone()}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider"></div>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileDropdown(false);
                    }}
                    className="profile-dropdown-link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="profile-dropdown-logout"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" onClick={handleLoginClick}>
              <button className="bg-[#58335e] text-white px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#58335e] focus:ring-opacity-50 font-medium text-sm tracking-wide transform hover:scale-105 active:scale-95 whitespace-nowrap">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#58335e] transition-all duration-200"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-4 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-4 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-4 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <div
            className="absolute top-0 right-0 w-80 max-w-full h-full bg-white shadow-xl transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="mobile-menu-content">
              <nav className="mobile-nav">
                {/* Mobile Login/Profile */}
                {isLoggedIn ? (
                  <div className="mobile-profile-section">
                    <div className="mobile-profile-header">
                      <div className="mobile-profile-avatar">
                        {getUserInitials()}
                      </div>
                      <div className="mobile-profile-info">
                        <div className="mobile-profile-name">
                          {getUserDisplayName()}
                        </div>
                        <div className="mobile-profile-email">
                          {getUserEmail()}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-profile-details">
                      <div className="mobile-profile-detail">
                        <span className="mobile-detail-label">Name:</span>
                        <span className="mobile-detail-value">{getUserDisplayName()}</span>
                      </div>
                      <div className="mobile-profile-detail">
                        <span className="mobile-detail-label">Email:</span>
                        <span className="mobile-detail-value">{getUserEmail()}</span>
                      </div>
                      <div className="mobile-profile-detail">
                        <span className="mobile-detail-label">Phone:</span>
                        <span className="mobile-detail-value">{getUserPhone()}</span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={toggleMobileMenu}
                      className="mobile-view-profile-btn"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mobile-logout-btn"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={handleLoginClick} className="mobile-login-btn">
                    🔐 Login / Sign Up
                  </Link>
                )}

                {/* Post Property Button */}
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    setIsUserTypeModalOpen(true);
                  }}
                  className="mobile-post-btn"
                >
                  <span className="mobile-btn-icon">📝</span>
                  <span>Post Property</span>
                </button>

                {/* Regular Menu Items */}
                <Link to="/exhibition" onClick={toggleMobileMenu} className="mobile-menu-item">
                  Exhibition
                </Link>

                <Link to="/services" onClick={toggleMobileMenu} className="mobile-menu-item">
                  Services
                </Link>

                <Link to="/short-stay" onClick={toggleMobileMenu} className="mobile-menu-item">
                  Short Stay
                </Link>

                {/* Mobile Long Live Dropdown */}
                <div className="mobile-dropdown">
                  <button onClick={toggleMobileLongLive} className="mobile-dropdown-btn">
                    <span>Long Live</span>
                    <span className={`mobile-dropdown-icon ${mobileLongLiveOpen ? 'rotate' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {mobileLongLiveOpen && (
                    <div className="mobile-dropdown-content">
                      {longLiveItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.href}
                          onClick={toggleMobileMenu}
                          className="mobile-dropdown-item"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/investments"
                  onClick={toggleMobileMenu}
                  className="mobile-menu-item cursor-pointer"
                >
                  Investment
                </Link>

                <Link to="/100-months" onClick={toggleMobileMenu} className="mobile-menu-item">
                  💰 100 Months
                </Link>

                <Link to="/contact" onClick={toggleMobileMenu} className="mobile-menu-item">
                  Contact Us
                </Link>

                <Link to="/about" onClick={toggleMobileMenu} className="mobile-menu-item">
                  Who are we
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* User Type Modal */}
      <UserTypeModal
        isOpen={isUserTypeModalOpen}
        onClose={() => setIsUserTypeModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Logout</h3>
              <button
                onClick={cancelLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-lg text-gray-700 mb-2">
                Are you sure you want to logout?
              </p>
              <p className="text-sm text-gray-500">
                You will need to login again to access your account.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelLogout}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                disabled={logoutLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={logoutLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {logoutLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Yes, Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
