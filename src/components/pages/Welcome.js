import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './css/Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-wrapper">
      <motion.div
        className="welcome-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Campus Buddy
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your smart campus companion.
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/login">
            <button className="start-btn">Get Started</button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
