import React, { useState } from "react";
import PropTypes from "prop-types";
import { FiCheck } from "react-icons/fi";
import { MoreVertical, Star } from "lucide-react";
import { formatMessageTime } from "../../utils/time";
import AttachmentPreview from "./AttachmentPreview";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

// ✅ Show tick mark only for sender
const StatusIcon = ({ status, readBy, isOwn }) => {
  if (!isOwn) return null; // hide for receiver

  if (status === "pending")
    return <span className="text-xs text-gray-400 ml-1">Sending...</span>;
  if (status === "failed")
    return <span className="text-xs text-red-500 ml-1">Failed</span>;
  if (readBy?.length > 0)
    return <FiCheck className="text-blue-500 w-3.5 h-3.5 ml-1" title="Read" />;
  return <FiCheck className="text-gray-400 w-3.5 h-3.5 ml-1" title="Delivered" />;
};

const Message = ({
  message,
  isOwn,
  onOption,
  currentUser,
  scrollRef,
  onScrollToMessage,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const isFavorited = message.favorites?.includes(currentUser._id);

  const bubbleStyle = isOwn
    ? "bg-blue-100 text-gray-900 rounded-2xl rounded-tr-none shadow-sm"
    : "bg-white border border-blue-100 text-gray-900 rounded-2xl rounded-tl-none shadow-sm";

  const handleFavoriteToggle = async (favorite) => {
    try {
      setLoadingFav(true);
      const endpoint = favorite ? "favorite" : "unfavorite";
      await fetch(`${API_BASE_URL}/api/messages/${message._id}/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
    } catch (err) {
      console.error("Favorite toggle error:", err);
    } finally {
      setLoadingFav(false);
      setShowOptions(false);
    }
  };

  const getFileType = (file) => {
    const url = file?.url || "";
    const mime = file?.type || "";
    if (mime.startsWith("image/") || url.includes("/image/upload/")) return "image";
    if (mime.startsWith("video/") || url.includes("/video/upload/")) return "video";
    if (mime === "application/pdf" || url.endsWith(".pdf") || url.includes("/raw/upload/"))
      return "pdf";
    return "other";
  };

  // ✅ Define options dynamically based on ownership
  const messageOptions = isOwn
    ? ["Reply", "Forward", "Edit", "Delete"]
    : ["Reply", "Forward"];

  return (
    <div
      ref={scrollRef}
      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} relative px-4 py-1`}
    >
      <div
        className={`relative group max-w-[75%] px-4 pt-4 pb-2 transition-all duration-200 ${bubbleStyle}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setShowOptions(false);
        }}
        style={{
          overflowWrap: "break-word",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {/* Forwarded label */}
        {message.forwarded && (
          <div className="absolute -top-3 right-3 text-[10px] italic text-blue-400 bg-blue-50 px-1 py-0.5 rounded-md border border-blue-100 select-none">
            Forwarded
          </div>
        )}

        {/* Favorite star */}
        {isFavorited && (
          <Star
            className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 bg-white rounded-full p-[1px] shadow-sm"
            title="Favorited"
          />
        )}

        {/* Hover menu icon */}
        {hovered && (
          <button
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-50 focus:outline-none transition"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions((prev) => !prev);
            }}
            disabled={loadingFav}
          >
            <MoreVertical
              className={`w-4 h-4 ${isOwn ? "text-blue-700" : "text-blue-600"}`}
            />
          </button>
        )}

        {/* Sender name */}
        {message.sender?.name && (
          <div
            className={`text-xs mb-1 font-semibold ${
              isOwn ? "text-blue-700" : "text-blue-600"
            }`}
          >
            {isOwn ? "You" : message.sender.name}
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div
            className="bg-blue-50 border-l-4 border-blue-400 px-2 py-1 mb-2 rounded text-xs text-gray-700 cursor-pointer hover:bg-blue-100 transition"
            onClick={() => {
              if (onScrollToMessage && message.replyTo._id)
                onScrollToMessage(message.replyTo._id);
            }}
          >
            <span className="font-semibold">
              {message.replyTo.sender?.name || "Unknown"}:{" "}
            </span>
            {message.replyTo.content ||
              (message.replyTo.attachments?.length ? "[Attachment]" : "")}
          </div>
        )}

        {/* Message text */}
        {message.content && (
          <div
            className="text-[15px] leading-relaxed pr-5 text-gray-800"
            style={{ userSelect: "text", overflowWrap: "anywhere" }}
          >
            {message.content}
          </div>
        )}

        {/* Attachments */}
        {message.attachments?.length > 0 && (
          <div className="mt-2 flex flex-col space-y-2">
            {message.attachments.map((file, i) => {
              const type = getFileType(file);
              return (
                <AttachmentPreview
                  key={i}
                  file={file}
                  type={type}
                  isOwn={isOwn}
                  isSending={file.status === "sending"}
                  progress={file.progress || 0}
                />
              );
            })}
          </div>
        )}

        {/* Time + Status */}
        <div className="mt-1 flex justify-end items-center text-[11px] text-gray-500">
          <span>{formatMessageTime(new Date(message.createdAt))}</span>
          <StatusIcon status={message.status} readBy={message.readBy} isOwn={isOwn} />
        </div>

        {/* Options Dropdown */}
        {showOptions && (
          <div
            className={`absolute top-8 ${
              isOwn ? "right-0" : "left-0"
            } w-44 bg-white text-gray-800 border border-blue-100 rounded-lg shadow-lg z-50`}
            onClick={(e) => e.stopPropagation()}
          >
            {messageOptions.map((opt) => (
              <button
                key={opt}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition ${
                  opt === "Forward" ? "text-blue-600" : ""
                }`}
                onClick={() => {
                  onOption(opt, message);
                  setShowOptions(false);
                }}
              >
                {opt}
              </button>
            ))}
            <div className="border-t border-blue-100 my-1" />
            {!isFavorited ? (
              <button
                onClick={() => handleFavoriteToggle(true)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
              >
                ⭐ Add to Favorites
              </button>
            ) : (
              <button
                onClick={() => handleFavoriteToggle(false)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition"
              >
                ✩ Remove from Favorites
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
  currentUser: PropTypes.object.isRequired,
  onOption: PropTypes.func,
  scrollRef: PropTypes.func,
  onScrollToMessage: PropTypes.func,
};

export default Message;
