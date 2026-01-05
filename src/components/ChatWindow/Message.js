import React, { useState } from "react";
import PropTypes from "prop-types";
import { FiCheck } from "react-icons/fi";
import { MoreVertical, Star } from "lucide-react";
import { formatMessageTime } from "../../utils/time";
import AttachmentPreview from "./AttachmentPreview";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

/* ================= STATUS ICON ================= */
const StatusIcon = ({ status, readBy, isOwn }) => {
  if (!isOwn) return null;

  if (status === "pending")
    return <span className="ml-1 text-[11px] text-slate-400">Sending…</span>;

  if (status === "failed")
    return <span className="ml-1 text-[11px] text-red-400">Failed</span>;

  if (readBy?.length > 0)
    return <FiCheck className="ml-1 w-3.5 h-3.5 text-indigo-400" />;

  return <FiCheck className="ml-1 w-3.5 h-3.5 text-slate-400" />;
};

/* ================= MESSAGE ================= */
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

  /* ================= STYLES ================= */
  const bubbleStyle = isOwn
    ? "bg-indigo-600/90 text-white rounded-2xl rounded-tr-none"
    : "bg-slate-800/90 text-slate-100 rounded-2xl rounded-tl-none border border-white/10";

  /* ================= FAVORITE ================= */
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
    if (mime === "application/pdf" || url.endsWith(".pdf")) return "pdf";
    return "other";
  };

  const messageOptions = isOwn
    ? ["Reply", "Forward", "Edit", "Delete"]
    : ["Reply", "Forward"];

  return (
    <div
      ref={scrollRef}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-1`}
    >
      <div
        className={`relative group max-w-[75%] px-4 pt-4 pb-2 shadow-lg transition ${bubbleStyle}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setShowOptions(false);
        }}
        style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
      >
        {/* FORWARDED */}
        {message.forwarded && (
          <span className="absolute -top-3 right-3 text-[10px] italic
            bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
            Forwarded
          </span>
        )}

        {/* FAVORITE */}
        {isFavorited && (
          <Star
            className="absolute -top-2 -right-2 w-4 h-4
              text-yellow-400 bg-slate-900 rounded-full p-[1px]"
          />
        )}

        {/* OPTIONS ICON */}
        {hovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions((p) => !p);
            }}
            disabled={loadingFav}
            className="absolute top-2 right-2 p-1 rounded-full
              hover:bg-white/10 transition"
          >
            <MoreVertical className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* SENDER */}
        {message.sender?.name && (
          <div className="text-xs mb-1 font-semibold text-indigo-300">
            {isOwn ? "You" : message.sender.name}
          </div>
        )}

        {/* REPLY PREVIEW */}
        {message.replyTo && (
          <div
            onClick={() =>
              message.replyTo?._id && onScrollToMessage(message.replyTo._id)
            }
            className="mb-2 px-3 py-2 rounded-lg
              bg-white/10 border-l-4 border-indigo-400
              text-xs cursor-pointer hover:bg-white/15 transition"
          >
            <span className="font-semibold text-indigo-300">
              {message.replyTo.sender?.name || "Unknown"}:
            </span>{" "}
            {message.replyTo.content ||
              (message.replyTo.attachments?.length ? "[Attachment]" : "")}
          </div>
        )}

        {/* TEXT */}
        {message.content && (
          <div className="text-[15px] leading-relaxed pr-5">
            {message.content}
          </div>
        )}

        {/* ATTACHMENTS */}
        {message.attachments?.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((file, i) => (
              <AttachmentPreview
                key={i}
                file={file}
                type={getFileType(file)}
                isOwn={isOwn}
                isSending={file.status === "sending"}
                progress={file.progress || 0}
              />
            ))}
          </div>
        )}

        {/* TIME + STATUS */}
        <div className="mt-1 flex justify-end items-center text-[11px] text-slate-400">
          <span>{formatMessageTime(new Date(message.createdAt))}</span>
          <StatusIcon status={message.status} readBy={message.readBy} isOwn={isOwn} />
        </div>

        {/* DROPDOWN */}
        {showOptions && (
          <div
            className={`absolute top-8 ${
              isOwn ? "right-0" : "left-0"
            } w-44 bg-slate-900 border border-white/10
              rounded-xl shadow-xl z-50 overflow-hidden`}
          >
            {messageOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onOption(opt, message);
                  setShowOptions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm
                  hover:bg-white/10 transition"
              >
                {opt}
              </button>
            ))}

            <div className="border-t border-white/10 my-1" />

            <button
              onClick={() => handleFavoriteToggle(!isFavorited)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-white/10"
            >
              {isFavorited ? "✩ Remove from Favorites" : "⭐ Add to Favorites"}
            </button>
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
