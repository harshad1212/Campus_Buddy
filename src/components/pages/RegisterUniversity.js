import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const RegisterUniversity = () => {
  const [formData, setFormData] = useState({
    universityName: "",
    universityCode: "",
    teacherCode: "",
    studentCode: "",
    email: "",
    password: "",
    departments: [""],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDepartmentChange = (index, value) => {
    const updated = [...formData.departments];
    updated[index] = value;
    setFormData({ ...formData, departments: updated });
  };

  const addDepartment = () =>
    setFormData({ ...formData, departments: [...formData.departments, ""] });

  const removeDepartment = (index) =>
    setFormData({
      ...formData,
      departments: formData.departments.filter((_, i) => i !== index),
    });

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
          departments: formData.departments.filter((d) => d.trim() !== ""),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-2xl
          p-10 text-slate-200
        "
      >
        {/* ================= LEFT ADMIN INFO PANEL ================= */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Power Your University. One Control Panel.
          </h2>

          <p className="text-slate-300 text-lg">
            Campus Buddy enables universities to manage students, teachers,
            departments, and academic collaboration securely from one platform.
          </p>

          <ul className="space-y-4 text-slate-300">
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Centralized university management
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Role-based access for students & teachers
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Secure registration & approval workflows
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Department & academic structure control
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">✔</span>
              Scalable platform for campus collaboration
            </li>
          </ul>

          <p className="text-sm text-slate-400 border-t border-white/10 pt-4">
            Designed for university administrators & academic institutions
          </p>
        </div>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Register Your University
          </h2>
          <p className="text-center text-slate-400 mb-6 text-sm">
            Create a secure admin account to manage your campus
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* BASIC INFO */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["universityName", "University Name"],
                ["universityCode", "University Code"],
                ["teacherCode", "Teacher Registration Code"],
                ["studentCode", "Student Registration Code"],
                ["email", "Admin Email", "email"],
                ["password", "Admin Password", "password"],
              ].map(([name, placeholder, type = "text"]) => (
                <input
                  key={name}
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-slate-900/60 text-white
                    border border-white/10
                    focus:ring-2 focus:ring-indigo-500
                    outline-none
                  "
                />
              ))}
            </div>

            {/* DEPARTMENTS */}
            <div className="mt-4">
              <p className="text-sm text-slate-300 mb-2 font-medium">
                Academic Departments
              </p>

              <div className="space-y-2">
                {formData.departments.map((dept, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Department ${index + 1}`}
                      value={dept}
                      onChange={(e) =>
                        handleDepartmentChange(index, e.target.value)
                      }
                      required
                      className="
                        flex-1 px-4 py-3 rounded-xl
                        bg-slate-900/60 text-white
                        border border-white/10
                        focus:ring-2 focus:ring-indigo-500
                        outline-none
                      "
                    />
                    {formData.departments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDepartment(index)}
                        className="
                          px-3 rounded-xl
                          bg-red-500/20 text-red-400
                          hover:bg-red-500/30
                        "
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addDepartment}
                className="
                  mt-3 flex items-center gap-2
                  text-indigo-400 hover:text-indigo-300
                  text-sm font-medium
                "
              >
                <Plus size={16} /> Add Department
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full mt-6 py-3 rounded-xl
                bg-indigo-600 hover:bg-indigo-500
                text-white font-semibold
                flex items-center justify-center
                transition-all disabled:opacity-60
              "
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create University Workspace"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Already registered?{" "}
            <Link to="/admin-login" className="text-indigo-400 hover:underline">
              Login as Admin
            </Link>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            Administrative access is restricted to authorized university officials
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUniversity;
