import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiPaperclip, FiSend, FiImage } from 'react-icons/fi';
import FilePreview from '../FilePreview';

/**
 * MessageInput — handles:
 *  - Enter to send, Shift+Enter newline
 *  - typing indicator (calls onTyping)
 *  - attach via drag/drop or file picker
 *  - preview images / attachments (renders FilePreview)
 *
 * Props:
 *  - onSend({ content, attachments })
 *  - onTyping(isTyping)
 *  - onUploadFiles(files) => returns [{ url, filename, type }]
 */

const MessageInput = ({ onSend, onTyping, onUploadFiles }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]); // attached files (local File objects)
  const [uploading, setUploading] = useState(false);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current);
    };
  }, []);

  const emitTyping = (isTyping) => {
    if (onTyping) onTyping(isTyping);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => emitTyping(false), 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      setFiles(prev => [...prev, ...dropped]);
    }
  };

  const handleAttachClick = () => {
    inputRef.current?.click();
  };

  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length > 0) setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (!text.trim() && files.length === 0) return;
    setUploading(true);

    // Upload files using provided callback and obtain attachments metadata for server
    let attachments = [];
    if (files.length > 0 && onUploadFiles) {
      try {
        attachments = await onUploadFiles(files);
      } catch (err) {
        // Handle upload error — show message to user
        console.error('Upload error', err);
      }
    }

    await onSend({ content: text.trim(), attachments });

    // Reset
    setText('');
    setFiles([]);
    setUploading(false);
    emitTyping(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-3">
      <div
        onDrop={handleDrop}
        onDragOver={onDragOver}
        className="border rounded-lg p-2 bg-white"
        aria-label="Message input area"
      >
        {files.length > 0 && (
          <div className="mb-2 grid grid-cols-4 gap-2">
            {files.map((f, idx) => (
              <FilePreview key={idx} file={f} onRemove={() => removeFile(idx)} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleAttachClick}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Attach files"
            title="Attach files"
          >
            <FiPaperclip />
          </button>

          <button
            onClick={() => {
              inputRef.current?.click();
            }}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Attach image"
            title="Attach image"
          >
            <FiImage />
          </button>

          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message (Enter to send, Shift+Enter for new line)"
            className="flex-1 resize-none h-12 p-2 rounded border focus:outline-none"
            aria-label="Message text"
          />

          <input type="file" multiple className="hidden" onChange={handleFilesPicked} ref={el => (inputRef.current = el)} />

          <button
            onClick={submit}
            disabled={uploading}
            className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
            aria-label="Send message"
            title="Send"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  onUploadFiles: PropTypes.func.isRequired,
};

export default MessageInput;
