import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FiPaperclip, FiSend } from "react-icons/fi";
import FilePreview from "../FilePreview";

const MessageInput = ({ onSend, onTyping, onUploadFiles }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clear typing timeout on unmount
  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  // Handle typing
  const handleChange = (e) => {
    setText(e.target.value);

    if (onTyping) onTyping(true);
    clearTimeout(typingTimeoutRef.current);

    // debounce typing
    typingTimeoutRef.current = setTimeout(() => {
      if (onTyping) onTyping(false);
    }, 1000);
  };

  // Send message on Enter (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Pick files
  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  // Send message
  const handleSubmit = async () => {
    if (!text.trim() && files.length === 0) return;

    setUploading(true);
    let attachments = [];

    try {
      if (files.length > 0 && onUploadFiles) {
        attachments = await onUploadFiles(files);
      }

      await onSend({ content: text.trim(), attachments });

      setText("");
      setFiles([]);
      if (onTyping) onTyping(false);
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      {files.length > 0 && (
        <div className="mb-2 grid grid-cols-4 gap-2">
          {files.map((f, idx) => (
            <FilePreview key={idx} file={f} onRemove={() => removeFile(idx)} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white">
        <button
          onClick={handleAttachClick}
          className="p-2 hover:bg-gray-100 rounded"
          title="Attach file"
        >
          <FiPaperclip />
        </button>

        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none p-2 border-none focus:outline-none text-sm"
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
          disabled={uploading}
          className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,        // called with { content, attachments }
  onTyping: PropTypes.func,                 // called with true/false
  onUploadFiles: PropTypes.func.isRequired, // called with File[] -> returns uploaded attachments
};

export default MessageInput;
