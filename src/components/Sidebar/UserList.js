import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, UserPlus } from "lucide-react";

const UserRow = ({ user, onClick, onAddFriend }) => (
  <div className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition rounded-xl text-left group">
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

    {/* Add Friend Button */}
    {!user.isFriend && (
      <button
        onClick={() => onAddFriend(user)}
        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
      >
        <UserPlus size={16} />
      </button>
    )}
  </div>
);

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onAddFriend: PropTypes.func,
};

const UsersList = ({
  users,
  currentUserId,
  onStartPrivateChat,
  activeChatId,
  socket,
  token,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localUsers, setLocalUsers] = useState(users);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

// ✅ Handle incoming friend requests
useEffect(() => {
  if (!socket) return;

  const handleFriendRequest = ({ from }) => {
    if (Notification.permission === "granted") {
      const n = new Notification("New Friend Request", {
        body: `${from.name} sent you a friend request!`,
        icon: from.avatarUrl || "/default-avatar.png",
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } else {
      alert(`${from.name} sent you a friend request!`);
    }
  };

  socket.on("friend-request", handleFriendRequest);
  return () => socket.off("friend-request", handleFriendRequest);
}, [socket]);



  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Handle new message notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.sender?._id === currentUserId) return;

      const senderId = msg.sender?._id || msg.sender;
      const isChatOpen =
        activeChatId === msg.chat?._id || msg.chat === activeChatId;

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

      setLocalUsers((prev) =>
        prev.map((u) =>
          u._id === senderId
            ? { ...u, unreadCount: isChatOpen ? 0 : (u.unreadCount || 0) + 1 }
            : u
        )
      );
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [socket, currentUserId, activeChatId]);

  const handleClickUser = (user) => {
    if (!user.isFriend) return;
    setLocalUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u))
    );
    onStartPrivateChat(user);
  };

  // ✅ Handle add friend request
// ✅ Socket-based friend request
const handleAddFriend = (user) => {
  if (!socket) return alert("Socket not connected");

  socket.emit("send-friend-request", user._id);
  alert(`Friend request sent to ${user.name}`);
};


  // ✅ Handle search (dynamic)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm.trim()) {
        setIsSearching(false);
        setLocalUsers(users);
        return;
      }

      setIsSearching(true);
      try {
        const apiBase =
          process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
        const res = await fetch(
          `${apiBase}/api/users?search=${encodeURIComponent(searchTerm)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        // Mark users as friends if already in the friend list
        const merged = data.map((u) => ({
          ...u,
          isFriend: users.some((f) => f._id === u._id),
        }));
        setLocalUsers(merged);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    const delay = setTimeout(fetchUsers, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, token, users]);


  return (
    <div className="flex flex-col h-full bg-white shadow-lg rounded-2xl border border-gray-200">
      <div className="px-5 py-4 border-b bg-blue-50 rounded-t-2xl">
        <h2 className="text-sm font-semibold text-blue-700">
          {isSearching ? "Search Results" : "Friends"}
        </h2>
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
            />
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
  token: PropTypes.string.isRequired,
};

export default UsersList;
