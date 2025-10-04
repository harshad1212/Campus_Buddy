import React from 'react';
import PropTypes from 'prop-types';

/**
 * TypingIndicator — shows list of people who are typing.
 * Props:
 *  - typingUsers: array of { userId, name }
 */

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map(t => t.name).slice(0, 3);
  const text = names.length === 1 ? `${names[0]} is typing...` : `${names.join(', ')} are typing...`;

  return (
    <div className="px-3 py-1 text-sm text-gray-500">
      <span aria-live="polite">{text}</span>
    </div>
  );
};

TypingIndicator.propTypes = {
  typingUsers: PropTypes.array,
};

export default TypingIndicator;

