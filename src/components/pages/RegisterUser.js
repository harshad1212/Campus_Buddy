// src/components/pages/RegisterUser.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./css/AuthLayout.css";

const RegisterUser = () => {
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    universityCode: "",
    registrationCode: "",
    profilePhoto: null,
  });

  // ✅ Fetch universities from backend
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/university/universities`);
        const data = await res.json();
        setUniversities(data);
      } catch (err) {
        console.error("Error fetching universities:", err);
      } finally {
        setLoadingUniversities(false);
      }
    };
    fetchUniversities();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto") {
      setFormData({ ...formData, profilePhoto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      formDataToSend.append("role", role);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register-request`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Registration request sent! You’ll be notified by email once approved.");
      navigate("/login");
    } catch (err) {
      console.error("Register Request Error:", err);
      setLoading(false);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="auth-title"
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
          className="auth-form"
          encType="multipart/form-data"
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

          {/* 🏫 University Dropdown */}
          <select
            name="universityCode"
            value={formData.universityCode}
            onChange={handleChange}
            required
          >
            {loadingUniversities ? (
              <option>Loading universities...</option>
            ) : universities.length > 0 ? (
              <>
                <option value="">Select University</option>
                {universities.map((uni) => (
                  <option key={uni._id} value={uni.code}>
                    {uni.name}
                  </option>
                ))}
              </>
            ) : (
              <option>No universities available</option>
            )}
          </select>

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

          {/* 📸 Profile Photo Upload */}
          <input
            type="file"
            name="profilePhoto"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Submit Request"}
          </button>
        </motion.form>

        <div className="auth-links">
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
