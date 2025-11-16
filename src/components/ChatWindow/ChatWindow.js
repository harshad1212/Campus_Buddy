import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import MessageInput from "./MessageInput";
import Message from "./Message";
import TypingIndicator from "../TypingIndicator";
import ForwardModal from "./ForwardModal";
import { MoreVertical, X, Search, User, Ban, Trash2, Unlock } from "lucide-react"; // 🟢 added Unlock icon
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
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false); // 🟢 NEW: track block status

  const messageRefs = useRef({});
  const listRef = useRef();
  const menuRef = useRef();

  // --- Scroll helpers
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

  // --- Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

// ✅ Fetch block status
useEffect(() => {
  const fetchBlockStatus = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/friends/block-status/${chatUser._id}`,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setIsBlocked(data.isBlocked || false);
      } else {
        console.error("Failed to fetch block status:", await res.text());
      }
    } catch (err) {
      console.error("Failed to check block status:", err);
    }
  };
  if (chatUser?._id) fetchBlockStatus();
}, [chatUser, currentUser]);

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
      }
    };

    const handleChatCleared = ({ roomId, clearedBy }) => {
  if (roomId === chatId) {
    setMessages([]);
    if (clearedBy !== currentUser._id) {
      alert("This chat was cleared by the other user.");
    }
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
    socket.on("chat-cleared", handleChatCleared);


    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-deleted", handleDeleted);
      socket.off("message-updated", handleUpdated);
      socket.off("typing", handleTyping);
      socket.off("chat-cleared", handleChatCleared); 
    };
  }, [socket, chatId]);

  // --- Auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isAtBottom) scrollToBottom();
  }, [messages]);

  // --- Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const results = messages.filter((m) =>
      m.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    if (results.length > 0) setCurrentSearchIndex(0);
  }, [searchTerm, messages]);

  useEffect(() => {
    if (searchResults.length > 0 && searchResults[currentSearchIndex]) {
      scrollToMessage(searchResults[currentSearchIndex]._id);
    }
  }, [currentSearchIndex, searchResults]);

  const handleSearchNavigate = (direction) => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prev) => {
      if (direction === "next") return (prev + 1) % searchResults.length;
      if (direction === "prev")
        return (prev - 1 + searchResults.length) % searchResults.length;
      return prev;
    });
  };

  // --- Send message
  const handleSend = async (payload = {}) => {
    const { content = "", attachments = [], editId } = payload;
    if (isBlocked) {
      alert("You have blocked this user. Unblock them to send messages."); // 🟢 Prevent sending
      return;
    }

    if (!content && (!attachments || attachments.length === 0)) return;

    // If this is an edit of an existing message, call the REST API to update
    if (editId) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to update message");
        }
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m)));
        setEditingMessage(null);
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to update message:", err);
        alert("Failed to edit message. Try again.");
      }
      return;
    }

    // (existing send logic below)
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      chat: chatId,
      sender: currentUser,
      content,
      attachments:
        attachments?.map((f) => ({
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
                  attachments: m.attachments.map((a) => ({
                    ...a,
                    status: "failed",
                  })),
                }
              : m
          )
        );
        return;
      }
    }

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
            prev.map((m) =>
              m._id === tempId ? { ...m, status: "failed" } : m
            )
          );
        }
      }
    );

    setReplyTo(null);
  };

const handleClearChat = async () => {
  if (!window.confirm("Clear all messages from this chat?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${chatId}/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${currentUser.token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMessages([]);
      alert(data.message || "Chat cleared successfully");
    } else {
      alert(data.error || "Failed to clear chat");
    }
  } catch (err) {
    console.error("Failed to clear chat:", err);
    alert("Failed to clear chat. Try again.");
  }
};
const handleUnfriend = async () => {
  if (!window.confirm(`Are you sure you want to unfriend ${chatUser.name}?`))
    return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/friends/unfriend/${chatUser._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.token}` },
      }
    );

    let data = null;
    try {
      data = await res.json();
    } catch {
      console.warn("Server returned non-JSON response");
    }

    if (res.ok) {
      alert(data?.message || "User unfriended successfully");
      setShowMenu(false);

      // ✅ OPTIONAL: Close or refresh chat after unfriending
      if (typeof window.refreshUsers === "function") {
        window.refreshUsers(); // if your sidebar reload function exists
      }

      // ✅ OPTIONAL: If current chat belongs to that user, reset chat view
      if (chatUser._id === chatId) {
        window.location.reload(); // or navigate back to home/chat list
      }
      return;
    }

    alert(data?.error || "Failed to unfriend user");
  } catch (err) {
    console.error("Unfriend request failed:", err);
    alert("Network error: could not unfriend user");
  }
};





  const handleTyping = (text) => {
    if (!isBlocked) socket.emitTyping({ chatId, isTyping: text.length > 0 });
  };

 // ✅ Block / Unblock user
