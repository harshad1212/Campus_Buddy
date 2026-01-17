// src/components/pages/Leaderboard.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import { LuTrophy } from "react-icons/lu";

const FILTERS = [
  { key: "total", label: "Overall" },
  { key: "resource", label: "Resources" },
  { key: "forum", label: "Forum" },
  { key: "event", label: "Events" },
];

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("total");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "/api/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPointsByFilter = (user) => {
    switch (activeFilter) {
      case "resource":
        return user.resourcePoints || 0;
      case "forum":
        return user.forumPoints || 0;
      case "event":
        return user.eventPoints || 0;
      default:
        return user.points || 0;
    }
  };

  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      list = list.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    list.sort((a, b) => getPointsByFilter(b) - getPointsByFilter(a));
    return list.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [users, activeFilter, search]);

  const maxPoints = Math.max(
    ...filteredUsers.map((u) => getPointsByFilter(u)),
    1
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-400 font-semibold animate-pulse">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-9">
        {/* HERO */}
        <section className="text-center mb-5">
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center text-4xl">
              <LuTrophy />
            </div>
            <h1 className="text-4xl font-bold text-white my-4">
            Campus Leaderboard
          </h1>
          </div>
    
          <p className="text-slate-300">
            Top contributors across Campus Buddy
          </p>
        </section>

        {/* FILTERS */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
                ${
                  activeFilter === f.key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105"
                    : "bg-white/10 border border-white/10 text-slate-200 hover:bg-white/20"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="mb-6 max-w-md mx-auto">
          <input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full rounded-xl px-5 py-3 text-sm
              bg-white/10 border border-white/10
              text-slate-200 placeholder-slate-400
              backdrop-blur-xl
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* LEADERBOARD LIST */}
        <div className="space-y-6">
          {filteredUsers.map((user) => {
            const isMe = user.userId === currentUserId;
            const points = getPointsByFilter(user);
            const progress = Math.round((points / maxPoints) * 100);

            return (
              <div
                key={user.rank}
                className={`
                  group relative rounded-3xl p-6
                  bg-white/10 backdrop-blur-xl border border-white/10
                  shadow-xl transition-all duration-300
                  hover:-translate-y-1 hover:shadow-indigo-500/30
                  ${
                    isMe
                      ? "ring-2 ring-indigo-500 shadow-indigo-500/40"
                      : ""
                  }
                `}
              >
                {/* Rank */}
                <span className="absolute -top-3 -left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  #{user.rank}
                </span>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatarUrl || "/default-avatar.png"}
                      className="w-12 h-12 rounded-full border border-white/20 object-cover"
                      alt=""
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {user.name}{" "}
                        {isMe && (
                          <span className="text-indigo-400 text-xs font-bold ml-1">
                            (You)
                          </span>
                        )}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                        {user.forumBadges?.map((b, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold"
                          >
                            🧠 {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Points
                    </p>
                    <p className="text-2xl font-bold text-indigo-400">
                      {points}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-5">
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
