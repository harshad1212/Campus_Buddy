// src/components/pages/AdminLogin.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import "./css/AuthLayout.css"; // same CSS as login

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), // no need to force role here
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Invalid credentials");
      return;
    }

    // ✅ Check if user is actually an admin
    if (data.user.role !== "admin") {
      alert("Access denied. Only admins can log in here.");
      return;
    }

    // ✅ Save both token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("✅ Logged in admin:", data.user);

    alert(`Welcome, ${data.user.name}!`);
    navigate("/admin-dashboard");
  } catch (err) {
    setLoading(false);
    console.error("Admin Login Error:", err);
    alert("Server error. Try again later.");
  }
};


  return (
    <div className="login-wrapper">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="login-title"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Admin Login
        </motion.h2>

        <motion.form
          onSubmit={handleAdminLogin}
          className="login-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="email"
            placeholder="University Email"
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
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
          </button>
        </motion.form>

        <div className="login-links">
          <p>
            Don’t have an admin account?{" "}
            <Link to="/register-university" className="link-primary">
              Register University
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="link-secondary">
              Forgot Password?
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
