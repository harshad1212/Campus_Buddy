// src/components/pages/RegisterUniversity.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate,Link } from "react-router-dom";
import "./css/AuthLayout.css"; // reuse same CSS

const RegisterUniversity = () => {
  const [formData, setFormData] = useState({
    universityName: "",
    universityCode: "",
    teacherCode: "",
    studentCode: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.universityName,
          email: formData.email,
          password: formData.password,
          role: "admin",
          universityName: formData.universityName,
          universityCode: formData.universityCode,
          teacherCode: formData.teacherCode,
          studentCode: formData.studentCode,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("University registered successfully!");
      navigate("/admin-login");
    } catch (err) {
      setLoading(false);
      console.error("University Register Error:", err);
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
          Register Your University
        </motion.h2>

        <motion.form
          onSubmit={handleRegister}
          className="login-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            name="universityName"
            placeholder="University Name"
            value={formData.universityName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="universityCode"
            placeholder="University Code (unique)"
            value={formData.universityCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="teacherCode"
            placeholder="Teacher Registration Code"
            value={formData.teacherCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="studentCode"
            placeholder="Student Registration Code"
            value={formData.studentCode}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Admin Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Register University"
            )}
          </button>
        </motion.form>

        <div className="login-links">
          <p>
            Already registered?{" "}
            <Link to="/admin-login" className="link-primary">
              Login as Admin
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUniversity;
