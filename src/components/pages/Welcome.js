import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Welcome = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 flex items-center justify-center px-4">

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

      {/* MAIN CARD */}
      <motion.div
        className="
          relative z-10 my-10
          w-full max-w-3xl
          bg-white/10 backdrop-blur-xl
          border border-white/10
          rounded-3xl shadow-2xl
          p-12 text-center text-slate-200
        "
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* BRAND */}
        <motion.h1
          className="text-5xl font-extrabold text-white mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Campus Buddy
        </motion.h1>

        <motion.p
          className="text-lg text-slate-300 mb-8 max-w-xl mx-auto"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          A unified digital platform designed to connect students, teachers,
          and university administration into one secure academic ecosystem.
        </motion.p>

        {/* FEATURES PREVIEW */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            ["🎓", "Student Collaboration", "Access notes, forums, events, and study groups"],
            ["👨‍🏫", "Teacher Engagement", "Share resources, manage events, guide students"],
            ["🏫", "University Management", "Admin-controlled access, departments, and users"],
          ].map(([icon, title, desc]) => (
            <div
              key={title}
              className="
                bg-slate-900/60 border border-white/10
                rounded-2xl p-5
              "
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link to="/login">
            <button
              className="
                px-8 py-3 rounded-xl outlined-btn
                hover:bg-indigo-500
                text-white font-semibold text-lg
                shadow-lg shadow-indigo-500/40
                transition-all
              "
            >
              Get Started
            </button>
          </Link>
        </motion.div>

        {/* FOOTER NOTE */}
        <p className="text-xs text-slate-500 mt-8">
          Secure • Role-based • University verified access
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
