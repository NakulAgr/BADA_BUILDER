import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import logo from "../../assets/logo.png"; // adjust the path as per your project structure
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Updated Logo Section */}
        <div>
          <div className="footer-logo-container mb-4">
            <Link to="/" className="footer-logo-link">
              <img src={logo} alt="Logo" className="footer-logo-image h-10" />
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            Designing dreams into reality. From concept to creation, we deliver elegant and functional spaces that reflect your vision.
          </p>

          <div className="flex justify-center space-x-4 mt-4">
  <a href="#" className="social-icon"><FaInstagram /></a>
  <a href="#" className="social-icon"><FaFacebookF /></a>
  <a href="#" className="social-icon"><FaLinkedinIn /></a>
  <a href="#" className="social-icon"><FaYoutube /></a>
</div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-medium mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/book-site-visit" className="footer-link">Book a Site Visit</Link></li>
            <li><Link to="/projects" className="footer-link">Projects</Link></li>
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            <li><Link to="/about" className="footer-link">About Us</Link></li>
          </ul>
        </div>

        {/* Optional Column */}
        <div className="hidden md:block"></div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} YourBrand. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
