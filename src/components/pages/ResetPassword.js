import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/password/reset/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok)
        setMessage({
          type: "success",
          text: "✅ Password reset successfully. You can now login.",
        });
      else
        setMessage({
          type: "error",
          text: `❌ ${data.message}`,
        });
    } catch (err) {
      setMessage({
        type: "error",
        text: "❌ Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-950 flex items-center justify-center px-4">

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
      <motion.div
        className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 20, -30], y: [0, -20, 10] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10
          w-full max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-2xl
          p-8 text-slate-200
        "
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Reset Password 🔒
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="
              w-full px-4 py-3 rounded-xl
              bg-slate-900/60 text-white
              border border-white/10
              focus:ring-2 focus:ring-indigo-500
              outline-none
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-indigo-600 hover:bg-indigo-500
              text-white font-semibold
              flex items-center justify-center
              transition-all disabled:opacity-60
            "
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.type === "success"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="text-indigo-400 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
