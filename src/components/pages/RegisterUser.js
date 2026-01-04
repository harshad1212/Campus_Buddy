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
const MIN_AGE = 16;

/* ================= HELPERS ================= */
const calculateAge = (dob) => {
  if (!dob) return 0;
  const diff = Date.now() - dob.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", level: 1 };
  if (score === 2) return { label: "Medium", level: 2 };
  if (score === 3) return { label: "Strong", level: 3 };
  return { label: "Very Strong", level: 4 };
};

const RegisterUser = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  /* ================= STATES ================= */
  const [role, setRole] = useState("student");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

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
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    level: 0,
  });

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value) return "Full name is required";
        if (!nameRegex.test(value)) return "Only alphabets, min 3 characters";
        return "";

      case "email":
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Minimum 6 characters required";
        return "";

      case "phone":
        if (!value) return "Phone number is required";
        if (!phoneRegex.test(value)) return "Enter valid 10-digit number";
        return "";

      case "gender":
        return value ? "" : "Please select gender";

      case "registrationCode":
        return value ? "" : "Registration code required";

      case "enrollmentNumber":
        if (!value) return "Enrollment number required";
        if (value.length < 6) return "Invalid enrollment number";
        return "";

      case "employeeId":
        return value ? "" : "Employee ID required";

      case "designation":
        if (!value) return "Designation required";
        if (value.length < 3) return "Min 3 characters";
        return "";

      default:
        return "";
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (name === "profilePhoto") {
      const file = files[0];
      if (!file) return;

      if (!file.type.startsWith("image/"))
        return setErrors((p) => ({ ...p, profilePhoto: "Only images allowed" }));

      if (file.size > 2 * 1024 * 1024)
        return setErrors((p) => ({ ...p, profilePhoto: "Max size 2MB" }));

      setFormData((p) => ({ ...p, profilePhoto: file }));
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
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

  /* ================= STEP VALIDATION ================= */
  const step1Valid =
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.phone &&
    !errors.dob &&
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

      if (!res.ok) return alert(data.error || "Registration failed");

      alert("Registration request submitted");
      navigate("/login");
    } catch {
      setLoading(false);
      alert("Server error");
    }
  };

  /* ================= JSX ================= */
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
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <div className="grid-2">
                {["name", "email", "phone"].map((field) => (
                  <div key={field}>
                    {touched[field] && (
                      <small className="error">{errors[field]}</small>
                    )}
                    <input
                      name={field}
                      placeholder={
                        field === "phone" ? "Phone Number" : field
                      }
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        touched[field] && errors[field] ? "invalid" : ""
                      }
                    />
                    
                  </div>
                ))}

                {/* PASSWORD */}
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      touched.password && errors.password ? "invalid" : ""
                    }
                  />

                  {formData.password && (
                    <div className="password-meter">
                      <div
                        className={`strength-bar level-${passwordStrength.level}`}
                      />
                      <span
                        className={`strength-text level-${passwordStrength.level}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}

                  {touched.password && (
                    <small className="error">{errors.password}</small>
                  )}
                </div>

                <select
                  name="gender"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>

                <div>
                  <DatePicker
                    selected={formData.dob}
                    maxDate={new Date()}
                    placeholderText="Date of Birth"
                    onChange={(d) => {
                      setFormData({ ...formData, dob: d });
                      setTouched((p) => ({ ...p, dob: true }));
                      if (calculateAge(d) < MIN_AGE)
                        setErrors((p) => ({
                          ...p,
                          dob: `Minimum age is ${MIN_AGE}`,
                        }));
                      else setErrors((p) => ({ ...p, dob: "" }));
                    }}
                  />
                  {touched.dob && (
                    <small className="error">{errors.dob}</small>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="auth-btn"
              >
                Next
              </button>
            </>
          )}

          {/* ================= STEP 2 & 3 SAME AS BEFORE ================= */}
        </form>

        <p className="auth-links">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
