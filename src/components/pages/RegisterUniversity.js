import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./css/AuthLayout.css";

const RegisterUniversity = () => {
  const [formData, setFormData] = useState({
    universityName: "",
    universityCode: "",
    teacherCode: "",
    studentCode: "",
    email: "",
    password: "",
    departments: [""], // start with one department
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (index, value) => {
    const updated = [...formData.departments];
    updated[index] = value;
    setFormData({ ...formData, departments: updated });
  };

  const addDepartment = () => {
    setFormData({
      ...formData,
      departments: [...formData.departments, ""],
    });
  };

  const removeDepartment = (index) => {
    const updated = formData.departments.filter((_, i) => i !== index);
    setFormData({ ...formData, departments: updated });
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
          departments: formData.departments.filter(d => d.trim() !== ""),
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
      console.error(err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="register-uni-wrapper">
      <motion.div
        className="register-uni-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="register-uni-title">Register Your University</h2>

        <form className="register-uni-form" onSubmit={handleRegister}>
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
            placeholder="University Code"
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

          {/* Departments Section */}
          <div className="department-section">
            <p className="section-title">Departments</p>

            {formData.departments.map((dept, index) => (
              <div className="department-row" key={index}>
                <input
                  type="text"
                  placeholder={`Department ${index + 1}`}
                  value={dept}
                  onChange={(e) =>
                    handleDepartmentChange(index, e.target.value)
                  }
                  required
                />
                {formData.departments.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeDepartment(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-dept-btn"
              onClick={addDepartment}
            >
              <Plus size={16} /> Add Department
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Register University"}
          </button>
        </form>

        <div className="register-uni-back">
          Already registered? <Link to="/admin-login">Login as Admin</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUniversity;
