import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import MessageInput from "./MessageInput";
import Message from "./Message";
import TypingIndicator from "../TypingIndicator";
import { formatRelativeTime } from "../../utils/time";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const ChatWindow = ({ chatId, socket, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef();

  // Load chat messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/rooms/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();
  }, [chatId, currentUser.token]);

  // Join room safely
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.joinRoom?.(chatId);
    return () => socket.leaveRoom?.(chatId);
  }, [socket, chatId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.chat === chatId || msg.chat?._id === chatId) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ userId, name, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, name }];
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    };

    socket.on?.("new-message", handleNewMessage);
    socket.on?.("typing", handleTyping);

    return () => {
      socket.off?.("new-message", handleNewMessage);
      socket.off?.("typing", handleTyping);
    };
  }, [socket, chatId]);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Send new message using helper
  const handleSend = async ({ content, attachments }) => {
    if (!content && attachments.length === 0) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      chat: chatId,
      sender: currentUser,
      content,
      attachments,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    socket.sendMessage?.(
      { chatId, content, attachments, clientTempId: tempId },
      (ack) => {
        if (ack?.status === "ok") {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...ack.message, status: "sent" } : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...m, status: "failed" } : m
            )
          );
        }
      }
    );
  };

  // Handle file uploads
  const handleUploadFiles = async (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${currentUser.token}` },
    });
    return res.json(); // expects array of uploaded file info
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Chat</div>
          <div className="text-xs text-gray-500">{formatRelativeTime(new Date())}</div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
      >
        {loading && <div className="text-center text-xs text-gray-400">Loading...</div>}
        {!loading && messages.length === 0 && (
          <div className="text-center text-gray-400">No messages yet</div>
        )}
        {messages.map((msg) => (
          <Message
            key={msg._id}
            message={msg}
            isOwn={msg.sender._id === currentUser._id}
          />
        ))}
      </div>

      {/* Typing Indicator */}
      <div className="px-4 py-1 text-xs text-gray-500">
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      {/* Input */}
      <div className="border-t">
        <MessageInput
          onSend={handleSend}
          onTyping={(isTyping) =>
            socket.emitTyping?.({ chatId, isTyping })
          }
          onUploadFiles={handleUploadFiles}
        />
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  chatId: PropTypes.string.isRequired,
  socket: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
};

export default ChatWindow;
