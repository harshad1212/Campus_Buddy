import React from "react";
import { X } from "lucide-react";

/* ---------------- Attachment Preview ---------------- */
const AttachmentPreview = ({ file, type }) => {
  const url = file.url || "";

  switch (type) {
    case "image":
      return (
        <img
          src={url}
          alt="attachment"
          className="w-12 h-12 object-cover rounded-lg border border-white/10"
        />
      );
    case "video":
      return (
        <video
          src={url}
          className="w-16 h-12 object-cover rounded-lg border border-white/10"
          muted
        />
      );
    case "pdf":
      return (
        <div className="w-16 h-12 bg-slate-800 text-slate-200
          flex items-center justify-center text-xs rounded-lg
          border border-white/10">
          PDF
        </div>
      );
    default:
      return (
        <div className="w-16 h-12 bg-slate-800 text-slate-200
          flex items-center justify-center text-xs rounded-lg
          border border-white/10">
          File
        </div>
      );
  }
};

/* ---------------- Reply Preview ---------------- */
const ReplyPreview = ({ replyTo, currentUser, onClose }) => {
  if (!replyTo) return null;

  const isOwn = replyTo.sender?._id === currentUser._id;

  return (
    <div
      className="relative flex items-start gap-2
        bg-slate-900/80 backdrop-blur-xl
        border-l-4 border-indigo-400
        px-3 py-2 mb-2 rounded-lg
        shadow-lg max-w-full"
    >
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Sender */}
        <div className="text-xs font-semibold text-indigo-300 truncate">
          {isOwn ? "You" : replyTo.sender?.name}
        </div>

        {/* Text */}
        {replyTo.content && (
          <div className="text-xs text-slate-300 truncate">
            {replyTo.content}
          </div>
        )}

        {/* Attachments */}
        {replyTo.attachments?.length > 0 && (
          <div className="flex gap-2 mt-1">
            {replyTo.attachments.map((att, i) => {
              let type = "other";
              if (
                att.type?.startsWith("image/") ||
                att.url?.includes("/image/")
              )
                type = "image";
              else if (
                att.type?.startsWith("video/") ||
                att.url?.includes("/video/")
              )
                type = "video";
              else if (
                att.type === "application/pdf" ||
                att.url?.endsWith(".pdf")
              )
                type = "pdf";

              return (
                <AttachmentPreview
                  key={i}
                  file={att}
                  type={type}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        title="Cancel reply"
        className="absolute top-1 right-1 p-1
          text-slate-400 hover:text-red-400
          hover:bg-white/10 rounded-full transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ReplyPreview;