const handleToggleBlock = async () => {
  try {
    const endpoint = isBlocked
      ? `${API_BASE_URL}/api/friends/unblock/${chatUser._id}`
      : `${API_BASE_URL}/api/friends/block/${chatUser._id}`;

    const res = await fetch(endpoint, {
      method: isBlocked ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${currentUser.token}` },
    });

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("Non-JSON response from server:", text);
      alert("Unexpected response from server");
      return;
    }

    if (res.ok) {
      setIsBlocked(!isBlocked);
      alert(isBlocked ? "User unblocked successfully" : "User blocked successfully");
    } else {
      alert(data.error || "Failed to update block status");
    }
  } catch (err) {
    console.error("Block/unblock request failed:", err);
    alert("Network error: could not update block status");
  }
  setShowMenu(false);
};

const handleMessageOption = (option, message) => {
  console.log("Option selected:", option, "for message:", message);

  switch (option) {
    case "Reply":
      setReplyTo(message);
      break;

    case "Forward":
      setForwardMessage(message);
      setShowForwardModal(true);
      break;

    case "Edit":
      setEditingMessage(message);
      break;

    case "Delete":
      if (window.confirm("Delete this message?")) {
        // Call server to delete message; server will emit 'message-deleted' to update clients
        (async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/messages/${message._id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${currentUser.token}`, "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            if (!res.ok) {
              const txt = await res.text();
              throw new Error(txt || "Delete failed");
            }
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete message");
          }
        })();

      }
      break;

    default:
      console.warn("Unknown option:", option);
  }
};

  // --- Forward handler: create/get private room then send forwarded message
  const handleForwardToUsers = async (userIds) => {
    if (!forwardMessage) return;
    try {
      for (const targetId of userIds) {
        // create or get private room
        const res = await fetch(`${API_BASE_URL}/api/private`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ targetId }),
        });
        if (!res.ok) {
          console.warn("Failed to get/create private room for", targetId);
          continue;
        }
        const room = await res.json();
        const clientTempId = `temp-forward-${Date.now()}-${targetId}`;

        const payload = {
          chatId: room._id || room._id?._id || room._id,
          content: forwardMessage.content || "",
          attachments: forwardMessage.attachments || [],
          forwarded: true,
          clientTempId,
        };

        // use sendMessage helper on socket object
        try {
          socket.sendMessage(payload, (ack) => {
            // optional per-room ack handling (ignored for now)
            if (ack?.status !== "ok") {
              console.warn("Forward ack error for", targetId, ack);
            }
          });
        } catch (e) {
          console.error("Socket sendMessage failed for forward:", e);
        }
      }
      setShowForwardModal(false);
      setForwardMessage(null);
      alert("Message forwarded");
    } catch (err) {
      console.error("Forwarding failed:", err);
      alert("Failed to forward message. Try again.");
    }
  };

  

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm relative">
        <div className="flex items-center gap-3">
          <img
            src={chatUser?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={chatUser?.name || "User"}
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <div className="text-sm font-semibold">{chatUser?.name || "Unknown User"}</div>
            <div className={`text-xs ${chatUser?.online ? "text-green-500" : "text-gray-400"}`}>
              {isBlocked
                ? "You have blocked this user"
                : chatUser?.online
                ? "Online"
                : chatUser?.lastSeen
                ? `Last seen ${formatMessageTime(chatUser.lastSeen)}`
                : "Offline"}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div ref={menuRef} className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {showMenu && (
  <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-100 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
    <button
      onClick={() => {
        alert("Show user profile (to be implemented)");
        setShowMenu(false);
      }}
      className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-blue-50 transition"
    >
      <User size={16} /> View Profile
    </button>

    <button
      onClick={handleToggleBlock}
      className={`flex items-center gap-2 px-4 py-2 w-full text-left text-sm transition ${
        isBlocked
          ? "text-blue-600 hover:bg-blue-50"
          : "text-red-600 hover:bg-red-50"
      }`}
    >
      {isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
      {isBlocked ? "Unblock User" : "Block User"}
    </button>

    {/* 🆕 UNFRIEND OPTION */}
    <button
      onClick={handleUnfriend}
      className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-yellow-600 hover:bg-yellow-50 transition"
    >
      <Trash2 size={16} /> Unfriend User
    </button>

    <button
      onClick={() => {
        setShowSearch(true);
        setShowMenu(false);
      }}
      className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm hover:bg-blue-50 transition"
    >
      <Search size={16} /> Search
    </button>

    <button
      onClick={handleClearChat}
      className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 transition"
    >
      <Trash2 size={16} /> Clear Chat
    </button>
  </div>
)}

        </div>
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
                    isOwn={
                      msg.sender?._id === currentUser._id ||
                      msg.sender === currentUser._id
                    }
                    currentUser={currentUser}
                    scrollRef={(el) => (messageRefs.current[msg._id] = el)}
                      onOption={handleMessageOption}              // ✅ Added this line
                      onScrollToMessage={scrollToMessage}    
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Typing Indicator */}
      {!isBlocked && typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-gray-500 bg-gray-50 border-t">
          <TypingIndicator typingUsers={typingUsers} />
        </div>
      )}

      {/* Input (disabled if blocked) */}
      <div className="sticky bottom-0 bg-white border-t shadow-sm z-10">
        {isBlocked ? (
          <div className="text-center text-sm text-gray-400 py-3">
            You have blocked this user. Unblock to chat again.
          </div>
        ) : (
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
        )}
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <ForwardModal
          users={allUsers}
          excludeUserIds={[currentUser._id]}
          onClose={() => setShowForwardModal(false)}
          onForward={handleForwardToUsers}
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
