// src/components/pages/RegisterUser.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./css/AuthLayout.css";

const RegisterUser = () => {
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    universityCode: "",
    registrationCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert(
        "Registration request sent! You’ll be notified by email once approved by your university admin."
      );
      navigate("/login");
    } catch (err) {
      setLoading(false);
      console.error("Register Request Error:", err);
      alert("Server error. Please try again later.");
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
          Register as {role === "student" ? "Student" : "Teacher"}
        </motion.h2>

        {/* Role Toggle */}
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
          onSubmit={handleRegister}
          className="login-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="universityCode"
            placeholder="University Code"
            value={formData.universityCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="registrationCode"
            placeholder={`${
              role === "teacher" ? "Teacher" : "Student"
            } Registration Code`}
            value={formData.registrationCode}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Submit Request"
            )}
          </button>
        </motion.form>

        <div className="login-links">
          <p>
            Already registered?{" "}
            <Link to="/login" className="link-primary">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
