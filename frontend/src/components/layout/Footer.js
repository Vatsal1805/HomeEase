import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-primary-400 mb-4">HomeEase</h3>
            <p className="text-gray-300 mb-4">
              Making home services easy and accessible for everyone. Professional services at your fingertips.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/services?category=plumbing"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Plumbing
                </Link>
              </li>
              <li>
                <Link
                  to="/services?category=electrical"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Electrical
                </Link>
              </li>
              <li>
                <Link
                  to="/services?category=cleaning"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cleaning
                </Link>
              </li>
              <li>
                <Link
                  to="/services?category=carpentry"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Carpentry
                </Link>
              </li>
              <li>
                <Link
                  to="/services?category=ac-service"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  AC Service
                </Link>
              </li>
              <li>
                <Link
                  to="/services?category=painting"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Painting
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="#careers"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <i className="fas fa-phone text-primary-400 mr-3"></i>
                <span className="text-gray-300">+91 9876543210</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-envelope text-primary-400 mr-3"></i>
                <span className="text-gray-300">support@homeease.com</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary-400 mr-3 mt-1"></i>
                <span className="text-gray-300">
                  123 Service Street,<br />
                  Tech City, TC 12345
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 HomeEase. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#privacy"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#cookies"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
