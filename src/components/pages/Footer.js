import React from 'react';
import './css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Campus Buddy. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
