import React from "react";
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
  const sections = [
    {
      title: "Resources",
      description:
        "Upload, browse, and manage notes, assignments, and study materials for your courses.",
      icon: <LuBookOpen />,
      link: "/see-resources",
    },
    {
      title: "Events",
      description:
        "Create and join seminars, workshops, and campus events. Stay updated with reminders.",
      icon: <LuCalendarDays />,
      link: "/events",
    },
    {
      title: "Chat",
      description:
        "Real-time 1-to-1 or group chats with students and teachers for seamless communication.",
      icon: <LuMessageCircle />,
      link: "/chat",
    },
    {
      title: "Forum",
      description:
        "Ask questions, answer queries, and participate in campus-wide discussions.",
      icon: <LuUsers />,
      link: "/forum",
    },
    {
      title: "Leaderboard",
      description:
        "Track points, badges, and top contributors across the campus.",
      icon: <LuTrophy />,
      link: "/leaderboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-14">
        {/* Hero */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-indigo-400">Campus Buddy</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Your all-in-one campus platform for resources, events, chats, and
            collaboration.
          </p>
        </section>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* OUTLINED ICON */}
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

export default Home;
