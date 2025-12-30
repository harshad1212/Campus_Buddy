import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './css/ForgotPassword.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: "✅ Password reset link sent! Check your email." });
      } else {
        setMessage({ type: 'error', text: `❌ ${data.message}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "❌ Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <motion.div 
        className="forgot-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="forgot-title">Forgot Password?</h2>
        <form className="forgot-form" onSubmit={handleReset}>
          <input 
            type="email" 
            placeholder="Enter your registered email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <p className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </p>
        )}
        <p className="login-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
