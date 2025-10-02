import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Add registration logic here
    alert(`Registered with Email: ${email}`);
  };

  return (
    <div className="register-container">
      <h2>Create Your Account</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required
        />
        <button type="submit">Register</button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Already have an account? <Link to="/login" style={{ color: '#fff', fontWeight: 'bold' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;
