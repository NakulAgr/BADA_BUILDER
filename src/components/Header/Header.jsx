import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Header.css';

const calcdropdownItems = [
  { label: "Funds from Operations (FFO)", href: "/calculator/FFO" },
  { label: "Adjusted Funds from Operations (AFFO)", href: "/calculator/AFFO" },
  { label: "Net Operating Income (NOI)", href: "/calculator/NOI" },
  { label: "Cap Rate (Capitalization Rate)", href: "/calculator/CapRate" },
  { label: "Net Asset Value (NAV)", href: "/calculator/NAV" },
  { label: "Loan-to-Value Ratio (LTV)", href: "/calculator/LTV" },
  { label: "Dividend Yield", href: "/calculator/DividendYield" },
  { label: "Payout Ratio (based on AFFO)", href: "/calculator/PayoutRatio" },
  { label: "Debt Service Coverage Ratio (DSCR)", href: "/calculator/DSCR" },
  { label: "Internal Rate of Return (IRR)", href: "/calculator/IRR" },
  { label: "Total Return", href: "/calculator/TotalReturn" },
  { label: "Occupancy Rate", href: "/calculator/OccupancyRate" },
  { label: "EBITDAre", href: "/calculator/EBITDAre" },
  { label: "Price-to-FFO Ratio (P/FFO)", href: "/calculator/PFFO" },
  { label: "Discounted Cash Flow (DCF)", href: "/calculator/DCF" },
  { label: "Net Property Value (NPV)", href: "/calculator/NPV" },
];

