import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm md:text-base">
          &copy; {new Date().getFullYear()} Campus Buddy. All rights reserved.
        </p>

        <div className="flex gap-4">
          <Link to="/contact" className="hover:text-gray-200 transition">
              Privacy Policy
          </Link>
          <Link to="/contact" className="hover:text-gray-200 transition">
              Terms of Service
          </Link>
          
          <Link to="/contact" className="hover:text-gray-200 transition">
              Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
