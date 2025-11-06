// src/components/pages/Login.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import "./css/Login.css";

const SESSION_DURATION_DAYS = 7;

const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // NEW
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = Cookies.get("chatUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      navigate("/home", { replace: true });
    }
  }, [navigate, setCurrentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }), // ✅ Include role
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Invalid credentials");
        return;
      }

      const userData = { ...data.user, token: data.token };

      Cookies.set("chatUser", JSON.stringify(userData), {
        expires: SESSION_DURATION_DAYS,
        secure: true,
        sameSite: "Strict",
      });

      localStorage.setItem("token", data.token);
      setCurrentUser(userData);

      // ✅ Role-based redirection
      if (data.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/home");
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);
      alert("Server error. Please try again.");
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
          Welcome Back👋
        </motion.h2>

        {/* --- Role Toggle --- */}
        <div className="role-toggle">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            className={role === "teacher" ? "active" : ""}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>
        </div>

        <motion.form
          onSubmit={handleLogin}
          className="login-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="email"
            placeholder="Email address"
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

        {/* Links */}
        <div className="login-links">
          <p>
            Don’t have an account?{" "}
            <Link to="/register-user" className="link-primary">
              Register
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="link-secondary">
              Forgot Password?
            </Link>
          </p>
        </div>

        {/* ✅ New Admin Section */}
        <div className="admin-section">
          <p>University Admin?</p>
          <Link to="/admin-login" className="admin-link">
            Login as Admin
          </Link>
          <p>
            or{" "}
            <Link to="/register-university" className="admin-link">
              Register your University
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
