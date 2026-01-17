// src/components/pages/AdminLogin.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Invalid credentials");
        return;
      }

      // ✅ Admin check
      if (data.user.role !== "admin") {
        alert("Access denied. Only admins can log in here.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`Welcome, ${data.user.name}!`);
      navigate("/admin-dashboard");
    } catch (err) {
      setLoading(false);
      console.error("Admin Login Error:", err);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-950 flex items-center justify-center px-4">

      {/* ================= BACKGROUND BLOBS ================= */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 40, -20], y: [0, 30, -10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -40, 20], y: [0, -30, 10] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 20, -30], y: [0, -20, 10] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ================= ADMIN LOGIN CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10 my-10
          w-full max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-2xl
          p-8 text-slate-200
        "
      >
        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Admin Login 🔐
        </h2>
        <p className="text-center text-slate-400 mb-6">
          University administration access
        </p>

        {/* FORM */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="email"
            placeholder="University Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              w-full px-4 py-3 rounded-xl
              bg-slate-900/60 text-white
              border border-white/10
              focus:ring-2 focus:ring-indigo-500
              outline-none
            "
          />

          {/* PASSWORD WITH TOGGLE */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-3 rounded-xl
                bg-slate-900/60 text-white
                border border-white/10
                focus:ring-2 focus:ring-indigo-500
                outline-none
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-indigo-600 hover:bg-indigo-500
              text-white font-semibold
              flex items-center justify-center
              transition-all disabled:opacity-60
            "
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
          </button>
        </form>

        {/* LINKS */}
        <div className="mt-6 text-sm text-center space-y-2">
          <p>
            <Link
              to="/forgot-password"
              className="text-slate-400 hover:text-white"
            >
              Forgot Password?
            </Link>
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center text-sm">
          <p className="text-slate-400 mb-1">Not an Admin?</p>
          <Link
            to="/login"
            className="text-indigo-400 hover:underline font-medium"
          >
            Go to User Login
          </Link>
          <p className="mt-2">
            or{" "}
            <Link
              to="/register-university"
              className="text-indigo-400 hover:underline"
            >
              Register your University
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
