import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { io } from "socket.io-client";

const NAMESPACE = "/chat";
const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function useSocket(currentUser) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!currentUser?.token) return;

    const socket = io(`${SOCKET_URL}${NAMESPACE}`, {
      auth: { token: currentUser.token },
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Fetch initial data
    socket.emit("fetch-user-list");
    socket.emit("presence:subscribe");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?.token]);

  // Wrap emit functions safely
  const sendMessage = useCallback((payload, ack) => {
    socketRef.current?.emit("send-message", payload, ack);
  }, []);

  const joinRoom = useCallback((roomId) => {
    socketRef.current?.emit("join-chat", roomId);
  }, []);

  const leaveRoom = useCallback((roomId) => {
    socketRef.current?.emit("leave-chat", roomId);
  }, []);

  const emitTyping = useCallback(({ chatId, isTyping }) => {
    socketRef.current?.emit("typing", { chatId, isTyping });
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  return useMemo(
    () => ({
      socket: socketRef.current, // raw socket (may be null initially)
      connected,
      sendMessage,
      joinRoom,
      leaveRoom,
      emitTyping,
      on,
      off,
    }),
    [connected, sendMessage, joinRoom, leaveRoom, emitTyping, on, off]
  );
}
