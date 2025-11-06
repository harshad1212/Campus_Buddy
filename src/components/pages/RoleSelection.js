import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/RoleSelection.css";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaCrown } from "react-icons/fa";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    { name: "Student", icon: <FaUserGraduate />, route: "/register/student" },
    { name: "Teacher", icon: <FaChalkboardTeacher />, route: "/register/teacher" },
    { name: "Admin", icon: <FaUserShield />, route: "/register/admin" },
    { name: "Super Admin", icon: <FaCrown />, route: "/register/superadmin" },
  ];

  return (
    <div className="role-selection-container">
      <h1 className="role-title">Select Your Role</h1>
      <p className="role-subtitle">Choose how you want to register</p>
      <div className="role-grid">
        {roles.map((role) => (
          <div
            key={role.name}
            className="role-card"
            onClick={() => navigate(role.route)}
          >
            <div className="role-icon">{role.icon}</div>
            <h3>{role.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
