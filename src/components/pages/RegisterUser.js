import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2,AlertCircle, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const InputWrapper = ({ name, errors, touched, formData, children }) => (
  <div className="flex flex-col gap-1 w-full">
    {children}
    {touched[name] && errors[name] ? (
      <span className="text-red-400 text-[10px] flex items-center gap-1 ml-1 animate-pulse">
        <AlertCircle size={10} /> {errors[name]}
      </span>
    )  : null}
  </div>
);

const PasswordStrength = ({ password, isVisible }) => {
  if (!isVisible) return null;

  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return { label: "Weak", color: "bg-slate-700", width: "0%" };
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (score === 2) return { label: "Fair", color: "bg-yellow-500", width: "50%" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "75%" };
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  };

  const strength = getStrength(password);

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }} 
      animate={{ opacity: 1, height: "auto" }} 
      className="mt-1 mb-2 px-1"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">Security: {strength.label}</span>
        {strength.label === "Strong" && <ShieldCheck size={12} className="text-emerald-500" />}
      </div>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          animate={{ width: strength.width }} 
          className={`h-full ${strength.color} transition-colors duration-500`} 
        />
      </div>
    </motion.div>
  );
};
const RegisterUser = () => {
  const [role, setRole] = useState("student");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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
    semester: "",
    registrationCode: "",
    enrollmentNumber: "",
    employeeId: "",
    designation: "",
    profilePhoto: null,
  });

  /* ================= FETCH UNIVERSITIES ================= */
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/university/universities`)
      .then((res) => res.json())
      .then(setUniversities)
      .catch(console.error);
  }, []);

  /* ================= FETCH DEPARTMENTS ================= */
  useEffect(() => {
    if (!formData.universityCode) return setDepartments([]);

    fetch(
      `${process.env.REACT_APP_API_URL}/api/university/${formData.universityCode}/departments`
    )
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []))
      .catch(console.error);
  }, [formData.universityCode]);

  /* ================= FETCH SEMESTERS ================= */
  useEffect(() => {
    if (!formData.department) return setSemesters([]);

    fetch(
      `${process.env.REACT_APP_API_URL}/api/university/department/${formData.department}/semesters`
    )
      .then((res) => res.json())
      .then((data) => setSemesters(data.semesters || []))
      .catch(console.error);
  }, [formData.department]);
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.length < 3) error = "Name too short";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!value.match(/^\S+@\S+\.\S+$/)) error = "Invalid email format";
        break;
      case "password":
        if (value.length < 6) error = "Min 6 characters required";
        break;
      case "phone":
        if (!value.match(/^\d{10}$/)) error = "Phone number must be 10 digits";
        break;
      case "universityCode":
      case "department":
      case "gender":
      case "dob":
      if (!value) {
        error = "Date of birth is required";
      } else if (!isAtLeast15YearsOld(value)) {
        error = "Minimum age must be 15 years";
      }
      break;

      case "registrationCode":
        if (!value) error = "This field is required";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  const isAtLeast15YearsOld = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 15;
};


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
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };
  const isStepValid = () => {
    if (step === 1) {
      return formData.name && formData.email && formData.password && 
             formData.phone.length === 10 && formData.gender && formData.dob &&
             !errors.name && !errors.email && !errors.password && !errors.phone;
    }
    if (step === 2) {
      const basic = formData.universityCode && formData.department && formData.registrationCode;
      if (role === "student") return basic && formData.semester && formData.enrollmentNumber;
      return basic && formData.employeeId && formData.designation;
    }
    return formData.profilePhoto !== null;
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  /* ================= SUBMIT ================= */
  const handleRegister = async (e) => {
    e.preventDefault();
     if (!isAtLeast15YearsOld(formData.dob)) {
    alert("Minimum age required is 15 years");
    return;
  }
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

      alert("Registration request submitted for approval");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Server error");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full my-10 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 
                   bg-white/10 backdrop-blur-xl border border-white/10 
                   rounded-3xl shadow-2xl p-10 text-slate-200"
      >
        {/* ================= LEFT INFO PANEL ================= */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your Campus. One Platform.
          </h2>

          <p className="text-slate-300 text-lg">
            Campus Buddy is a secure academic collaboration hub connecting
            students and teachers within your university ecosystem.
          </p>

          <ul className="space-y-4 text-slate-300">
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              University-verified registration
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Notes, events, forums & study groups
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Role-based dashboards
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Secure approval workflow
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Real-time academic collaboration
            </li>
          </ul>

          <p className="text-sm text-slate-400 border-t border-white/10 pt-4">
            Trusted by departments across multiple universities
          </p>
        </div>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Create Your Account
          </h2>
          <p className="text-center text-slate-400 mb-6 text-sm">
            Registration requests are reviewed by your institution
          </p>

          {/* ROLE TOGGLE */}
          <div className="flex mb-6 bg-slate-900/60 rounded-full p-2 border border-white/10">
            {["student", "teacher"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-3xl font-medium transition-all ${
                  role === r
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* STEP INDICATOR */}
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-3 h-3 rounded-full ${
                  step >= s ? "bg-indigo-500" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-center text-slate-400 mb-4">
            ⓘ Account activation requires university approval
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWrapper name="name" errors={errors} touched={touched} formData={formData}>
                  <input className="input w-full" name="name" placeholder="Full Name" onChange={handleChange} onBlur={handleBlur} value={formData.name} />
                </InputWrapper>
                <InputWrapper name="email" errors={errors} touched={touched} formData={formData}>
                  <input className="input w-full" name="email" type="email" placeholder="Email Address" onChange={handleChange} onBlur={handleBlur} value={formData.email} />
                </InputWrapper>
                <InputWrapper name="password" errors={errors} touched={touched} formData={formData}>
                  <input className="input w-full" name="password" type="password" placeholder="Password" onChange={handleChange} onBlur={handleBlur} value={formData.password} />
                  <PasswordStrength password={formData.password} isVisible={touched.password || formData.password.length > 0}/>                
                </InputWrapper>
                <InputWrapper name="phone" errors={errors} touched={touched} formData={formData}>
                  <input className="input w-full" name="phone" placeholder="Phone Number" onChange={handleChange} onBlur={handleBlur} value={formData.phone} />
                </InputWrapper>
                <InputWrapper name="gender" errors={errors} touched={touched} formData={formData}>
                  <select className="input w-full" name="gender" onChange={handleChange} onBlur={handleBlur} value={formData.gender}>
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </InputWrapper>
                <InputWrapper name="dob" errors={errors} touched={touched} formData={formData}>
                  <DatePicker
  placeholderText="Date of Birth"
  className="input w-full"
  selected={formData.dob}
  onChange={(date) => {
    setFormData((p) => ({ ...p, dob: date }));
    setTouched((p) => ({ ...p, dob: true }));
    validateField("dob", date);
  }}
  maxDate={new Date()}
/>

                </InputWrapper>
                <button type="button" disabled={!isStepValid()} onClick={() => setStep(2)} className="btn-primary col-span-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Step
                </button>
              </motion.div>
            )}

            {/* ================= STEP 2 ================= */}
              {step === 2 && (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  className="space-y-6" // Matches the vertical spacing of Step 1
                >
                  {/* Grid container ensures proper horizontal alignment and margins */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* University Selection */}
                    <InputWrapper name="universityCode" errors={errors} touched={touched} formData={formData}>
                      <select 
                        className={`input w-full ${errors.universityCode && touched.universityCode ? 'border-red-500' : ''}`}
                        name="universityCode" 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        value={formData.universityCode}
                      >
                        <option value="">Select University</option>
                        {universities.map((u) => (
                          <option key={u._id} value={u.code}>{u.name}</option>
                        ))}
                      </select>
                    </InputWrapper>

                    {/* Department Selection */}
                    <InputWrapper name="department" errors={errors} touched={touched} formData={formData}>
                      <select 
                        className={`input w-full ${errors.department && touched.department ? 'border-red-500' : ''}`}
                        name="department" 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        value={formData.department}
                        disabled={!formData.universityCode}
                      >
                        <option value="">Select Department</option>
                        {departments.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </InputWrapper>

                    {/* Semester Selection (Students Only) */}
                    {role === "student" && (
                      <InputWrapper name="semester" errors={errors} touched={touched} formData={formData}>
                        <select 
                          className={`input w-full ${errors.semester && touched.semester ? 'border-red-500' : ''}`}
                          name="semester" 
                          onChange={handleChange} 
                          onBlur={handleBlur}
                          value={formData.semester}
                          disabled={!formData.department}
                        >
                          <option value="">Select Semester</option>
                          {semesters.map((s, i) => (
                            <option key={i} value={s}>{s}</option>
                          ))}
                        </select>
                      </InputWrapper>
                    )}

                    {/* Registration Code */}
                    <InputWrapper name="registrationCode" errors={errors} touched={touched} formData={formData}>
                      <input
                        className={`input w-full ${errors.registrationCode && touched.registrationCode ? 'border-red-500' : ''}`}
                        name="registrationCode"
                        placeholder={`${role === "student" ? "Student" : "Teacher"} Registration Code`}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={formData.registrationCode}
                      />
                    </InputWrapper>

                    {/* Role Specific Fields */}
                    {role === "student" ? (
                      <InputWrapper name="enrollmentNumber" errors={errors} touched={touched} formData={formData}>
                        <input 
                          className={`input w-full ${errors.enrollmentNumber && touched.enrollmentNumber ? 'border-red-500' : ''}`}
                          name="enrollmentNumber" 
                          placeholder="Enrollment Number" 
                          onChange={handleChange} 
                          onBlur={handleBlur}
                          value={formData.enrollmentNumber}
                        />
                      </InputWrapper>
                    ) : (
                      <>
                        <InputWrapper name="employeeId" errors={errors} touched={touched} formData={formData}>
                          <input 
                            className="input w-full"
                            name="employeeId" 
                            placeholder="Employee ID" 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            value={formData.employeeId}
                          />
                        </InputWrapper>
                        <InputWrapper name="designation" errors={errors} touched={touched} formData={formData}>
                          <input 
                            className="input w-full"
                            name="designation" 
                            placeholder="Designation" 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            value={formData.designation}
                          />
                        </InputWrapper>
                      </>
                    )}
                  </div>

                  {/* Action Buttons with Step 1 margins */}
                  <div className="flex justify-between gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      disabled={!isStepValid()} 
                      onClick={nextStep} 
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
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
                  <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
                  <button className="btn-primary" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Request Access"}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Login
            </Link>
          </p>

          <p className="text-center text-xs text-slate-500 mt-4">
            Your data is used strictly for academic verification
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
