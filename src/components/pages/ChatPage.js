import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import UsersList from "../Sidebar/UserList";
import ChatWindow from "../ChatWindow/ChatWindow";
import OnlineStatus from "../Status/OnlineStatus";
import useSocket from "../../hooks/UseSocket";
import { formatMessageTime } from "../../utils/time";
import { MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatPage = ({ currentUser }) => {
  const socketHook = useSocket(currentUser);
  const { socket, joinRoom } = socketHook;

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [friendData, setFriendData] = useState({
    friends: [],
    received: [],
    sent: [],
    blocked: [],
  });
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const apiBase =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  // 🧭 Detect mobile vs desktop
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧭 Ask for notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 🔁 Fetch initial data
  async function fetchInitialData() {
    if (!currentUser?.token) return;
    setLoading(true);

    try {
      const [roomsRes, usersRes] = await Promise.all([
        fetch(`${apiBase}/api/rooms`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }),
        fetch(`${apiBase}/api/users`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }),
      ]);

      const roomsData = await roomsRes.json();
      const data = await usersRes.json();
      const usersData = data.users;

      setRooms(roomsData);
      setUsers(usersData.map((u) => ({ ...u, unreadCount: 0 })));
      setFriendData({
        friends: data.currentUserFriends,
        received: data.currentUserFriendRequests,
        sent: data.currentUserSentRequests,
        blocked: data.currentUserBlockedUsers,
      });
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, [currentUser]);

  // 🕓 Refresh when tab refocuses
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchInitialData();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 💬 Handle sockets
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
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
        );
      });
    };

    const onUserList = (list) => {
      const sameUniversityUsers = list.filter(
        (u) => u.universityId === currentUser.universityId
      );
      const uniqueUsers = Array.from(
        new Map(sameUniversityUsers.map((u) => [u._id, u])).values()
      );
      setUsers((prev) =>
        uniqueUsers.map((u) => {
          const existing = prev.find((p) => p._id === u._id);
          return { ...u, unreadCount: existing?.unreadCount || 0 };
        })
      );
    };

    const onPresence = ({ userId, online, lastSeen }) =>
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, online, lastSeen } : u
        )
      );

    socket.on("room-upsert", onRoomsUpdate);
    socket.on("user-list", onUserList);
    socket.on("presence", onPresence);

    return () => {
      socket.off("room-upsert", onRoomsUpdate);
      socket.off("user-list", onUserList);
      socket.off("presence", onPresence);
    };
  }, [socket, currentUser.universityId]);

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

  const handleBackToList = () => {
    setActiveRoomId(null);
    setSelectedUser(null);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 to-white text-gray-900 overflow-hidden">
      <div className="w-full flex flex-col md:flex-row transition-all duration-300 ease-in-out">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {(!isMobileView || !activeRoomId) && (
            <motion.aside
              key="sidebar"
              initial={{ x: isMobileView ? 0 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:w-80 w-full flex flex-col bg-white border-r border-blue-100 shadow-md md:static absolute inset-0 md:translate-x-0"
            >
              {/* Current user header */}
              <div className="px-5 py-4 flex items-center gap-3 border-b bg-blue-100/60 backdrop-blur-md">
                <img
                  src={currentUser.avatarUrl || "/default-avatar.png"}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border border-blue-200 object-cover"
                />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </h2>
                  <OnlineStatus user={{ ...currentUser, online: true }} small />
                </div>
              </div>

              {/* Users list */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 hover:scrollbar-thumb-blue-300 transition">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-blue-500">
                    <Loader2 className="w-5 h-5 animate-spin mb-2" />
                    <span className="text-sm">Loading chats...</span>
                  </div>
                ) : (
                  <UsersList
                    users={users}
                    currentUserId={currentUser._id}
                    currentUserUniversityId={currentUser.universityId}
                    onStartPrivateChat={handleStartPrivateChat}
                    socket={socket}
                    token={currentUser.token}
                    activeChatId={activeRoomId}
                    friendData={friendData}
                    refreshUsers={fetchInitialData}
                  />
                )}
              </div>

              <div className="text-xs text-center py-3 text-gray-400 border-t border-gray-100">
                Last sync: {formatMessageTime(new Date())}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence initial={false}>
          {(!isMobileView || activeRoomId) && (
            <motion.main
              key="chat"
              initial={{ x: isMobileView ? 400 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col bg-blue-50/30 relative"
            >
              {activeRoomId && selectedUser ? (
                <>
                  {isMobileView && (
                    <button
                      onClick={handleBackToList}
                      className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-blue-100 transition"
                    >
                      <ArrowLeft className="w-5 h-5 text-blue-600" />
                    </button>
                  )}
                  <ChatWindow
                    chatId={activeRoomId}
                    socket={socketHook}
                    currentUser={currentUser}
                    chatUser={selectedUser}
                    allUsers={users}
                    
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-blue-400">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-70" />
                  <p className="text-lg font-medium">
                    Select a chat to start messaging
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your conversations will appear here
                  </p>
                </div>
              )}
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

ChatPage.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    token: PropTypes.string.isRequired,
    universityId: PropTypes.string.isRequired,
  }).isRequired,

};

export default ChatPage;
