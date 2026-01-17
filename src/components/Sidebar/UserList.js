import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Search, UserPlus, XCircle, Check, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= USER ROW ================= */
const UserRow = ({
  user,
  onClick,
  onAddFriend,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onUnblockUser,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    onClick={() => onClick(user)}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition
      ${user.isBlocked ? "opacity-50" : "hover:bg-white/5 active:bg-white/10"}
    `}
  >
    {/* Avatar */}
    <div className="relative">
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover border border-white/10"
      />
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
          user.online ? "bg-green-500" : "bg-gray-400"
        }`}
      />
    </div>

    {/* Name + Status */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-100 truncate">
        {user.name}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {user.online ? (
          <span className="text-green-400 font-medium">Online</span>
        ) : (
          `Last seen ${user.lastSeen || "recently"}`
        )}
      </p>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 shrink-0">
      {!user.isFriend && !user.status && !user.isBlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFriend(user);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full
            bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition"
        >
          <UserPlus size={18} />
        </button>
      )}

      {user.status === "sent" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancelRequest(user);
          }}
          className="px-3 py-1 text-[11px] rounded-full
            bg-indigo-600/10 text-indigo-400 flex items-center gap-1"
        >
          <Clock size={12} />
          Pending
        </button>
      )}

      {user.status === "received" && (
        <div className="flex gap-2">
          <button
  onClick={(e) => {
    e.stopPropagation();
    onAcceptRequest(user);
  }}
  className="w-9 h-9 rounded-full
    bg-green-600/20 text-green-400 hover:bg-green-600/30
    flex items-center justify-center"
>
  <Check size={16} strokeWidth={2.2} />
</button>

<button
  onClick={(e) => {
    e.stopPropagation();
    onRejectRequest(user);
  }}
  className="w-9 h-9 rounded-full
    bg-red-600/20 text-red-400 hover:bg-red-600/30
    flex items-center justify-center"
>
  <XCircle size={16} strokeWidth={2.2} />
</button>

        </div>
      )}

      {user.isBlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnblockUser(user);
          }}
          className="w-9 h-9 rounded-full
            bg-red-600/20 text-red-400 hover:bg-red-600/30"
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  </motion.div>
);

/* ================= USERS LIST ================= */
const UsersList = ({
  users,
  currentUserId,
  currentUserUniversityId,
  onStartPrivateChat,
  token,
  friendData,
  refreshUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localUsers, setLocalUsers] = useState([]);
  const [viewMode, setViewMode] = useState("friends");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:4000";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const matchesUni = (u) => u.universityId === currentUserUniversityId;
    const transform = (u) => ({
      ...u,
      isFriend: friendData?.friends?.includes(u._id),
      isBlocked: friendData?.blocked?.includes(u._id),
      status: friendData?.sent?.includes(u._id)
        ? "sent"
        : friendData?.received?.includes(u._id)
        ? "received"
        : null,
    });

    let list = [];
    if (searchTerm) {
      list = users
        .filter(
          (u) =>
            matchesUni(u) &&
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(transform);
    } else {
      const filters = {
        all: (u) => u._id !== currentUserId && matchesUni(u),
        friends: (u) => friendData?.friends?.includes(u._id),
        received: (u) => friendData?.received?.includes(u._id),
        sent: (u) => friendData?.sent?.includes(u._id),
        blocked: (u) => friendData?.blocked?.includes(u._id),
      };
      list = users.filter(filters[viewMode]).map(transform);
    }

    setLocalUsers(list);
  }, [
    users,
    viewMode,
    searchTerm,
    friendData,
    currentUserId,
    currentUserUniversityId,
  ]);

  const perform = async (url, method = "POST") => {
    try {
      const res = await fetch(`${apiBase}${url}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);
      refreshUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-white/10">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between
        border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Users size={16} className="text-indigo-400" />
          {viewMode === "all"
            ? "All Users"
            : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
        </h2>

        <div ref={menuRef} className="relative">
          <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-2 rounded-full hover:bg-white/10"
              >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 mt-2 w-48
                  bg-slate-800 border border-white/10
                  rounded-xl shadow-lg z-50"
              >
                {[
                  ["all", "All Users"],
                  ["friends", "Friends"],
                  ["received", "Requests Received"],
                  ["sent", "Requests Sent"],
                  ["blocked", "Blocked Users"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setViewMode(key);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition
                      ${
                        viewMode === key
                          ? "bg-indigo-600/20 text-indigo-400 font-medium"
                          : "hover:bg-white/5 text-slate-300"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/10 bg-slate-900">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full
          bg-slate-800 border border-white/10
          focus-within:ring-2 focus-within:ring-indigo-500">
          <Search size={14} className="text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-transparent outline-none text-sm
              text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {localUsers.length === 0 ? (
          <div className="text-sm text-slate-400 text-center mt-10">
            No users found
          </div>
        ) : (
          localUsers.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              onClick={() =>
                user.isFriend && !user.isBlocked && onStartPrivateChat(user)
              }
              onAddFriend={(u) =>
                perform(`/api/friends/send-request/${u._id}`)
              }
              onCancelRequest={(u) =>
                perform(`/api/friends/cancel-request/${u._id}`, "DELETE")
              }
              onAcceptRequest={(u) =>
                perform(`/api/friends/accept-request/${u._id}`)
              }
              onRejectRequest={(u) =>
                perform(`/api/friends/reject-request/${u._id}`)
              }
              onUnblockUser={(u) =>
                perform(`/api/friends/unblock/${u._id}`, "DELETE")
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

UsersList.propTypes = {
  users: PropTypes.array.isRequired,
  currentUserId: PropTypes.string.isRequired,
  currentUserUniversityId: PropTypes.string.isRequired,
  onStartPrivateChat: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  friendData: PropTypes.object,
  refreshUsers: PropTypes.func.isRequired,
};

export default UsersList;
