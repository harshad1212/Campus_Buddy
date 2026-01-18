import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";

const Header = ({ setCurrentUser }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("chatUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (setCurrentUser) setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  /* ---------- Styles ---------- */
  const navItem =
    "relative flex items-center h-16 text-sm font-medium text-slate-200 hover:text-white transition";

  const navText = "px-2 pb-1 relative";

  const active =
    "text-white after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-indigo-400";

  const inactive =
    "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-indigo-400 after:scale-x-0 hover:after:scale-x-100 transition";

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="text-xl font-bold text-white">
            Campus Buddy
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink path="/home" label="Home" {...{ navItem, navText, active, inactive, location }} />

            {/* Resources */}
            <Dropdown label="Resources">
              <DropdownLink to="/upload-resources" text="Upload Resources" />
              <DropdownLink to="/see-resources" text="Browse Resources" />
              <DropdownLink to="/my-resources" text="My Resources" />
            </Dropdown>

<<<<<<< HEAD
            {/* ✅ Events Dropdown */}
            {/* ✅ Events Navigation */}
        
              {console.log(user)}
=======
            {/* Events Dropdown */}
>>>>>>> 6f723b823ddcd0241811b0822301ccaaab54c000
            {user?.role === "teacher" ? (
              <Dropdown label="Events">
                <DropdownLink to="/events" text="View Events" />
                <DropdownLink to="/create-events" text="Create Event" />
              </Dropdown>
            ) : (
              <NavLink path="/events" label="Events" {...{ navItem, navText, active, inactive, location }} />
            )}

            <NavLink path="/chat" label="Chat" {...{ navItem, navText, active, inactive, location }} />
            <NavLink path="/forum" label="Forum" {...{ navItem, navText, active, inactive, location }} />
            <NavLink path="/leaderboard" label="Leaderboard" {...{ navItem, navText, active, inactive, location }} />

            <button
              onClick={handleLogout}
              className="ml-4 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-white text-sm"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700">
          <MobileLink to="/home" label="Home" setMobileOpen={setMobileOpen} />

          {/* Mobile Resources */}
          <MobileDropdown
            label="Resources"
            isOpen={mobileResourcesOpen}
            setIsOpen={setMobileResourcesOpen}
          >
            <MobileSubLink to="/upload-resources" label="Upload Resources" setMobileOpen={setMobileOpen} />
            <MobileSubLink to="/see-resources" label="Browse Resources" setMobileOpen={setMobileOpen} />
            <MobileSubLink to="/my-resources" label="My Resources" setMobileOpen={setMobileOpen} />
          </MobileDropdown>

          {/* Mobile Events */}
          <MobileDropdown
            label="Events"
            isOpen={mobileEventsOpen}
            setIsOpen={setMobileEventsOpen}
          >
            <MobileSubLink to="/events" label="View Events" setMobileOpen={setMobileOpen} />
            {user?.role === "teacher" && (
              <MobileSubLink to="/create-events" label="Create Event" setMobileOpen={setMobileOpen} />
            )}
          </MobileDropdown>

          <MobileLink to="/chat" label="Chat" setMobileOpen={setMobileOpen} />
          <MobileLink to="/forum" label="Forum" setMobileOpen={setMobileOpen} />
          <MobileLink to="/leaderboard" label="Leaderboard" setMobileOpen={setMobileOpen} />

          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-3 text-red-400 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

/* ---------- Components ---------- */

const NavLink = ({ path, label, location, navItem, navText, active, inactive }) => (
  <Link to={path} className={navItem}>
    <span className={`${navText} ${location.pathname === path ? active : inactive}`}>
      {label}
    </span>
  </Link>
);

const Dropdown = ({ label, children }) => (
  <div className="relative group">
    <span className="text-slate-200 cursor-pointer px-2 pb-1">
      {label} ▾
    </span>
    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition">
      {children}
    </div>
  </div>
);

const DropdownLink = ({ to, text }) => (
  <Link to={to} className="block px-5 py-3 text-sm text-slate-700 hover:bg-indigo-50">
    {text}
  </Link>
);

const MobileLink = ({ to, label, setMobileOpen }) => (
  <Link
    to={to}
    onClick={() => setMobileOpen(false)}
    className="block px-6 py-3 text-slate-200 hover:bg-slate-800"
  >
    {label}
  </Link>
);

const MobileSubLink = ({ to, label, setMobileOpen }) => (
  <Link
    to={to}
    onClick={() => setMobileOpen(false)}
    className="block px-10 py-2 text-sm text-slate-300 hover:bg-slate-700"
  >
    {label}
  </Link>
);

const MobileDropdown = ({ label, isOpen, setIsOpen, children }) => (
  <div className="border-t border-slate-700">
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full flex justify-between items-center px-6 py-3 text-slate-200 hover:bg-slate-800"
    >
      <span>{label}</span>
      <span className="text-sm">{isOpen ? "▲" : "▼"}</span>
    </button>
    {isOpen && <div className="bg-slate-800">{children}</div>}
  </div>
);

export default Header;