const dropdownItems = [
  { label: 'Lease and asset management', href: '/learn/lease-and-asset-management' },
  { label: 'Market and investment analysis', href: '/learn/market-and-investment-analysis' },
  { label: 'Real estate financial modelling', href: '/learn/real-estate-financial-modelling' },
  { label: 'Real estate market research', href: '/learn/real-estate-market-research' },
  { label: 'Reit valuation and compliance', href: '/learn/reit-valuation-and-compliance' },
  { label: 'Risk assessment & due diligence', href: '/learn/risk-assessment-due-diligence' },
  { label: 'Stakeholder communication in Reit', href: '/learn/stakeholder-communication' },
  { label: 'Types of Reits in India', href: '/learn/types-of-reits-india' },
  { label: 'Taxation in Reits', href: '/learn/taxation-in-reits' },
  { label: 'Types Job profiles in Reits', href: '/learn/job-profiles-in-reits' },
  { label: 'Work of Different job profiles', href: '/learn/work-of-job-profiles' }
];

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [CaclshowDropdown, setCaclShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [mobileCalcOpen, setMobileCalcOpen] = useState(false);

  const timeoutRef = useRef(null);
  const calctimeoutRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close mobile submenus when main menu closes
    if (isMobileMenuOpen) {
      setMobileLearnOpen(false);
      setMobileCalcOpen(false);
    }
  };

  const toggleMobileLearn = () => {
    setMobileLearnOpen(!mobileLearnOpen);
  };

  const toggleMobileCalc = () => {
    setMobileCalcOpen(!mobileCalcOpen);
  };

  const calchandleMouseEnter = () => {
    if (calctimeoutRef.current) clearTimeout(calctimeoutRef.current);
    setCaclShowDropdown(true);
  };

  const calchandleMouseLeave = () => {
    calctimeoutRef.current = setTimeout(() => {
      setCaclShowDropdown(false);
    }, 150);
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (calctimeoutRef.current) clearTimeout(calctimeoutRef.current);
    };
  }, []);

  return (
    <>
      <header className="custom-header flex justify-between items-center px-2 md:px-8 py-5 bg-white rounded-2xl border-b border-gray-100 relative">
        {/* Logo */}
        <div className="logo-container flex-shrink-0">
          <Link to="/" className="logo-link inline-block transition-transform duration-200 hover:scale-105">
            <img src={logo} alt="Logo" className="logo-image h-10 md:h-12 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex items-center space-x-10 hidden lg:flex font-medium text-gray-700">
          <Link 
            to="/exhibition" 
            className="nav-link relative py-2 px-1 hover:text-gray-900 transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
          >
            Exhibition
          </Link>
          
          <Link 
            to="/investments" 
            className="nav-link relative py-2 px-1 hover:text-gray-900 transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
          >
            Investment
          </Link>

          {/* Learn Reit's Dropdown menu */}
          <div
            className="relative inline-block text-left"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`nav-link cursor-pointer py-2 px-1 transition-all duration-200 flex items-center gap-1 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 ${showDropdown ? 'text-gray-900 after:w-full' : 'hover:text-gray-900 hover:after:w-full'}`}>
              Learn Reit's 
              <span className={`inline-block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu absolute left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-2 animate-fadeIn">
                <div className="max-h-96 overflow-y-auto">
                  {dropdownItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className="block px-5 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#58335e] transition-all duration-150 border-l-4 border-transparent hover:border-[#58335e] font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calculator Dropdown menu */}
          <div
            className="relative inline-block text-left"
            onMouseEnter={calchandleMouseEnter}
            onMouseLeave={calchandleMouseLeave}
          >
            <div className={`nav-link cursor-pointer py-2 px-1 transition-all duration-200 flex items-center gap-1 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 ${CaclshowDropdown ? 'text-gray-900 after:w-full' : 'hover:text-gray-900 hover:after:w-full'}`}>
              Calculator 
              <span className={`inline-block transition-transform duration-200 ${CaclshowDropdown ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>

            {CaclshowDropdown && (
              <div className="dropdown-menu absolute left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-2 animate-fadeIn">
                <div className="max-h-96 overflow-y-auto">
                  {calcdropdownItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className="block px-5 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#58335e] transition-all duration-150 border-l-4 border-transparent hover:border-[#58335e] font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link 
            to="/contact" 
            className="nav-link relative py-2 px-1 hover:text-gray-900 transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
          >
            Contact Us
          </Link>
          
          <Link 
            to="/about" 
            className="nav-link relative py-2 px-1 hover:text-gray-900 transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
          >
            Who are we
          </Link>
        </nav>

        {/* Desktop Login Button */}
        <div className="hidden lg:flex flex-shrink-0">
          <Link to="/login">
            <button className="bg-[#58335e] text-white px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#58335e] focus:ring-opacity-50 font-medium text-sm tracking-wide transform hover:scale-105 active:scale-95">
              Login
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-1">
          {/* Mobile Login Button */}
          <Link to="/login">
            <button className="bg-[#58335e] text-white px-2 md:px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#58335e] focus:ring-opacity-50 font-medium text-xs tracking-wide">
              Login
            </button>
          </Link>
          
          {/* Hamburger Menu */}
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
            <div className="px-6 py-4 overflow-y-auto h-full">
              <nav className="space-y-2">
                <Link 
                  to="/exhibition" 
                  onClick={toggleMobileMenu}
                  className="block py-3 px-3 text-gray-700 hover:text-[#58335e] hover:bg-purple-50 rounded-md transition-all duration-200 font-medium"
                >
                  Exhibition
                </Link>
                
                <Link 
                  to="/investments" 
                  onClick={toggleMobileMenu}
                  className="block py-3 px-3 text-gray-700 hover:text-[#58335e] hover:bg-purple-50 rounded-md transition-all duration-200 font-medium"
                >
                  Investment
                </Link>

                {/* Mobile Learn Reit's Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleMobileLearn}
                    className="w-full flex justify-between items-center py-3 px-3 text-gray-700 hover:text-[#58335e] hover:bg-purple-50 rounded-md transition-all duration-200 font-medium"
                  >
                    Learn Reit's
                    <span className={`transform transition-transform duration-200 ${mobileLearnOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>
                  
                  {mobileLearnOpen && (
                    <div className="pl-4 space-y-1 animate-fadeIn">
                      {dropdownItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.href}
                          onClick={toggleMobileMenu}
                          className="block py-2 px-3 text-sm text-gray-600 hover:text-[#58335e] hover:bg-purple-25 rounded-md transition-all duration-150"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Calculator Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={toggleMobileCalc}
                    className="w-full flex justify-between items-center py-3 px-3 text-gray-700 hover:text-[#58335e] hover:bg-purple-50 rounded-md transition-all duration-200 font-medium"
                  >
                    Calculator
                    <span className={`transform transition-transform duration-200 ${mobileCalcOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>
                  
                  {mobileCalcOpen && (
                    <div className="pl-4 space-y-1 animate-fadeIn max-h-64 overflow-y-auto">
                      {calcdropdownItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.href}
                          onClick={toggleMobileMenu}
                          className="block py-2 px-3 text-sm text-gray-600 hover:text-[#58335e] hover:bg-purple-25 rounded-md transition-all duration-150"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link 
                  to="/contact" 
                  onClick={toggleMobileMenu}
                  className="block py-3 px-3 text-gray-700 hover:text-[#58335e] hover:bg-purple-50 rounded-md transition-all duration-200 font-medium"
                >
                  Contact Us
                </Link>
                
                <Link 
                  to="/about" 
                  onClick={toggleMobileMenu}
                  className="block py-3 px-3 text-gray-700 hover:text-[#58335e] hover:bg-purple-50 rounded-md transition-all duration-200 font-medium"
                >
                  Who are we
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;