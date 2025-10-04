import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Message from "./Message";
import MessageInput from "./MessageInput";
import TypingIndicator from "../TypingIndicator";
import { formatRelativeTime } from "../../utils/time";

const API_BASE_URL = "http://localhost:4000/api"; // your backend
const ChatWindow = ({ chatId, socket, currentUser, token }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const listRef = useRef();

  // ✅ Fetch initial messages from backend
  useEffect(() => {
    if (!chatId || !token) return;
    setLoading(true);
    async function loadMessages() {
      try {
        const res = await fetch(`${API_BASE_URL}/rooms/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
        setHasMoreHistory(false); // no pagination implemented on server yet
      } catch (e) {
        console.error("Failed to fetch messages", e);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [chatId, token]);

  // ✅ Join/leave chat room with socket
  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit("join-chat", chatId);
    return () => {
      socket.emit("leave-chat", chatId);
    };
  }, [socket, chatId]);

  // ✅ Socket listeners for new messages + typing
  useEffect(() => {
    if (!socket || !chatId) return;

    const onNewMessage = (msg) => {
      if (msg.chat === chatId || msg.chat?._id === chatId) {
        setMessages((prev) => {
          if (msg.clientTempId) {
            return prev.map((m) =>
              m._id === msg.clientTempId ? { ...msg } : m
            );
          }
          return [...prev, msg];
        });
        if (isAtBottom) scrollToBottom();
      }
    };

    const onTyping = ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.some((p) => p.userId === userId)) return prev;
          return [...prev, { userId }];
        } else {
          return prev.filter((p) => p.userId !== userId);
        }
      });
    };

    const onMessageRead = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, readBy: [...(m.readBy || []), userId] }
            : m
        )
      );
    };

    socket.on("new-message", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("message-read", onMessageRead);

    return () => {
      socket.off("new-message", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("message-read", onMessageRead);
    };
  }, [socket, chatId, isAtBottom]);

  // ✅ Scroll handling
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setIsAtBottom(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // ✅ Send message via socket
  const sendMessage = async ({ content, attachments = [] }) => {
    if (!socket) return;
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

    socket.emit(
      "send-message",
      { chatId, content, attachments, clientTempId: tempId },
      (ack) => {
        if (ack?.status === "ok" && ack.message) {
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

  // ✅ Mark message as read
  const handleMarkRead = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, readBy: [...(m.readBy || []), currentUser._id] }
          : m
      )
    );
    socket?.emit("message-read", { chatId, messageId });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Chat</div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(new Date())}
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {loading && (
          <div className="text-center text-xs text-gray-500">
            Loading...
          </div>
        )}
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400">
            No messages yet. Say hello 👋
          </div>
        )}

        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showDate =
            !prev ||
            new Date(prev.createdAt).toDateString() !==
              new Date(msg.createdAt).toDateString();
          return (
            <div key={msg._id}>
              {showDate && (
                <div className="text-center text-xs text-gray-400 my-2">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </div>
              )}
              <Message
                message={msg}
                isOwn={msg.sender._id === currentUser._id}
                onMarkRead={() => handleMarkRead(msg._id)}
              />
            </div>
          );
        })}
      </div>

      <div className="border-t bg-white">
        <MessageInput
          onSend={sendMessage}
          onTyping={(isTyping) =>
            socket?.emit("typing", { chatId, isTyping })
          }
          onUploadFiles={async (files) => {
            const formData = new FormData();
            files.forEach((f) => formData.append("files", f));
            const res = await fetch(`${API_BASE_URL}/upload`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            return await res.json(); // returns uploaded files with {url, filename, type}
          }}
        />
      </div>

      <div className="absolute bottom-16 right-6">
        <TypingIndicator typingUsers={typingUsers} />
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  chatId: PropTypes.string.isRequired,
  socket: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
};

export default ChatWindow;
