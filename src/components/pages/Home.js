import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  LuBookOpen,
  LuCalendarDays,
  LuMessageCircle,
  LuUsers,
  LuTrophy,
} from "react-icons/lu";
import Header from "./Header";
import Footer from "./Footer";

const Home = () => {
  const [stats, setStats] = useState({
    resources: 0,
    events: 0,
    discussions: 0,
    users: 0,
  });

  const [animatedStats, setAnimatedStats] = useState({
    resources: 0,
    events: 0,
    discussions: 0,
    users: 0,
  });

  /* =========================
     FETCH STATS
  ========================= */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          process.env.REACT_APP_API_URL + "/api/stats"
        );
        setStats(res.data);
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };

    fetchStats();
  }, []);

  /* =========================
     COUNT-UP ANIMATION
  ========================= */
  useEffect(() => {
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      setAnimatedStats({
        resources: Math.floor(progress * stats.resources),
        events: Math.floor(progress * stats.events),
        discussions: Math.floor(progress * stats.discussions),
        users: Math.floor(progress * stats.users),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [stats]);

  /* =========================
     FORMAT COUNTS
  ========================= */
  const formatCount = (count) => {
    if (count < 100) return count;
    if (count < 1000) return `${count}+`;
    return `${Math.floor(count / 1000)}K+`;
  };

  const sections = [
    {
      title: "Resources",
      description:
        "Upload, browse, and manage notes, assignments, and study materials.",
      icon: <LuBookOpen />,
      link: "/see-resources",
    },
    {
      title: "Events",
      description:
        "Create and join seminars, workshops, and campus events.",
      icon: <LuCalendarDays />,
      link: "/events",
    },
    {
      title: "Chat",
      description:
        "Real-time chats with students and teachers.",
      icon: <LuMessageCircle />,
      link: "/chat",
    },
    {
      title: "Forum",
      description:
        "Ask questions and participate in discussions.",
      icon: <LuUsers />,
      link: "/forum",
    },
    {
      title: "Leaderboard",
      description:
        "Track points and top contributors.",
      icon: <LuTrophy />,
      link: "/leaderboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-14">
        {/* HERO */}
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-indigo-400">Campus Buddy</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Your all-in-one campus platform for resources, events, chats, and
            collaboration.
          </p>
        </section>

        {/* STATS */}
        <section className="mb-16">
          <div className="
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-3xl
            px-8 py-10
          ">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <Stat
                value={formatCount(animatedStats.resources)}
                label="Resources Uploaded"
              />
              <Stat
                value={formatCount(animatedStats.events)}
                label="Events Conducted"
              />
              <Stat
                value={formatCount(animatedStats.discussions)}
                label="Forum Discussions"
              />
              <Stat
                value={formatCount(animatedStats.users)}
                label="Active Users"
              />
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex justify-center mb-6">
                <div
                  className="
                    w-24 h-24 flex items-center justify-center rounded-3xl
                    bg-indigo-500/20 text-indigo-400 text-5xl
                    transition-all duration-300 ease-out
                    group-hover:scale-110
                    group-hover:animate-pulse
                    group-hover:shadow-lg
                    group-hover:shadow-indigo-500/40
                    "
                >
                  {section.icon}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-3 text-center">
                {section.title}
              </h2>

              <p className="text-slate-300 text-sm mb-6 text-center">
                {section.description}
              </p>

              <Link to={section.link}>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition">
                  Go to {section.title}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

/* =========================
   STAT COMPONENT
========================= */
const Stat = ({ value, label }) => (
  <div>
    <p className="text-4xl font-bold text-indigo-400">{value}</p>
    <p className="mt-2 text-slate-300 text-sm">{label}</p>
  </div>
);

export default Home;
