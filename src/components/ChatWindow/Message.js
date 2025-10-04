import React from 'react';
import PropTypes from 'prop-types';
import { FiCheck } from 'react-icons/fi'; // removed FiCheckDouble
import FilePreview from '../FilePreview';
import OnlineStatus from '../Status/OnlineStatus';
import { formatRelativeTime } from '../../utils/time';

/**
 * Message — single message bubble.
 * Supports:
 *  - text
 *  - images (attachments with type 'image')
 *  - generic attachments
 *  - avatar, timestamp
 *  - delivered/read indicators
 *
 * Props:
 *  - message: object
 *  - isOwn: boolean
 *  - onMarkRead: callback
 */

const StatusIcon = ({ status, readBy }) => {
  if (status === 'pending') return <span className="text-xs text-gray-400">Sending...</span>;
  if (status === 'failed') return <span className="text-xs text-red-500">Failed</span>;
  if (readBy?.length > 0) return <FiCheck className="text-blue-500" title="Read" />; // replaced FiCheckDouble
  if (status === 'sent' || status === 'delivered') return <FiCheck className="text-gray-400" title="Delivered" />;
  return null;
};

StatusIcon.propTypes = {
  status: PropTypes.string,
  readBy: PropTypes.array,
};

const Message = ({ message, isOwn, onMarkRead }) => {
  const align = isOwn ? 'justify-end' : 'justify-start';
  const bubbleBg = isOwn ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-900';
  const time = formatRelativeTime(new Date(message.createdAt));

  return (
    <div className={`flex ${align} items-end`} aria-live="polite">
      {!isOwn && (
        <img
          src={message.sender.avatarUrl}
          alt={`${message.sender.name} avatar`}
          className="w-8 h-8 rounded-full mr-3 object-cover"
        />
      )}

      <div className={`max-w-[70%] p-2 rounded-lg shadow-sm ${bubbleBg}`}>
        {!isOwn && <div className="text-xs font-semibold mb-1">{message.sender.name}</div>}

        {message.content && <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.attachments.map((att, idx) => (
              <FilePreview key={idx} file={att} small />
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-300">
          <div>{time}</div>
          <div className="flex items-center gap-1">
            <StatusIcon status={message.status} readBy={message.readBy} />
          </div>
        </div>
      </div>

      {isOwn && (
        <div className="ml-3">
          <OnlineStatus user={message.sender} small />
        </div>
      )}
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
  onMarkRead: PropTypes.func,
};

export default Message;
