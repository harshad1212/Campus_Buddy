import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  FiPaperclip,
  FiSend,
  FiX,
  FiFileText,
  FiImage,
  FiVideo,
  FiSmile,
  FiEdit3,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import ReplyPreview from "./ReplyPreview";

const MessageInput = ({
  onSend,
  onTyping,
  editingMessage,
  onCancelEdit,
  replyTo,
  onCancelReply,
  currentUser,
}) => {
  const [text, setText] = useState(editingMessage?.content || "");
  const [files, setFiles] = useState([]);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  const handleChange = (e) => {
    setText(e.target.value);
    adjustTextareaHeight();
    onTyping?.(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || []);
    const withPreview = picked.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...withPreview]);
    e.target.value = "";
  };

  const removeFile = (i) => {
    URL.revokeObjectURL(files[i].url);
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (!text.trim() && files.length === 0) return;

    const payload = {
      content: text.trim(),
      attachments: files,
      replyTo: replyTo
        ? {
            _id: replyTo._id,
            content: replyTo.content,
            sender: replyTo.sender,
            attachments: replyTo.attachments || [],
          }
        : null,
    };

    if (editingMessage?._id) payload.editId = editingMessage._id;

    onSend(payload);

    setText("");
    setFiles([]);
    setShowEmojiPicker(false);
    adjustTextareaHeight();
    onCancelEdit?.();
    onCancelReply?.();
  };

  return (
    <div className="relative p-3 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl">
      {/* Reply Preview */}
      {replyTo && (
        <ReplyPreview
          replyTo={replyTo}
          currentUser={currentUser}
          onClose={onCancelReply}
        />
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between
          bg-indigo-500/15 border-l-4 border-indigo-400
          rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center gap-2 text-sm text-indigo-300">
            <FiEdit3 />
            <div>
              <div className="font-medium">Editing Message</div>
              <div className="text-xs text-slate-400 truncate max-w-[220px]">
                {editingMessage.content || "Attachment"}
              </div>
            </div>
          </div>
          <button
            onClick={onCancelEdit}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Attachment options */}
      {showAttachOptions && (
        <div className="absolute bottom-16 left-4
          bg-slate-900 border border-white/10
          rounded-xl shadow-xl p-2 z-50 space-y-1">
          {[
            { icon: <FiImage />, label: "Photo", accept: "image/*" },
            { icon: <FiVideo />, label: "Video", accept: "video/*" },
            {
              icon: <FiFileText />,
              label: "Document",
              accept:
                "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
          ].map(({ icon, label, accept }) => (
            <button
              key={label}
              onClick={() => {
                fileInputRef.current.accept = accept;
                fileInputRef.current.click();
                setShowAttachOptions(false);
              }}
              className="flex items-center gap-2 px-3 py-2
                text-sm text-slate-200 hover:bg-white/10 rounded-lg"
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-50 shadow-xl">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              setText((prev) => prev + emojiData.emoji);
              textareaRef.current?.focus();
            }}
            theme="dark"
            width={300}
            height={350}
          />
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mb-2 flex gap-3 overflow-x-auto">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-xl overflow-hidden
                border border-white/10 bg-slate-800"
            >
              {f.type.startsWith("image/") ? (
                <img src={f.url} alt="preview" className="w-full h-full object-cover" />
              ) : f.type.startsWith("video/") ? (
                <video src={f.url} className="w-full h-full object-cover" muted controls />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-xs text-slate-300">
                  <FiFileText size={24} />
                  {f.file.name}
                </div>
              )}
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 p-1
                  bg-slate-900 rounded-full text-slate-300 hover:text-red-400"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2
        bg-slate-800 border border-white/10
        rounded-full px-3 py-1 shadow-lg">
        <button
          onClick={() => setShowAttachOptions(!showAttachOptions)}
          className="p-2 text-slate-400 hover:text-indigo-400"
        >
          <FiPaperclip />
        </button>

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-400 hover:text-indigo-400"
        >
          <FiSmile />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 resize-none bg-transparent
            text-sm text-slate-200 placeholder-slate-400
            focus:outline-none max-h-32 p-2"
          rows={1}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesPicked}
        />

        <button
          onClick={handleSubmit}
          title={editingMessage ? "Update message" : "Send"}
          className={`p-2 rounded-full text-white shadow-lg transition
            ${
              editingMessage
                ? "bg-indigo-500 hover:bg-indigo-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          {editingMessage ? <FiEdit3 size={18} /> : <FiSend size={18} />}
        </button>
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  editingMessage: PropTypes.object,
  onCancelEdit: PropTypes.func,
  replyTo: PropTypes.object,
  onCancelReply: PropTypes.func,
  currentUser: PropTypes.object.isRequired,
};

export default MessageInput;
