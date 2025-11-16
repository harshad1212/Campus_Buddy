/* ==========================================================
   USERS LIST — FULL PROFESSIONAL TELEGRAM-STYLE REDESIGN
   ========================================================== */

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Search,
  UserPlus,
  XCircle,
  Check,
  Clock,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ==========================================================
   USER ROW COMPONENT (MODERN CARD)
   ========================================================== */

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
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 220 }}
    className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
      bg-white shadow-sm border border-gray-200
      hover:shadow-md hover:bg-blue-50/60 transition-all duration-200
      ${user.isBlocked ? "opacity-50" : ""}
    `}
    onClick={() => onClick(user)}
  >
    {/* Avatar */}
    <div className="relative">
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        className="w-12 h-12 rounded-full object-cover border border-blue-100 shadow"
        alt={user.name}
      />
      <span
        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
          user.online ? "bg-green-500" : "bg-gray-400"
        }`}
      />
    </div>

    {/* Name & Status */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700">
        {user.name}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {user.online ? (
          <span className="text-green-600 font-medium">Online</span>
        ) : (
          "Last seen " + (user.lastSeen || "recently")
        )}
      </p>
    </div>

    {/* ACTIONS */}
    <div className="flex items-center gap-2">

      {/* Add Friend */}
      {!user.isFriend && !user.status && !user.isBlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFriend(user);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm"
        >
          <UserPlus size={18} />
        </button>
      )}

      {/* Pending */}
      {user.status === "sent" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancelRequest(user);
          }}
          className="px-2.5 py-1 text-xs rounded-full border border-blue-300 bg-blue-50 text-blue-600"
        >
          <Clock size={14} className="inline-block mr-1" />
          Pending
        </button>
      )}

      {/* Request Received */}
      {user.status === "received" && (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAcceptRequest(user);
            }}
            className="px-2 py-1 text-xs rounded-full bg-green-100 border border-green-300 text-green-700"
          >
            <Check size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRejectRequest(user);
            }}
            className="px-2 py-1 text-xs rounded-full bg-red-100 border border-red-300 text-red-600"
          >
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Unblock */}
      {user.isBlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnblockUser(user);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow-sm"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  </motion.div>
);

/* ==========================================================
   MAIN USERS LIST COMPONENT
   ========================================================== */

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

  const menuRef = useRef();

  const apiBase =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  /* ==========================================================
     Close 3-dots menu when clicking outside
     ========================================================== */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ==========================================================
     Filtering logic
     ========================================================== */
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

  /* ==========================================================
     Universal API helper
     ========================================================== */
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
    <div className="flex flex-col h-full bg-white border border-gray-300 rounded-2xl shadow-lg overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="px-5 py-4 bg-blue-100/70 backdrop-blur-md border-b border-blue-200 flex justify-between items-center relative">
        <h2 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          {viewMode === "all"
            ? "All Users"
            : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
        </h2>

        {/* Three dots */}
        <div ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-blue-200/70 transition"
          >
            <svg
              className="w-5 h-5 text-blue-700"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>

          {/* MODE MENU */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-50"
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
                    className={`w-full text-left px-4 py-2 text-sm rounded-md transition 
                      ${
                        viewMode === key
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      setViewMode(key);
                      setMenuOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="p-3 border-b bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* ================= USER LIST ================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-blue-300">
        {localUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 text-gray-500">
            <Search className="w-6 h-6 mb-2 opacity-60" />
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
