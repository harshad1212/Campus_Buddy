import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import UsersList from "../Sidebar/UserList";
import ChatWindow from "../ChatWindow/ChatWindow";
import OnlineStatus from "../Status/OnlineStatus";
import useSocket from "../../hooks/UseSocket";
import { formatMessageTime } from "../../utils/time";

const ChatPage = ({ currentUser }) => {
  const socketHook = useSocket(currentUser);
  const { socket, joinRoom } = socketHook;

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
        const [roomsRes, usersRes] = await Promise.all([
          fetch(`${apiBase}/api/rooms`, {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }),
          fetch(`${apiBase}/api/users`, {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }),
        ]);

        const roomsData = await roomsRes.json();
        const usersData = await usersRes.json();
        setRooms(roomsData);
        setUsers(usersData.map((u) => ({ ...u, unreadCount: 0 })));
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    }
    fetchInitialData();
  }, [currentUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onRoomsUpdate = (updatedRoom) => {
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r._id === updatedRoom._id);
        if (idx === -1) return [updatedRoom, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updatedRoom };
        return copy.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
        );
      });
    };

    const onUserList = (list) => {
      const uniqueUsers = Array.from(new Map(list.map((u) => [u._id, u])).values());
      setUsers((prev) =>
        uniqueUsers.map((u) => {
          const existing = prev.find((p) => p._id === u._id);
          return { ...u, unreadCount: existing?.unreadCount || 0 };
        })
      );
    };

    const onPresence = ({ userId, online, lastSeen }) =>
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, online, lastSeen } : u))
      );

    const onNewMessage = (msg) => {
      const senderId = msg.sender._id;
      if (selectedUser?._id === senderId) return;

      setUsers((prev) =>
        prev.map((u) =>
          u._id === senderId
            ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
            : u
        )
      );
    };

    socket.on("room-upsert", onRoomsUpdate);
    socket.on("user-list", onUserList);
    socket.on("presence", onPresence);
    socket.on("new-message", onNewMessage);

    return () => {
      socket.off("room-upsert", onRoomsUpdate);
      socket.off("user-list", onUserList);
      socket.off("presence", onPresence);
      socket.off("new-message", onNewMessage);
    };
  }, [socket, selectedUser]);

  const handleStartPrivateChat = async (user) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u))
    );
    setSelectedUser(user);

    const existingRoom = rooms.find(
      (r) =>
        !r.isGroup &&
        r.members?.some((m) => m._id === user._id) &&
        r.members?.some((m) => m._id === currentUser._id)
    );

    if (existingRoom) {
      setActiveRoomId(existingRoom._id);
      joinRoom(existingRoom._id);
      return;
    }

    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      const res = await fetch(`${apiBase}/api/private`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ targetId: user._id }),
      });
      const room = await res.json();
      setRooms((prev) => [room, ...prev.filter((r) => r._id !== room._id)]);
      setActiveRoomId(room._id);
      joinRoom(room._id);
    } catch (err) {
      console.error("Failed to start private chat:", err);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-tr-2xl rounded-br-2xl">
        {/* Current user profile */}
        <div className="px-5 py-2 flex items-center gap-3 border-b border-gray-100 bg-blue-50 rounded-t-2xl">
          <img
            src={currentUser.avatarUrl || "/default-avatar.png"}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
          <div>
            <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
            <div className="text-xs text-gray-500">
              <OnlineStatus user={{ ...currentUser, online: true }} small />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2">
          <UsersList
            users={users}
            currentUserId={currentUser._id}
            onStartPrivateChat={handleStartPrivateChat}
          />
        </div>

        {/* Last sync */}
        <div className="p-3 text-xs text-gray-400 text-center border-t border-gray-100">
          Last sync: {formatMessageTime(new Date())}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {activeRoomId && selectedUser ? (
          <ChatWindow
            chatId={activeRoomId}
            socket={socketHook}
            currentUser={currentUser}
            chatUser={selectedUser}
            allUsers={users}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg font-medium">
            Select a user to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

ChatPage.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    token: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatPage;
