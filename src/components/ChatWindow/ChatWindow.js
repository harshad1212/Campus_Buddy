import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import MessageInput from "./MessageInput";
import Message from "./Message";
import TypingIndicator from "../TypingIndicator";
import ForwardModal from "./ForwardModal";
import { MoreVertical, X } from "lucide-react";
import { formatMessageTime } from "../../utils/time";
import { uploadFiles } from "../../utils/uploadFiles";
import ReplyPreview from "./ReplyPreview";


const formatChatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: today.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
};

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const ChatWindow = ({ chatId, socket, currentUser, chatUser, allUsers = [] }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const messageRefs = useRef({});
  const listRef = useRef();

  const scrollToMessage = (msgId) => {
    const el = messageRefs.current[msgId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("animate-highlight");
      setTimeout(() => el.classList.remove("animate-highlight"), 2000);
    }
  };

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });

    const sortedKeys = Object.keys(groups).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return sortedKeys.map((dateKey) => ({
      dateKey,
      messages: groups[dateKey].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ),
    }));
  };

  // --- Fetch messages
  useEffect(() => {
    if (!chatId || !currentUser.token) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/rooms/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const msgData = await res.json();
        setMessages(msgData || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [chatId, currentUser.token]);

  // --- Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.chat === chatId || msg.chat?._id === chatId) {
        setMessages((prev) => {
          const exists = prev.find(
            (m) => m._id === msg._id || m._id === msg.clientTempId
          );
          if (exists) {
            return prev.map((m) =>
              m._id === msg.clientTempId ? { ...msg, status: "sent" } : m
            );
          }
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    const handleDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleUpdated = (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, ...msg } : m))
      );
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

    socket.on("new-message", handleNewMessage);
    socket.on("message-deleted", handleDeleted);
    socket.on("message-updated", handleUpdated);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-deleted", handleDeleted);
      socket.off("message-updated", handleUpdated);
      socket.off("typing", handleTyping);
    };
  }, [socket, chatId]);

  // --- Send message
  const handleSend = async ({ content, attachments }) => {
    if (!content && (!attachments || attachments.length === 0)) return;

    // Editing message
    if (editingMessage) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${editingMessage._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ content }),
        });
        const updated = await res.json();
        if (res.ok) {
          setMessages((prev) =>
            prev.map((m) => (m._id === editingMessage._id ? updated : m))
          );
        }
      } catch (err) {
        console.error("Edit failed:", err);
      }
      setEditingMessage(null);
      setReplyTo(null);
      return;
    }

    // New message optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      chat: chatId,
      sender: currentUser,
      content,
      attachments: attachments?.map((f) => ({
        file: f.file || f,
        url: f.url || "",
        type: f.type || "file",
        status: "pending",
      })) || [],
      replyTo,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    let uploadedAttachments = [];
    if (attachments && attachments.length > 0) {
      try {
        const response = await uploadFiles(attachments, currentUser.token);
        uploadedAttachments = response.map((f, i) => ({
          file: attachments[i],
          url: f.url,
          filename: f.filename,
          type: f.type || "file",
          cloudinaryId: f.cloudinaryId,
          status: "sent",
        }));
      } catch (err) {
        console.error("File upload failed:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId
              ? {
                  ...m,
                  status: "failed",
                  attachments: m.attachments.map((a) => ({ ...a, status: "failed" })),
                }
              : m
          )
        );
        return;
      }
    }

    // Send via socket
    socket.sendMessage(
      {
        chatId,
        content,
        attachments: uploadedAttachments,
        replyTo,
        clientTempId: tempId,
      },
      (ack) => {
        if (ack?.status === "ok") {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...ack.message, status: "sent" } : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
          );
        }
      }
    );

    setReplyTo(null);
  };

  const handleMessageOption = async (option, message) => {
    switch (option) {
      case "Delete":
        try {
          const res = await fetch(`${API_BASE_URL}/api/messages/${message._id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser.token}`,
            },
            body: JSON.stringify({
              cloudinaryIds: message.attachments
                ?.map((att) => att.cloudinaryId)
                .filter(Boolean),
            }),
          });

          if (res.ok) setMessages((prev) => prev.filter((m) => m._id !== message._id));
        } catch (err) {
          console.error("Delete failed:", err);
        }
        break;
      case "Edit":
        setEditingMessage(message);
        break;
      case "Forward":
        setForwardMessage(message);
        setShowForwardModal(true);
        break;
      case "Reply":
        setReplyTo(message);
        break;
      default:
        console.warn("Unknown option:", option);
    }
  };

  const handleForwardMessage = async (selectedUserIds) => {
    if (!forwardMessage || !selectedUserIds.length) return;

    try {
      for (const userId of selectedUserIds) {
        const res = await fetch(`${API_BASE_URL}/api/private`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ targetId: userId }),
        });
        const room = await res.json();
        if (!room._id) continue;

        socket.sendMessage({
          chatId: room._id,
          content: forwardMessage.content,
          attachments: forwardMessage.attachments || [],
          forwarded: true,
        });
      }
    } catch (err) {
      console.error("Forwarding failed:", err);
    } finally {
      setShowForwardModal(false);
      setForwardMessage(null);
    }
  };

  const handleTyping = (text) => {
    socket.emitTyping({ chatId, isTyping: text.length > 0 });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={chatUser?.avatarUrl || "/default-avatar.png"}
            alt={chatUser?.name || "User"}
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <div className="text-sm font-semibold">{chatUser?.name || "Unknown User"}</div>
            <div className={`text-xs ${chatUser?.online ? "text-green-500" : "text-gray-400"}`}>
              {chatUser?.online
                ? "Online"
                : chatUser?.lastSeen
                ? `Last seen ${formatMessageTime(chatUser.lastSeen)}`
                : "Offline"}
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-200 transition">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {loading ? (
          <div className="text-center text-xs text-gray-400">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet</div>
        ) : (
          groupMessagesByDate(messages).map(({ dateKey, messages }) => (
            <div key={dateKey}>
              <div className="flex justify-center my-2">
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full shadow-sm">
                  {formatChatDate(dateKey)}
                </span>
              </div>

              <div className="space-y-2">
                {messages.map((msg) => (
                  <Message
                    key={msg._id}
                    message={msg}
                    isOwn={msg.sender?._id === currentUser._id || msg.sender === currentUser._id}
                    currentUser={currentUser}
                    onOption={handleMessageOption}
                    scrollRef={(el) => (messageRefs.current[msg._id] = el)}
                    onScrollToMessage={scrollToMessage}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-gray-500 bg-gray-50 border-t">
          <TypingIndicator typingUsers={typingUsers} />
        </div>
      )}

    



      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t shadow-sm z-10">
        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          editingMessage={editingMessage}
          replyTo={replyTo}
          onCancelEdit={() => {
            setEditingMessage(null);
            setReplyTo(null);
          }}
          onCancelReply={() => setReplyTo(null)}
          currentUser={currentUser} 
        />
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <ForwardModal
          users={allUsers}
          excludeUserIds={[currentUser._id]}
          onClose={() => setShowForwardModal(false)}
          onForward={handleForwardMessage}
        />
      )}
    </div>
  );
};

ChatWindow.propTypes = {
  chatId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  chatUser: PropTypes.object.isRequired,
  allUsers: PropTypes.array,
};

export default ChatWindow;
