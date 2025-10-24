import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie"; 


const Header = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("chatUser");

  // ✅ Optionally remove localStorage token if exists
  localStorage.removeItem("token");

  // ✅ Reset user state
  if (setCurrentUser) setCurrentUser(null);

  // ✅ Redirect
  navigate("/login", { replace: true });

  alert("Logged out successfully!");
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-teal-400 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-2xl font-bold">
            <Link to="/home">Campus Buddy</Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/home" className="hover:text-gray-200 transition">Home</Link>
            <Link to="/resources" className="hover:text-gray-200 transition">Resources</Link>
            <Link to="/events" className="hover:text-gray-200 transition">Events</Link>
            <Link to="/chat" className="hover:text-gray-200 transition">Chat</Link>
            <Link to="/study-groups" className="hover:text-gray-200 transition">Study Groups</Link>
            <Link to="/forum" className="hover:text-gray-200 transition">Forum</Link>
            <Link to="/leaderboard" className="hover:text-gray-200 transition">Leaderboard</Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 font-semibold px-4 py-1 rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none text-white"
            >
              {menuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-500 bg-gradient-to-r from-blue-500 to-teal-400 px-4 py-4 space-y-3">
          <Link onClick={() => setMenuOpen(false)} to="/home" className="block hover:text-gray-200 transition">Home</Link>
          <Link onClick={() => setMenuOpen(false)} to="/resources" className="block hover:text-gray-200 transition">Resources</Link>
          <Link onClick={() => setMenuOpen(false)} to="/events" className="block hover:text-gray-200 transition">Events</Link>
          <Link onClick={() => setMenuOpen(false)} to="/chat" className="block hover:text-gray-200 transition">Chat</Link>
          <Link onClick={() => setMenuOpen(false)} to="/study-groups" className="block hover:text-gray-200 transition">Study Groups</Link>
          <Link onClick={() => setMenuOpen(false)} to="/forum" className="block hover:text-gray-200 transition">Forum</Link>
          <Link onClick={() => setMenuOpen(false)} to="/leaderboard" className="block hover:text-gray-200 transition">Leaderboard</Link>
          <button
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="w-full bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
