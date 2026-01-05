import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  /* ================= FETCH UNIVERSITIES ================= */
  useEffect(() => {
    fetch("http://localhost:4000/api/university/universities")
      .then((res) => res.json())
      .then(setUniversities)
      .catch(console.error);
  }, []);

  /* ================= FETCH DEPARTMENTS ================= */
  useEffect(() => {
    if (!formData.universityCode) {
      setDepartments([]);
      return;
    }

    fetch(
      `http://localhost:4000/api/university/${formData.universityCode}/departments`
    )
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []))
      .catch(console.error);
  }, [formData.universityCode]);

  /* ================= FETCH SEMESTERS ================= */
  useEffect(() => {
    if (!formData.department) {
      setSemesters([]);
      return;
    }

    fetch(
      `http://localhost:4000/api/university/department/${formData.department}/semesters`
    )
      .then((res) => res.json())
      .then((data) => setSemesters(data.semesters || []))
      .catch(console.error);
  }, [formData.department]);

  /* ================= HANDLE CHANGE ================= */
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

  /* ================= SUBMIT ================= */
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

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/register-request`,
        {
          method: "POST",
          body: fd,
        }
      );

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 text-slate-200"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Academic Registration
        </h2>

        {/* ROLE TOGGLE */}
        <div className="flex mb-6 bg-slate-900/60 rounded-full p-2 border border-white/10">
          {["student", "teacher"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-3xl font-medium transition-all ${
                role === r
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
                    : "text-slate-400 hover:text-white"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* STEP INDICATOR */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`w-3 h-3 rounded-full ${
                step >= s ? "bg-indigo-500" : "bg-slate-600"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleRegister} encType="multipart/form-data" className="space-y-6">
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                <input className="input" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input className="input" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input className="input" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />

                <select className="input" name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>

                <DatePicker
                  selected={formData.dob}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  placeholderText="Date of Birth"
                  className="input"
                />
              </div>

              <button type="button" onClick={nextStep} className="btn-primary">
                Next
              </button>
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="input" name="universityCode" value={formData.universityCode} onChange={handleChange} required>
                  <option value="">Select University</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u.code}>{u.name}</option>
                  ))}
                </select>

                <select className="input" name="department" value={formData.department} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>

                {role === "student" && (
                  <select className="input" name="semester" value={formData.semester} onChange={handleChange} required>
                    <option value="">Select Semester</option>
                    {semesters.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                )}

                <input
                  className="input"
                  name="registrationCode"
                  placeholder={`${role === "student" ? "Student" : "Teacher"} Registration Code`}
                  value={formData.registrationCode}
                  onChange={handleChange}
                  required
                />

                {role === "student" && (
                  <input className="input" name="enrollmentNumber" placeholder="Enrollment Number" value={formData.enrollmentNumber} onChange={handleChange} required />
                )}

                {role === "teacher" && (
                  <>
                    <input className="input" name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleChange} required />
                    <input className="input" name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} required />
                  </>
                )}
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="btn-primary w-auto px-8">
                  Next
                </button>
              </div>
            </>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <>
              <input type="file" hidden ref={fileInputRef} name="profilePhoto" accept="image/*" onChange={handleChange} />

              <div
                onClick={() => fileInputRef.current.click()}
                className="cursor-pointer border border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5"
              >
                {fileName}
              </div>

              {preview && (
                <div className="flex justify-center">
                  <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                </div>
              )}

              <div className="flex justify-between">
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Back
                </button>
                <button className="btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm mt-6">
          Already registered?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
