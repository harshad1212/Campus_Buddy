import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './css/ResetPassword.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/password/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok) setMessage({ type: 'success', text: "✅ Password reset successfully. You can now login." });
      else setMessage({ type: 'error', text: `❌ ${data.message}` });
    } catch (err) {
      setMessage({ type: 'error', text: "❌ Something went wrong." });
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
        <h2 className="forgot-title">Reset Password</h2>
        <form className="forgot-form" onSubmit={handleSubmit}>
          <input 
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <p className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </p>
        )}
        <p className="login-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
