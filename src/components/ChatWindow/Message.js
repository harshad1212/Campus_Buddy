import React from "react";
import PropTypes from "prop-types";
import { FiCheck } from "react-icons/fi";
import FilePreview from "../FilePreview";
import { formatRelativeTime } from "../../utils/time";

const StatusIcon = ({ status, readBy }) => {
  if (status === "pending") return <span className="text-xs text-gray-400">Sending...</span>;
  if (status === "failed") return <span className="text-xs text-red-500">Failed</span>;
  if (readBy?.length > 0) return <FiCheck className="text-blue-500" title="Read" />;
  if (status === "sent" || status === "delivered")
    return <FiCheck className="text-gray-400" title="Delivered" />;
  return null;
};

const Message = ({ message, isOwn }) => {
  const bubbleStyle = isOwn
    ? "bg-indigo-600 text-white self-end"
    : "bg-white border border-gray-200 text-gray-800 self-start";

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div className={`max-w-[70%] rounded-lg p-2 shadow ${bubbleStyle}`}>
        {!isOwn && <div className="text-xs font-semibold mb-1">{message.sender.name}</div>}

        {message.content && (
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.attachments.map((att, i) => (
              <FilePreview key={i} file={att} small />
            ))}
          </div>
        )}

        <div className="mt-1 text-xs flex items-center justify-between opacity-70">
          <span>{formatRelativeTime(new Date(message.createdAt))}</span>
          <StatusIcon status={message.status} readBy={message.readBy} />
        </div>
      </div>
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};

export default Message;
