import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    // Add password reset logic here
    alert(`Password reset link sent to: ${email}`);
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password?</h2>
      <form className="forgot-form" onSubmit={handleReset}>
        <input 
          type="email" 
          placeholder="Enter your registered email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Remembered your password? <Link to="/login" style={{ color: '#fff', fontWeight: 'bold' }}>Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
