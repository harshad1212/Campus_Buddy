// ChatPage.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import UsersList from "../Sidebar/UserList";
import ChatWindow from "../ChatWindow/ChatWindow";
import OnlineStatus from "../Status/OnlineStatus";
import useSocket from "../../hooks/UseSocket";
import { formatMessageTime } from "../../utils/time";
import { MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
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
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:4000";

  /* =========================
     Responsive
  ========================= */
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =========================
     Notifications
  ========================= */
  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  /* =========================
     Fetch Initial Data
  ========================= */
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
      const usersDataRaw = await usersRes.json();

      setRooms(Array.isArray(roomsData) ? roomsData : roomsData.rooms || []);
      const usersList = usersDataRaw.users || [];
      setUsers(usersList.map((u) => ({ ...u, unreadCount: 0 })));

      setFriendData({
        friends: usersDataRaw.currentUserFriends || [],
        received: usersDataRaw.currentUserFriendRequests || [],
        sent: usersDataRaw.currentUserSentRequests || [],
        blocked: usersDataRaw.currentUserBlockedUsers || [],
      });
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  /* =========================
     Visibility Refresh
  ========================= */
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchInitialData();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Socket Events
  ========================= */
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
      const sameUniversity = list.filter(
        (u) => u.universityId === currentUser.universityId
      );
      const unique = Array.from(
        new Map(sameUniversity.map((u) => [u._id, u])).values()
      );
      setUsers((prev) =>
        unique.map((u) => {
          const existing = prev.find((p) => p._id === u._id);
          return { ...u, unreadCount: existing?.unreadCount || 0 };
        })
      );
    };

    const onPresence = ({ userId, online, lastSeen }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, online, lastSeen } : u
        )
      );
    };

    socket.on("room-upsert", onRoomsUpdate);
    socket.on("user-list", onUserList);
    socket.on("presence", onPresence);
    socket.on("presence:bulk", (list) => {
  setUsers((prev) =>
    prev.map((u) => {
      const match = list.find((p) => p._id === u._id);
      return match
        ? { ...u, online: match.isOnline, lastSeen: match.lastSeen }
        : u;
    })
  );
});


    return () => {
      socket.off("room-upsert", onRoomsUpdate);
      socket.off("user-list", onUserList);
      socket.off("presence", onPresence);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, currentUser?.universityId]);

  /* =========================
     Chat Handlers
  ========================= */
  const handleStartPrivateChat = async (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === user._id ? { ...u, unreadCount: 0 } : u
      )
    );
    setSelectedUser(user);

    const existing = rooms.find(
      (r) =>
        !r.isGroup &&
        r.members?.some((m) => m._id === user._id) &&
        r.members?.some((m) => m._id === currentUser._id)
    );

    if (existing) {
      setActiveRoomId(existing._id);
      try {
        joinRoom(existing._id);
      } catch {}
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

      const createdRoom = await res.json();
      setRooms((prev) => [
        createdRoom,
        ...prev.filter((r) => r._id !== createdRoom._id),
      ]);
      setActiveRoomId(createdRoom._id);
      try {
        joinRoom(createdRoom._id);
      } catch {}
    } catch (err) {
      console.error("Failed to start private chat:", err);
    }
  };

  const handleBackToList = () => {
    setActiveRoomId(null);
    setSelectedUser(null);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200 overflow-hidden">
      <Header />
      <div className="w-full h-full flex md:flex-row flex-col">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {(!isMobileView || !activeRoomId) && (
            <motion.aside
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:w-80 w-full bg-white/10 backdrop-blur-xl border-r border-white/10 flex flex-col z-20"
            >
              {/* Current User */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
                <img
                  src={currentUser.avatarUrl || "/default-avatar.png"}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border border-white/20 object-cover"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white truncate">
                    {currentUser.name}
                  </h2>
                  <OnlineStatus
                    user={{ ...currentUser, online: true }}
                    small
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-indigo-400">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-sm">Loading chats...</span>
                  </div>
                ) : (
                  <UsersList
                    users={users}
                    currentUserId={currentUser._id}
                    currentUserUniversityId={currentUser.universityId}
                    onStartPrivateChat={handleStartPrivateChat}
                    token={currentUser.token}
                    friendData={friendData}
                    refreshUsers={fetchInitialData}
                  />
                )}
              </div>

              <div className="text-xs text-center py-3 text-slate-400 border-t border-white/10">
                Last sync: {formatMessageTime(new Date())}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <AnimatePresence initial={false}>
          {(!isMobileView || activeRoomId) && (
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl relative"
            >
              {activeRoomId && selectedUser ? (
                <>
                  {isMobileView && (
                    <button
                      onClick={handleBackToList}
                      className="absolute top-3 left-3 z-30 bg-white/10 p-2 rounded-full hover:bg-white/20"
                    >
                      <ArrowLeft className="w-5 h-5 text-indigo-400" />
                    </button>
                  )}

                  <ChatWindow
                    chatId={activeRoomId}
                    socket={socketHook}
                    currentUser={currentUser}
                    chatUser={selectedUser}
                    allUsers={users}
                    friendIds={friendData.friends || []}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-60" />
                  <p className="text-lg font-medium text-white">
                    Select a chat to start messaging
                  </p>
                  <p className="text-sm mt-1">
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
