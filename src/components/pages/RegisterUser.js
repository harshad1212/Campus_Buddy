// src/components/pages/RegisterUser.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./css/AuthLayout.css";

const RegisterUser = () => {
  const [role, setRole] = useState("student");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("Upload Profile Photo");
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dob: "",
    universityCode: "",
    department: "",
    course: "",
    semester: "",
    registrationCode: "",
    enrollmentNumber: "",
    employeeId: "",
    designation: "",
    profilePhoto: null,
  });

  /* ===== FETCH UNIVERSITIES ===== */
  useEffect(() => {
    fetch("http://localhost:4000/api/university/universities")
      .then((res) => res.json())
      .then(setUniversities)
      .catch(console.error);
  }, []);

  /* ===== FETCH DEPARTMENTS ===== */
  useEffect(() => {
    if (!formData.universityCode) return;
    fetch(
      `http://localhost:4000/api/university/${formData.universityCode}/departments`
    )
      .then((res) => res.json())
      .then(setDepartments)
      .catch(console.error);
  }, [formData.universityCode]);

  /* ===== FETCH SEMESTERS ===== */
  useEffect(() => {
    if (!formData.department) return;
    fetch(
      `http://localhost:4000/api/university/department/${formData.department}/semesters`
    )
      .then((res) => res.json())
      .then(setSemesters)
      .catch(console.error);
  }, [formData.department]);

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePhoto") {
      const file = files[0];
      setFormData((p) => ({ ...p, profilePhoto: file }));
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  /* ===== SUBMIT ===== */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") fd.append(key, value);
      });

      fd.append("role", role);

      if (role === "student") {
        fd.set("semester", Number(formData.semester));
      }

      const res = await fetch("http://localhost:4000/api/register-request", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return alert(data.error);

      alert("Registration request sent for approval");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div className="auth-card">
        <h2 className="auth-title">Academic Registration</h2>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={role === "teacher" ? "active" : ""}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>
        </div>

        <div className="step-indicator">
          <span className={step >= 1 ? "active" : ""}>1</span>
          <span className={step >= 2 ? "active" : ""}>2</span>
          <span className={step >= 3 ? "active" : ""}>3</span>
        </div>

        <form onSubmit={handleRegister} encType="multipart/form-data" className="auth-form">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="grid-2">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
                <input
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="button" className="auth-btn" onClick={nextStep}>Next</button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="grid-2">
                <select
                  name="universityCode"
                  value={formData.universityCode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select University</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u.code}>{u.name}</option>
                  ))}
                </select>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>

                <input
                  name="course"
                  placeholder="Course (B.Tech / M.Tech / MCA)"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />

                {role === "student" && (
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                )}

                <input
                  name="registrationCode"
                  placeholder={`${role === "student" ? "Student" : "Teacher"} Registration Code`}
                  value={formData.registrationCode}
                  onChange={handleChange}
                  required
                />

                {role === "student" && (
                  <input
                    name="enrollmentNumber"
                    placeholder="Enrollment Number"
                    value={formData.enrollmentNumber}
                    onChange={handleChange}
                    required
                  />
                )}

                {role === "teacher" && (
                  <>
                    <input
                      name="employeeId"
                      placeholder="Employee ID"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                    />
                    <input
                      name="designation"
                      placeholder="Designation"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
              </div>

              <div className="step-buttons">
                <button type="button" onClick={prevStep}>Back</button>
                <button type="button" onClick={nextStep}>Next</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                type="file"
                name="profilePhoto"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleChange}
              />

              <div className="custom-file-upload" onClick={() => fileInputRef.current.click()}>
                <span>{fileName}</span>
                <span className="browse-btn">Browse</span>
              </div>

              {preview && (
                <div className="profile-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}

              <div className="step-buttons">
                <button type="button" onClick={prevStep}>Back</button>
                <button className="auth-btn" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-links">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
