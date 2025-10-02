import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './css/Welcome.css';
const Welcome = () => {
  return (
    <div className="welcome-container">
      {/* Animate title */}
      <motion.h1
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: 'spring', stiffness: 50 }}
      >
        Campus Buddy
      </motion.h1>

      {/* Animate subtitle */}
      <motion.p
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
        Welcome to your ultimate campus management companion!
      </motion.p>

      {/* Animate button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <Link to="/login">
          <button className="start-btn">Get Started</button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Welcome;
