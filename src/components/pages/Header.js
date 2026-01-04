import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const Header = ({ setCurrentUser }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();

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
    "text-white after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-indigo-400 after:scale-x-100 after:origin-left after:transition-transform after:duration-300";

  const inactiveUnderline =
    "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-indigo-400 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/home"
            className="text-xl font-bold tracking-wide text-white h-16 flex items-center"
          >
            Campus Buddy
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Home */}
            <Link to="/home" className={navItem}>
              <span
                className={`${navText} ${
                  location.pathname === "/home"
                    ? active
                    : inactiveUnderline
                }`}
              >
                Home
              </span>
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group">
              <div className={`${navItem} cursor-pointer`}>
                <span className={`${navText} ${inactiveUnderline}`}>
                  Resources ▾
                </span>
              </div>

              <div className="absolute left-0 top-full mt-0.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <DropdownLink to="/upload-resources" text="Upload Resources" />
                <DropdownLink to="/see-resources" text="Browse Resources" />
                <DropdownLink to="/my-resources" text="My Resources" />
              </div>
            </div>

            {/* Events Dropdown */}
            {user?.role === "teacher" ? (
              <div className="relative group">
                <div className={`${navItem} cursor-pointer`}>
                  <span className={`${navText} ${inactiveUnderline}`}>
                    Events ▾
                  </span>
                </div>

                <div className="absolute left-0 top-full mt-0.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <DropdownLink to="/events" text="View Events" />
                  <DropdownLink to="/create-events" text="Create Event" />
                </div>
              </div>
            ) : (
              <Link to="/events" className={navItem}>
                <span
                  className={`${navText} ${
                    location.pathname === "/events"
                      ? active
                      : inactiveUnderline
                  }`}
                >
                  Events
                </span>
              </Link>
            )}

            {/* Other Links */}
            <NavLink path="/chat" label="Chat" location={location} navItem={navItem} navText={navText} active={active} inactive={inactiveUnderline} />
            <NavLink path="/forum" label="Forum" location={location} navItem={navItem} navText={navText} active={active} inactive={inactiveUnderline} />
            <NavLink path="/leaderboard" label="Leaderboard" location={location} navItem={navItem} navText={navText} active={active} inactive={inactiveUnderline} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-xl transition-all duration-200"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

/* ---------- Reusable Components ---------- */

const DropdownLink = ({ to, text }) => (
  <Link
    to={to}
    className="block px-5 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200"
  >
    {text}
  </Link>
);

const NavLink = ({ path, label, location, navItem, navText, active, inactive }) => (
  <Link to={path} className={navItem}>
    <span
      className={`${navText} ${
        location.pathname === path ? active : inactive
      }`}
    >
      {label}
    </span>
  </Link>
);

export default Header;
