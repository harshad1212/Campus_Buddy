// src/components/pages/Leaderboard.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "../pages/Header";

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
      <div className="min-h-screen flex items-center justify-center font-semibold text-blue-700">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto">
        <div className="text-center my-8">
          <h1 className="text-4xl font-bold text-blue-900">🏆 Campus Leaderboard</h1>
          <p className="text-gray-600 mt-2">
            Recognizing top contributors across campus
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full font-semibold ${
                activeFilter === f.key
                  ? "bg-blue-700 text-white"
                  : "bg-white border text-blue-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isMe = user.userId === currentUserId;
            const points = getPointsByFilter(user);
            const progress = Math.round((points / maxPoints) * 100);

            return (
              <div
                key={user.rank}
                className={`p-4 bg-white rounded-2xl shadow border ${
                  isMe ? "border-blue-500 ring-2 ring-blue-200" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-blue-800">#{user.rank}</span>
                    <img
                      src={user.avatarUrl || "/default-avatar.png"}
                      className="w-12 h-12 rounded-full"
                      alt=""
                    />
                    <div>
                      <p className="font-semibold">
                        {user.name} {isMe && "(You)"}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs">
                        {user.forumBadges.map((b, i) => (
                          <span key={i} className="px-2 py-1 bg-yellow-100 rounded">
                            🧠 {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="text-xl font-bold text-blue-700">
                      {points} pts
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
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
