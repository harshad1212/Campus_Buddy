import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./RoleBasedRegister.css";

const RoleBasedRegister = () => {
  const [selectedRole, setSelectedRole] = useState("student");

  const renderForm = () => {
    switch (selectedRole) {
      case "admin":
        return <AdminForm />;
      case "teacher":
        return <TeacherForm />;
      default:
        return <StudentForm />;
    }
  };

  return (
    <div className="register-wrapper">
      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="register-title">Register as</h2>

        {/* Toggle Bar */}
        <div className="role-toggle">
          {["student", "teacher", "admin"].map((role) => (
            <button
              key={role}
              className={`toggle-btn ${selectedRole === role ? "active" : ""}`}
              onClick={() => setSelectedRole(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Role-specific Form */}
        <div className="form-area">{renderForm()}</div>

        {/* Login Redirect */}
        <div className="login-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleBasedRegister;

/* ------------ Sub Forms for each Role ------------ */

const AdminForm = () => (
  <form className="register-form">
    <input type="text" placeholder="University Name" required />
    <input type="text" placeholder="University Code" required />
    <input type="email" placeholder="Admin Email" required />
    <input type="password" placeholder="Password" required />
    <button type="submit" className="register-btn">
      Register as Admin
    </button>
  </form>
);

const TeacherForm = () => (
  <form className="register-form">
    <input type="text" placeholder="Full Name" required />
    <input type="email" placeholder="Email Address" required />
    <input type="text" placeholder="University Code" required />
    <input type="password" placeholder="Password" required />
    <button type="submit" className="register-btn">
      Register as Teacher
    </button>
  </form>
);

const StudentForm = () => (
  <form className="register-form">
    <input type="text" placeholder="Full Name" required />
    <input type="email" placeholder="Email Address" required />
    <input type="text" placeholder="University Code" required />
    <input type="password" placeholder="Password" required />
    <button type="submit" className="register-btn">
      Register as Student
    </button>
  </form>
);
