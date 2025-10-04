import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * useSocket — custom hook to manage socket.io client lifecycle and helpers.
 *
 * Usage:
 *  const socket = useSocket(currentUser); // returns helper object with functions & raw socket
 *
 * Exposed helpers:
 *  - socket: raw socket instance
 *  - sendMessage(payload, ack)
 *  - joinRoom(roomId)
 *  - leaveRoom(roomId)
 *  - emitTyping({ chatId, isTyping })
 *  - on(event, handler)
 *  - off(event, handler)
 *
 * Note: The hook reads token from currentUser.token and connects to:
 *   `${process.env.REACT_APP_API_URL}/chat`
 *
 * Make sure to set REACT_APP_API_URL in your .env file.
 */

export default function useSocket(currentUser) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const namespace = '/chat';
  const url = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    if (!currentUser || !currentUser.token) return;

    const s = io(`${url}${namespace}`, {
      auth: { token: currentUser.token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = s;

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    // optional: on connect, request initial presence & userlist
    s.on('connect', () => {
      s.emit('fetch-user-list'); // server should reply with 'user-list'
      s.emit('presence:subscribe'); // optional
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?.token, url]);

  const sendMessage = (payload, ack) => {
    // payload should contain { chatId, content, attachments, clientTempId }
    socketRef.current?.emit('send-message', payload, ack);
  };

  const joinRoom = (roomId) => {
    socketRef.current?.emit('join-chat', roomId);
  };

  const leaveRoom = (roomId) => {
    socketRef.current?.emit('leave-chat', roomId);
  };

  const emitTyping = ({ chatId, isTyping }) => {
    socketRef.current?.emit('typing', { chatId, isTyping });
  };

  const on = (event, handler) => {
    socketRef.current?.on(event, handler);
  };

  const off = (event, handler) => {
    socketRef.current?.off(event, handler);
  };

  return useMemo(() => ({
    socket: socketRef.current,
    connected,
    sendMessage,
    joinRoom,
    leaveRoom,
    emitTyping,
    on,
    off,
  }), [connected]);
}
