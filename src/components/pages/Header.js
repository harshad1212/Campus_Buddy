import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: clear auth data (localStorage/session) if using real auth
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">Campus Buddy</div>
      <nav>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/resources">Resources</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/chat">Chat</Link></li>
          <li><Link to="/study-groups">Study Groups</Link></li>
          <li><Link to="/forum">Forum</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
