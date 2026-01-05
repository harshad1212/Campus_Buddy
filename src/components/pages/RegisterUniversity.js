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
    <div className="relative py-10 min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-950 flex items-center justify-center px-4">

      {/* BACKGROUND BLOBS */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 40, -20], y: [0, 30, -10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -40, 20], y: [0, -30, 10] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10 w-full max-w-2xl
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-2xl
          p-8 text-slate-200
        "
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Register Your University 🏫
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Create your university admin account
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
              Departments
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
              "Register University"
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            to="/admin-login"
            className="text-indigo-400 hover:underline"
          >
            Login as Admin
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUniversity;
