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
    if (onTyping) onTyping(true);
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

    // include editId when editing an existing message so parent can handle update
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

    if (editingMessage && editingMessage._id) payload.editId = editingMessage._id;

    onSend(payload);

    setText("");
    setFiles([]);
    setShowEmojiPicker(false);
    adjustTextareaHeight();
    onCancelEdit?.();
    onCancelReply?.();
  };

  return (
    <div className="relative p-3 bg-white border-t border-blue-100">
      {/* Reply Preview */}
      {replyTo && (
        <ReplyPreview
          replyTo={replyTo}
          currentUser={currentUser}
          onClose={onCancelReply}
        />
      )}

      {/* --- Editing Message Banner (WhatsApp-like style) --- */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 rounded-md px-3 py-2 mb-2 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FiEdit3 className="text-blue-600" />
            <div>
              <div className="font-medium">Editing Message</div>
              <div className="text-xs text-gray-600 truncate max-w-[200px]">
                {editingMessage.content || "Attachment"}
              </div>
            </div>
          </div>
          <button
            onClick={onCancelEdit}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition"
            title="Cancel editing"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Attachment options */}
      {showAttachOptions && (
        <div className="absolute bottom-16 left-4 flex flex-col gap-2 bg-white border border-blue-100 shadow-lg rounded-lg p-2 z-50">
          {[
            { icon: <FiImage className="text-blue-500" />, label: "Photo", accept: "image/*" },
            { icon: <FiVideo className="text-blue-500" />, label: "Video", accept: "video/*" },
            {
              icon: <FiFileText className="text-blue-500" />,
              label: "Document",
              accept:
                "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
          ].map(({ icon, label, accept }) => (
            <button
              key={label}
              className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded text-sm"
              onClick={() => {
                fileInputRef.current.accept = accept;
                fileInputRef.current.click();
                setShowAttachOptions(false);
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-50 shadow-lg">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              setText((prev) => prev + emojiData.emoji);
              textareaRef.current?.focus();
            }}
            theme="light"
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
              className="relative rounded-lg border border-blue-100 overflow-hidden"
            >
              {f.type.startsWith("image/") ? (
                <img src={f.url} alt="preview" className="w-24 h-24 object-cover" />
              ) : f.type.startsWith("video/") ? (
                <video src={f.url} className="w-24 h-24 object-cover" muted controls />
              ) : (
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-blue-50 text-gray-700 text-xs">
                  <FiFileText size={24} />
                  {f.file.name}
                </div>
              )}
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-700 hover:text-red-500 shadow"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2 border border-blue-100 rounded-full px-3 py-1.5 bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-400 transition">
        <button
          onClick={() => setShowAttachOptions(!showAttachOptions)}
          className="p-2 text-gray-600 hover:text-blue-600 rounded"
          title="Attach"
        >
          <FiPaperclip />
        </button>

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-600 hover:text-blue-600 rounded"
          title="Emoji"
        >
          <FiSmile />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none p-2 border-none focus:outline-none text-sm text-gray-800 overflow-hidden max-h-32 bg-transparent"
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
          className={`p-2 rounded-full text-white shadow-sm transition ${
            editingMessage
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={editingMessage ? "Update message" : "Send"}
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
