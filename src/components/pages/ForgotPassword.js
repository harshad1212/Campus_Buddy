import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "✅ Password reset link sent! Check your email.",
        });
      } else {
        setMessage({
          type: "error",
          text: `❌ ${data.message || "Something went wrong"}`,
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "❌ Server error. Please try again.",
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

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10 w-full max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-2xl
          p-8 text-slate-200
        "
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Forgot Password 🔐
        </h2>
        <p className="text-center text-slate-400 mb-6">
          We’ll send you a reset link on your email
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-4 text-sm text-center px-4 py-3 rounded-xl
              ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }
            `}
          >
            {message.text}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
