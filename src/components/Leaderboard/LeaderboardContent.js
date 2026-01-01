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
      <div className="py-20 text-center font-semibold text-blue-700">
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

      {/* Search */}
      <input
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-2 rounded-lg w-full mb-6"
      />

      {/* Leaderboard List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const isMe = user.userId === currentUserId;
          const points = getPointsByFilter(user);
          const progress = Math.round((points / maxPoints) * 100);

          return (
            <div
              key={user.rank}
              className={`p-4 bg-white rounded-xl shadow border ${
                isMe ? "border-blue-500 ring-2 ring-blue-200" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-800">
                    #{user.rank}
                  </span>
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full"
                    alt=""
                  />
                  <div>
                    <p className="font-semibold">
                      {user.name} {isMe && "(You)"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="text-lg font-bold text-blue-700">
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
    </>
  );
};

export default LeaderboardContent;
