import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, UserPlus } from "lucide-react";

// ✅ User Row Component
const UserRow = ({
  user,
  onClick,
  onAddFriend,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
}) => (
  <div
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition rounded-xl cursor-pointer"
    onClick={() => onClick(user)}
  >
    {/* Avatar */}
    <div className="relative">
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        alt={`${user.name} avatar`}
        className="w-12 h-12 rounded-full object-cover border border-gray-200"
      />
      <span
        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
          user.online ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold truncate text-gray-900">
          {user.name}
        </span>
        {user.unreadCount > 0 && (
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {user.unreadCount}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 truncate mt-0.5">
        {user.online ? "Online" : `Last seen ${user.lastSeen || "recently"}`}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-2">
      {!user.isFriend && !user.status && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFriend(user);
          }}
          className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
        >
          <UserPlus size={16} />
        </button>
      )}

      {user.status === "sent" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancelRequest(user);
          }}
          className="text-xs text-gray-500 hover:text-red-500 transition"
        >
          Cancel
        </button>
      )}

      {user.status === "received" && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAcceptRequest(user);
            }}
            className="text-xs text-green-600 hover:text-green-800 transition"
          >
            Accept
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRejectRequest(user);
            }}
            className="text-xs text-red-600 hover:text-red-800 transition"
          >
            Reject
          </button>
        </>
      )}
    </div>
  </div>
);

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onAddFriend: PropTypes.func.isRequired,
};

// ✅ Main Users List Component
const UsersList = ({
  users,
  currentUserId,
  currentUserUniversityId,
  onStartPrivateChat,
  token,
  friendData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localUsers, setLocalUsers] = useState([]);
  const [viewMode, setViewMode] = useState("friends"); // default view mode

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  // ✅ Filtering logic
  useEffect(() => {
    let filtered = [];

    switch (viewMode) {
      case "friends":
        filtered = users
          .filter(
            (u) =>
              friendData?.friends?.includes(u._id) &&
              u.universityId === currentUserUniversityId &&
              u._id !== currentUserId
          )
          .map((u) => ({ ...u, isFriend: true }));
        break;

      case "received":
        filtered = users
          .filter((u) => friendData?.received?.includes(u._id))
          .map((u) => ({ ...u, status: "received" }));
        break;

      case "sent":
        filtered = users
          .filter((u) => friendData?.sent?.includes(u._id))
          .map((u) => ({ ...u, status: "sent" }));
        break;

      case "blocked":
        filtered = users
          .filter((u) => friendData?.blocked?.includes(u._id))
          .map((u) => ({ ...u, status: "blocked" }));
        break;

      default:
        filtered = [];
    }

    // ✅ Apply search filter
    if (searchTerm.trim()) {
      const searched = users
        .filter(
          (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            u.universityId === currentUserUniversityId &&
            u._id !== currentUserId
        )
        .map((u) => ({
          ...u,
          isFriend: friendData?.friends?.includes(u._id),
          status: friendData?.received?.includes(u._id)
            ? "received"
            : friendData?.sent?.includes(u._id)
            ? "sent"
            : friendData?.blocked?.includes(u._id)
            ? "blocked"
            : null,
        }));
      filtered = searched;
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

  // ✅ Friend Actions
  const handleAddFriend = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/send-request/${user._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: "sent" } : u))
        );
      } else alert(data.error);
    } catch (err) {
      console.error(err);
      alert("Failed to send friend request");
    }
  };

  const handleCancelRequest = async (user) => {
    try {
      const res = await fetch(`${apiBase}/api/friends/cancel-request/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: null } : u))
        );
      } else alert(data.error);
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
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, status: null, isFriend: true } : u
          )
        );
      } else alert(data.error);
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
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: null } : u))
        );
      } else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickUser = (user) => {
    if (user.isFriend) onStartPrivateChat(user);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-blue-50 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-sm font-semibold text-blue-700">User List</h2>

        {/* Dropdown for view mode */}
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="text-sm font-medium border border-blue-200 rounded-md px-3 py-1 bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="friends">Friends</option>
          <option value="received">Received Requests</option>
          <option value="sent">Sent Requests</option>
          <option value="blocked">Blocked Users</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center bg-gray-100 rounded-full border border-gray-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {localUsers.length === 0 ? (
          <div className="p-5 text-center text-gray-400 text-sm">
            No users found
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
};

export default UsersList;
