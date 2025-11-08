import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, UserPlus, XCircle, Check, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

// ✅ User Row Component
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
    transition={{ type: "spring", stiffness: 300 }}
    className={`group flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition ${
      user.isBlocked ? "opacity-70" : ""
    }`}
    onClick={() => onClick(user)}
  >
    <div className="relative">
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        alt={`${user.name} avatar`}
        className="w-12 h-12 rounded-full object-cover border border-blue-100 shadow-sm"
      />
      <span
        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
          user.online ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold truncate text-gray-900 group-hover:text-blue-700 transition">
          {user.name}
        </span>
      </div>
      <div className="text-xs text-gray-500 truncate mt-0.5">
        {user.online ? (
          <span className="text-green-500 font-medium">Online</span>
        ) : (
          `Last seen ${user.lastSeen || "recently"}`
        )}
      </div>
    </div>

    <div className="flex items-center gap-2">
      {!user.isFriend && !user.status && !user.isBlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFriend(user);
          }}
          className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
          title="Send Friend Request"
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
          className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
        >
          <Clock size={14} className="inline-block mr-1" />
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
            className="px-2 py-1 text-xs bg-green-50 border border-green-200 text-green-600 rounded-md hover:bg-green-100 transition"
          >
            <Check size={14} className="inline-block mr-1" />
            Accept
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRejectRequest(user);
            }}
            className="px-2 py-1 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md hover:bg-red-100 transition"
          >
            <XCircle size={14} className="inline-block mr-1" />
            Reject
          </button>
        </div>
      )}

      {user.isBlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnblockUser(user);
          }}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition"
          title="Unblock User"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  </motion.div>
);

// ✅ Main Users List Component
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

  const apiBase =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    let filtered = [];

    switch (viewMode) {
      case "all":
        filtered = users
          .filter(
            (u) =>
              u._id !== currentUserId &&
              u.universityId === currentUserUniversityId // ✅ limit by university
          )
          .map((u) => ({
            ...u,
            isFriend: friendData?.friends?.includes(u._id),
            isBlocked: friendData?.blocked?.includes(u._id),
            status: friendData?.sent?.includes(u._id)
              ? "sent"
              : friendData?.received?.includes(u._id)
              ? "received"
              : null,
          }));
        break;

      case "friends":
        filtered = users
          .filter(
            (u) =>
              friendData?.friends?.includes(u._id) &&
              u.universityId === currentUserUniversityId &&
              u._id !== currentUserId
          )
          .map((u) => ({
            ...u,
            isFriend: true,
            isBlocked: friendData?.blocked?.includes(u._id),
          }));
        break;

      case "received":
        filtered = users
          .filter(
            (u) =>
              friendData?.received?.includes(u._id) &&
              u.universityId === currentUserUniversityId
          )
          .map((u) => ({ ...u, status: "received" }));
        break;

      case "sent":
        filtered = users
          .filter(
            (u) =>
              friendData?.sent?.includes(u._id) &&
              u.universityId === currentUserUniversityId
          )
          .map((u) => ({ ...u, status: "sent" }));
        break;

      case "blocked":
        filtered = users
          .filter(
            (u) =>
              friendData?.blocked?.includes(u._id) &&
              u.universityId === currentUserUniversityId
          )
          .map((u) => ({ ...u, isBlocked: true }));
        break;

      default:
        filtered = [];
    }

    // ✅ Search only same university users
    if (searchTerm.trim()) {
      filtered = users
        .filter(
          (u) =>
            u.universityId === currentUserUniversityId && // ✅ same university restriction
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((u) => ({
          ...u,
          isFriend: friendData?.friends?.includes(u._id),
          isBlocked: friendData?.blocked?.includes(u._id),
          status: friendData?.sent?.includes(u._id)
            ? "sent"
            : friendData?.received?.includes(u._id)
            ? "received"
            : null,
        }));
    }

    setLocalUsers(filtered);
  }, [
    users,
    viewMode,
    searchTerm,
    currentUserId,
    currentUserUniversityId,
    friendData,
  ]);

  const handleAfterAction = async (data) => {
    if (data?.message) alert(data.message);
    if (typeof refreshUsers === "function") await refreshUsers();
  };

  const handleAddFriend = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/send-request/${user._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) await handleAfterAction(data);
      else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelRequest = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/cancel-request/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) await handleAfterAction(data);
      else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/accept-request/${user._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) await handleAfterAction(data);
      else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/reject-request/${user._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) await handleAfterAction(data);
      else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/unblock/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) await handleAfterAction(data);
      else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickUser = (user) => {
    if (user.isFriend && !user.isBlocked) onStartPrivateChat(user);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-md">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-blue-50 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          {viewMode === "all"
            ? "All Users"
            : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
        </h2>

        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="text-sm font-medium border border-blue-200 rounded-md px-3 py-1 bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All Users</option>
          <option value="friends">Friends</option>
          <option value="received">Received</option>
          <option value="sent">Sent</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Search */}
      <div className="p-3 border-b bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users from your university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 hover:scrollbar-thumb-blue-300">
        {localUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm py-10">
            <Search className="w-6 h-6 mb-2 opacity-60" />
            No users found in your university
          </div>
        ) : (
          localUsers.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              onClick={handleClickUser}
              onAddFriend={handleAddFriend}
              onCancelRequest={handleCancelRequest}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onUnblockUser={handleUnblockUser}
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
  friendData: PropTypes.shape({
    friends: PropTypes.array,
    received: PropTypes.array,
    sent: PropTypes.array,
    blocked: PropTypes.array,
  }),
  refreshUsers: PropTypes.func.isRequired,
};

export default UsersList;
