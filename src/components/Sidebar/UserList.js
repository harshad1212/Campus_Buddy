import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search } from "lucide-react";

const UserRow = ({ user, onClick }) => (
  <button
    onClick={() => onClick(user)}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 focus:outline-none focus:bg-blue-100 transition rounded-xl text-left group"
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

        {/* 🔵 Unread badge */}
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
  </button>
);

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

const UsersList = ({
  users,
  currentUserId,
  onStartPrivateChat,
  activeChatId,
  socket,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // 🟢 Request Notification Permission once when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 🟢 Listen for new incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Ignore messages from current user
      if (msg.sender?._id === currentUserId) return;

      const senderId = msg.sender?._id || msg.sender;
      const isChatOpen =
        activeChatId === msg.chat?._id || msg.chat === activeChatId;

      // 🟢 Trigger browser notification if chat not open
      if (
        !isChatOpen &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(msg.sender?.name || "New message", {
          body: msg.content || "You have a new message",
          icon: msg.sender?.avatarUrl || "/default-avatar.png",
        });
      }

      // Increment unread count if chat isn't open
      setLocalUsers((prev) =>
        prev.map((u) => {
          if (u._id === senderId) {
            return {
              ...u,
              unreadCount: isChatOpen ? 0 : (u.unreadCount || 0) + 1,
            };
          }
          return u;
        })
      );
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [socket, currentUserId, activeChatId]);

  const handleClickUser = (user) => {
    // Clear unread count when opening chat
    setLocalUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u))
    );
    onStartPrivateChat(user);
  };

  const filteredUsers = localUsers
    .filter((u) => u._id !== currentUserId)
    .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-blue-50 rounded-t-2xl">
        <h2 className="text-sm font-semibold text-blue-700">All Users</h2>
      </div>

      {/* Search */}
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
        {filteredUsers.length === 0 ? (
          <div className="p-5 text-center text-gray-400 text-sm">
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserRow key={user._id} user={user} onClick={handleClickUser} />
          ))
        )}
      </div>
    </div>
  );
};

UsersList.propTypes = {
  users: PropTypes.array.isRequired,
  onStartPrivateChat: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  activeChatId: PropTypes.string,
  socket: PropTypes.object,
};

export default UsersList;
