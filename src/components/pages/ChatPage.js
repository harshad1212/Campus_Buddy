import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';

import UsersList from '../Sidebar/UserList';
import ChatWindow from '../ChatWindow/ChatWindow';
import OnlineStatus from '../Status/OnlineStatus';
import TypingIndicator from '../TypingIndicator';
import useSocket from '../../hooks/UseSocket';
import RoomsList from '../Sidebar/RoomList';
import { formatRelativeTime } from '../../utils/time';

/* ChatRouter: renders ChatWindow based on route param or activeRoomId */
const ChatRouter = ({ socket, currentUser, activeRoomId, setActiveRoomId }) => {
  const params = useParams();
  const roomId = params.roomId || activeRoomId;

  useEffect(() => {
    if (roomId) {
      setActiveRoomId(roomId);
      socket?.joinRoom(roomId);
    }
  }, [roomId, socket, setActiveRoomId]);

  if (!roomId) {
    return <div className="h-full flex items-center justify-center text-gray-500">Select a chat</div>;
  }

  return (
    <ChatWindow
      chatId={roomId}
      socket={socket}
      currentUser={currentUser}
    />
  );
};

ChatRouter.propTypes = {
  socket: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
  activeRoomId: PropTypes.string,
  setActiveRoomId: PropTypes.func.isRequired,
};

/* ChatPageInner: main chat layout with sidebar, chat window, users list */
const ChatPageInner = ({ currentUser }) => {
  const socket = useSocket(currentUser);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  // Fetch initial data (replace with real API calls)
  useEffect(() => {
    async function fetchInitialData() {
      setRooms([]);
      setUsers([]);
    }
    fetchInitialData();
  }, [currentUser]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onRoomsUpdate = (updatedRoom) => {
      setRooms(prev => {
        const idx = prev.findIndex(r => r._id === updatedRoom._id);
        if (idx === -1) return [updatedRoom, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updatedRoom };
        return copy.sort((a,b)=> new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));
      });
    };

    const onUserList = (list) => setUsers(list);

    const onPresence = ({ userId, online, lastSeen }) => {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, online, lastSeen } : u));
    };

    const onTyping = (payload) => {
      setTypingUsers(prev => {
        if (payload.isTyping) {
          const exists = prev.find(p => p.userId === payload.userId && p.chatId === payload.chatId);
          if (exists) return prev;
          return [...prev, { userId: payload.userId, name: payload.name, chatId: payload.chatId }];
        } else {
          return prev.filter(p => !(p.userId === payload.userId && p.chatId === payload.chatId));
        }
      });
    };

    socket.on('room-upsert', onRoomsUpdate);
    socket.on('user-list', onUserList);
    socket.on('presence', onPresence);
    socket.on('typing', onTyping);

    return () => {
      socket.off('room-upsert', onRoomsUpdate);
      socket.off('user-list', onUserList);
      socket.off('presence', onPresence);
      socket.off('typing', onTyping);
    };
  }, [socket]);

  const handleStartPrivateChat = async (user) => {
    const fakeChat = {
      _id: `dm-${currentUser._id}-${user._id}`,
      isGroup: false,
      name: user.name,
      members: [currentUser._id, user._id],
      lastMessage: null,
      unreadCount: 0,
    };
    setRooms(prev => [fakeChat, ...prev.filter(r => r._id !== fakeChat._id)]);
    setActiveRoomId(fakeChat._id);
    socket?.joinRoom(fakeChat._id);
  };

  const handleCreateRoom = async (roomName) => {
    const newRoom = {
      _id: `group-${Date.now()}`,
      name: roomName,
      isGroup: true,
      members: [currentUser._id],
      lastMessage: null,
      unreadCount: 0,
    };
    setRooms(prev => [newRoom, ...prev]);
    setActiveRoomId(newRoom._id);
    socket?.joinRoom(newRoom._id);
  };

  return (
    <div className="h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <img src={currentUser.avatarUrl} alt={`${currentUser.name} avatar`} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="text-sm font-medium">{currentUser.name}</div>
            <div className="text-xs text-gray-500"><OnlineStatus user={{...currentUser, online: true}} small /></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <RoomsList
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelectRoom={(id) => { setActiveRoomId(id); socket?.joinRoom(id); }}
            onCreateRoom={handleCreateRoom}
          />
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="md:col-span-3 flex flex-col bg-white">
            <Routes>
              <Route path="/chat/rooms/:roomId" element={
                <ChatRouter
                  socket={socket}
                  currentUser={currentUser}
                  activeRoomId={activeRoomId}
                  setActiveRoomId={setActiveRoomId}
                />
              }/>
              <Route path="/chat/user/:userId" element={
                <ChatRouter
                  socket={socket}
                  currentUser={currentUser}
                  activeRoomId={activeRoomId}
                  setActiveRoomId={setActiveRoomId}
                />
              }/>
              <Route path="/chat" element={
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a room or a user to start chatting
                </div>
              }/>
            </Routes>
          </div>

          {/* Users list */}
          <aside className="hidden md:block md:col-span-1 border-l border-gray-200 bg-white">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold">People</h3>
              <p className="text-xs text-gray-500">Students & teachers</p>
            </div>
            <UsersList
              users={users}
              onStartPrivateChat={handleStartPrivateChat}
            />
            <div className="p-3 text-xs text-gray-400">
              Last sync: {formatRelativeTime(new Date())}
            </div>
          </aside>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 p-2">
          <TypingIndicator typingUsers={typingUsers.filter(t => t.chatId === activeRoomId)} />
        </div>
      </main>
    </div>
  );
};

ChatPageInner.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

/* Main ChatPage export */
const ChatPage = ({ currentUser }) => {
  return <ChatPageInner currentUser={currentUser} />;
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
