import React from "react";
import { X } from "lucide-react";

// --- WhatsApp/Telegram style attachment previews
const AttachmentPreview = ({ file, type }) => {
  const url = file.url || "";

  switch (type) {
    case "image":
      return (
        <img
          src={url}
          alt="attachment"
          className="w-12 h-12 object-cover rounded"
        />
      );
    case "video":
      return (
        <video
          src={url}
          className="w-16 h-12 object-cover rounded"
          muted
          controls={false}
        />
      );
    case "pdf":
      return (
        <div className="w-16 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xs rounded">
          PDF
        </div>
      );
    default:
      return (
        <div className="w-16 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xs rounded">
          File
        </div>
      );
  }
};

const ReplyPreview = ({ replyTo, currentUser, onClose }) => {
  if (!replyTo) return null;

  const isOwn = replyTo.sender?._id === currentUser._id;

  return (
    <div className="flex items-start bg-gray-100 border-l-4 border-blue-400 px-3 py-2 mb-1 rounded-t-sm shadow-sm relative max-w-full">
      {/* Message content */}
      <div className="flex-1 text-xs text-gray-700 space-y-1">
        {/* Sender */}
        <div className="font-semibold truncate">
          {isOwn ? "You" : replyTo.sender?.name}
        </div>

        {/* Text */}
        {replyTo.content && (
          <div className="truncate text-gray-600">{replyTo.content}</div>
        )}

        {/* Attachments */}
        {replyTo.attachments?.length > 0 && (
          <div className="flex space-x-2 mt-1">
            {replyTo.attachments.map((att, i) => {
              let type = "other";
              if (att.type?.startsWith("image/") || att.url?.includes("/image/")) type = "image";
              else if (att.type?.startsWith("video/") || att.url?.includes("/video/")) type = "video";
              else if (att.type === "application/pdf" || att.url?.endsWith(".pdf")) type = "pdf";
              return <AttachmentPreview key={i} file={att} type={type} />;
            })}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700 absolute top-1 right-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ReplyPreview;
