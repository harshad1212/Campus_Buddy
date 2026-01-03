import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./css/AuthLayout.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ================= REGEX ================= */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;
const nameRegex = /^[A-Za-z ]{3,}$/;

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
    dob: null,
    universityCode: "",
    department: "",
    semester: "",
    registrationCode: "",
    enrollmentNumber: "",
    employeeId: "",
    designation: "",
    profilePhoto: null,
  });

  const [errors, setErrors] = useState({});

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return nameRegex.test(value) ? "" : "Min 3 letters, only alphabets";
      case "email":
        return emailRegex.test(value) ? "" : "Invalid email format";
      case "password":
        return value.length >= 6 ? "" : "Min 6 characters required";
      case "phone":
        return phoneRegex.test(value) ? "" : "10 digit number required";
      case "gender":
        return value ? "" : "Required";
      case "registrationCode":
        return value ? "" : "Required";
      case "enrollmentNumber":
        return value.length >= 6 ? "" : "Invalid enrollment number";
      case "employeeId":
        return value ? "" : "Required";
      case "designation":
        return value.length >= 3 ? "" : "Min 3 characters";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePhoto") {
      const file = files[0];
      if (!file.type.startsWith("image/"))
        return alert("Only images allowed");
      if (file.size > 2 * 1024 * 1024)
        return alert("Image must be under 2MB");

      setFormData((p) => ({ ...p, profilePhoto: file }));
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetch("http://localhost:4000/api/university/universities")
      .then((res) => res.json())
      .then(setUniversities);
  }, []);

  useEffect(() => {
    if (!formData.universityCode) return;
    fetch(
      `http://localhost:4000/api/university/${formData.universityCode}/departments`
    )
      .then((res) => res.json())
      .then((d) => setDepartments(d.departments || []));
  }, [formData.universityCode]);

  useEffect(() => {
    if (!formData.department) return;
    fetch(
      `http://localhost:4000/api/university/department/${formData.department}/semesters`
    )
      .then((res) => res.json())
      .then((d) => setSemesters(d.semesters || []));
  }, [formData.department]);

  /* ================= STEP VALIDITY ================= */
  const step1Valid =
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.phone &&
    formData.gender &&
    formData.dob;

  const step2Valid =
    formData.universityCode &&
    formData.department &&
    formData.registrationCode &&
    (role === "student"
      ? formData.semester && !errors.enrollmentNumber
      : !errors.employeeId && !errors.designation);

  /* ================= SUBMIT ================= */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("role", role);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/register-request`,
        { method: "POST", body: fd }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) return alert(data.error);

      alert("Registration request sent");
      navigate("/login");
    } catch {
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

        <form onSubmit={handleRegister} className="auth-form">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="grid-2">
                <div>
                  <input name="name" placeholder="Full Name" onChange={handleChange} />
                  <small className="error">{errors.name}</small>
                </div>

                <div>
                  <input name="email" placeholder="Email" onChange={handleChange} />
                  <small className="error">{errors.email}</small>
                </div>

                <div>
                  <input type="password" name="password" placeholder="Password" onChange={handleChange} />
                  <small className="error">{errors.password}</small>
                </div>

                <div>
                  <input name="phone" placeholder="Phone Number" onChange={handleChange} />
                  <small className="error">{errors.phone}</small>
                </div>

                <select name="gender" onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>

                <DatePicker
                  selected={formData.dob}
                  onChange={(d) => setFormData({ ...formData, dob: d })}
                  placeholderText="Date of Birth"
                />
              </div>

              <button type="button" disabled={!step1Valid} onClick={() => setStep(2)} className="auth-btn">
                Next
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="grid-2">
                <select name="universityCode" onChange={handleChange}>
                  <option value="">Select University</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u.code}>{u.name}</option>
                  ))}
                </select>

                <select name="department" onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map((d, i) => (
                    <option key={i}>{d}</option>
                  ))}
                </select>

                {role === "student" && (
                  <>
                    <select name="semester" onChange={handleChange}>
                      <option value="">Select Semester</option>
                      {semesters.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <input name="enrollmentNumber" placeholder="Enrollment Number" onChange={handleChange} />
                    <small className="error">{errors.enrollmentNumber}</small>
                  </>
                )}

                {role === "teacher" && (
                  <>
                    <input name="employeeId" placeholder="Employee ID" onChange={handleChange} />
                    <small className="error">{errors.employeeId}</small>

                    <input name="designation" placeholder="Designation" onChange={handleChange} />
                    <small className="error">{errors.designation}</small>
                  </>
                )}

                <input name="registrationCode" placeholder="Registration Code" onChange={handleChange} />
                <small className="error">{errors.registrationCode}</small>
              </div>

              <div className="step-buttons">
                <button type="button" onClick={() => setStep(1)}>Back</button>
                <button type="button" disabled={!step2Valid} onClick={() => setStep(3)}>Next</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input type="file" hidden ref={fileInputRef} onChange={handleChange} />

              <div className="custom-file-upload" onClick={() => fileInputRef.current.click()}>
                <span>{fileName}</span>
                <span className="browse-btn">Browse</span>
              </div>

              {preview && <img src={preview} alt="preview" className="profile-preview" />}

              <div className="step-buttons">
                <button type="button" onClick={() => setStep(2)}>Back</button>
                <button disabled={loading} className="auth-btn">
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
