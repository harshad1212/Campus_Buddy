import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import UsersList from '../Sidebar/UserList';
import RoomsList from '../Sidebar/RoomList';
import ChatWindow from '../ChatWindow/ChatWindow';
import OnlineStatus from '../Status/OnlineStatus';
import useSocket from '../../hooks/UseSocket';
import { formatRelativeTime } from '../../utils/time';

const ChatPage = ({ currentUser }) => {
  // ✅ Use the socket hook
  const socketHook = useSocket(currentUser);
  const { socket, joinRoom } = socketHook;

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);

  // Fetch rooms & users
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

        const roomsRes = await fetch(`${apiBase}/api/rooms`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setRooms(await roomsRes.json());

        const usersRes = await fetch(`${apiBase}/api/users`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setUsers(await usersRes.json());
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
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

    const onUserList = (list) => setUsers(list);

    const onPresence = ({ userId, online, lastSeen }) =>
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, online, lastSeen } : u))
      );

    socket.on('room-upsert', onRoomsUpdate);
    socket.on('user-list', onUserList);
    socket.on('presence', onPresence);

    return () => {
      socket.off('room-upsert', onRoomsUpdate);
      socket.off('user-list', onUserList);
      socket.off('presence', onPresence);
    };
  }, [socket]);

  // Start private chat
 const handleStartPrivateChat = async (user) => {
  try {
     const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

    const res = await fetch(`${apiBase}/api/private`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
      body: JSON.stringify({ targetId: user._id }),
    });

    const room = await res.json(); // This returns the real Room object

    setRooms((prev) => [room, ...prev.filter((r) => r._id !== room._id)]);
    setActiveRoomId(room._id);

    socket?.joinRoom(room._id);
  } catch (err) {
    console.error("Failed to start private chat:", err);
  }
};


  // Create group room
  const handleCreateRoom = (roomName) => {
    const newRoom = {
      _id: `group-${Date.now()}`,
      name: roomName,
      isGroup: true,
      members: [currentUser._id],
      lastMessage: null,
      unreadCount: 0,
    };
    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoomId(newRoom._id);
    joinRoom(newRoom._id); // ✅ use joinRoom helper
  };

  return (
    <div className="h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-medium">{currentUser.name}</div>
            <div className="text-xs text-gray-500">
              <OnlineStatus user={{ ...currentUser, online: true }} small />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <RoomsList
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelectRoom={(id) => {
              setActiveRoomId(id);
              joinRoom(id); // ✅ use helper
            }}
            onCreateRoom={handleCreateRoom}
          />
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        {activeRoomId ? (
          <ChatWindow
            chatId={activeRoomId}
            socket={socketHook} // ✅ pass the full hook object
            currentUser={currentUser}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a room or user to start chatting
          </div>
        )}
      </main>

      {/* Users List */}
      <aside className="hidden md:flex md:flex-col w-72 border-l border-gray-200 bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">People</h3>
          <p className="text-xs text-gray-500">Students & teachers</p>
        </div>
        <UsersList
          users={users}
          currentUserId={currentUser._id}
          onStartPrivateChat={handleStartPrivateChat}
        />
        <div className="p-3 text-xs text-gray-400">
          Last sync: {formatRelativeTime(new Date())}
        </div>
      </aside>
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
