import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import logo from "../../assets/logo.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const quickLinks = [
    { label: "Book a Site Visit", href: "/booksitevisit" },
    { label: "Exhibition", href: "/exhibition" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/subscription-plans" },
    { label: "Contact Us", href: "/contact" },
  ];

  const resourceLinks = [
    { label: "Post Property", href: "/post-property" },
    { label: "Live Grouping", href: "/exhibition/live-grouping" },
    { label: "Investments", href: "/investments" },
    { label: "Login / Sign Up", href: "/login" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <footer className="mx-4 mb-4">
      {/* CTA Section */}
      <div className="bg-gray-900 rounded-t-3xl py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400 italic mb-4">— Available to work —</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's <span className="text-gray-400">Connect</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Feel free to contact us if you have any questions. 
            We're available for new projects or just for chatting.
          </p>
          <Link to="/contact">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full gap-2">
              Book a Meeting <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="bg-gray-900 rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <img src={logo} alt="Bada Builder" className="h-12 brightness-0 invert" />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Designing dreams into reality. From concept to creation, we deliver 
                elegant and functional spaces that reflect your vision.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link 
                      to={href}
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Resources</h3>
              <ul className="space-y-3">
                {resourceLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link 
                      to={href}
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span>Mumbai, Maharashtra, India</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Phone className="w-5 h-5 text-white shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Mail className="w-5 h-5 text-white shrink-0" />
                  <span>hello@badabuilder.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Bada Builder. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
