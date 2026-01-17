import React, { useMemo } from "react";

const FILTERS = [
  { key: "total", label: "Overall" },
  { key: "resource", label: "Resources" },
  { key: "forum", label: "Forum" },
  { key: "event", label: "Events" },
];

const LeaderboardContent = ({
  users,
  loading,
  activeFilter,
  setActiveFilter,
  search,
  setSearch,
  currentUserId,
}) => {
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
      <div className="py-24 text-center text-lg font-semibold text-blue-700 animate-pulse">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${
                activeFilter === f.key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                  : "bg-white/70 backdrop-blur border border-blue-200 text-blue-700 hover:bg-blue-50"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <input
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-blue-200 bg-white/80 backdrop-blur px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Leaderboard */}
      <div className="space-y-5">
        {filteredUsers.map((user) => {
          const isMe = user.userId === currentUserId;
          const points = getPointsByFilter(user);
          const progress = Math.round((points / maxPoints) * 100);

          return (
            <div
              key={user.rank}
              className={`relative rounded-2xl border p-5 transition-all
                ${
                  isMe
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-lg ring-2 ring-blue-200"
                    : "bg-white/80 backdrop-blur border-blue-100 shadow hover:shadow-md"
                }`}
            >
              {/* Rank badge */}
              <span className="absolute -top-3 -left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                #{user.rank}
              </span>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    className="w-11 h-11 rounded-full border border-blue-200 object-cover"
                    alt=""
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {user.name}{" "}
                      {isMe && (
                        <span className="text-blue-600 text-xs font-bold ml-1">
                          (You)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Points
                  </p>
                  <p className="text-xl font-extrabold text-blue-700">
                    {points}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="w-full h-2.5 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LeaderboardContent;
