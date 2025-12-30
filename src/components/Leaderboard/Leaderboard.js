import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const FILTERS = [
  { key: "total", label: "Overall" },
  { key: "resource", label: "Resources" },
  { key: "forum", label: "Forum" },
  { key: "event", label: "Events" },
];

const PERIODS = ["All Time", "Weekly", "Monthly"];

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("total");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("All Time");

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "/api/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- HELPERS ---------------- */
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

  const getMaxPoints = (list) =>
    Math.max(...list.map((u) => getPointsByFilter(u)), 1);

  const getCategoryBadge = () => {
    if (activeFilter === "resource") return "📚 Resource Champ";
    if (activeFilter === "forum") return "🧠 Forum Star";
    if (activeFilter === "event") return "🎉 Event Leader";
    return "🏆 Overall Rank";
  };

  /* ---------------- FILTER + SORT ---------------- */
  const filteredUsers = useMemo(() => {
    let list = [...users];

    // 🔍 Search
    if (search.trim()) {
      list = list.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🔢 Sort by active category
    list.sort((a, b) => getPointsByFilter(b) - getPointsByFilter(a));

    // 🥇 Re-rank
    return list.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [users, activeFilter, search]);

  const maxPoints = getMaxPoints(filteredUsers);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-blue-700">
        Loading leaderboard...
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-blue-50 px-4 sm:px-6 py-8">
      <main className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">
            🏆 Campus Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">
            Recognizing top contributors across campus
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          {/* Search */}
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
          />

          {/* Period Toggle */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  period === p
                    ? "bg-blue-700 text-white"
                    : "bg-white border border-blue-200 text-blue-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                activeFilter === f.key
                  ? "bg-blue-700 text-white shadow"
                  : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500">
              No users found.
            </p>
          )}

          {filteredUsers.map((user) => {
            const isMe = user.userId === currentUserId;
            const points = getPointsByFilter(user);
            const progress = Math.round((points / maxPoints) * 100);

            return (
              <div
                key={user.rank}
                className={`p-4 bg-white rounded-2xl shadow border transition hover:shadow-lg ${
                  isMe
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-blue-800 w-8">
                      #{user.rank}
                    </span>

                    <img
                      src={user.avatarUrl || "/default-avatar.png"}
                      alt="avatar"
                      className="w-12 h-12 rounded-full"
                    />

                    <div>
                      <p className="font-semibold text-blue-900">
                        {user.name} {isMe && "(You)"}
                      </p>

                      <div className="flex flex-wrap gap-2 text-xs mt-1">
                        <span className="px-2 py-1 bg-blue-100 rounded border">
                          {getCategoryBadge()}
                        </span>

                        {user.forumBadges.map((b, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-yellow-100 rounded border"
                          >
                            {b === "Top Helper" ? "🧠" : "⭐"} {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500 capitalize">
                      {activeFilter === "total"
                        ? "Total Points"
                        : `${activeFilter} Points`}
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {points} pts
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
