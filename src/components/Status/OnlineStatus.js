import React from 'react';
import PropTypes from 'prop-types';
import { formatRelativeTime } from '../../utils/time';

/**
 * OnlineStatus — shows small status indicator and last seen text.
 * Props:
 *  - user: { online: bool, lastSeen: timestamp }
 *  - small: boolean for compact display
 */

const OnlineStatus = ({ user, small }) => {
  const color = user.online ? 'bg-green-400' : 'bg-gray-300';
  return (
    <div className={`flex items-center gap-2 ${small ? 'text-xs' : 'text-sm'}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-xs text-gray-500">
        {user.online ? 'Online' : user.lastSeen ? `Last seen ${formatRelativeTime(new Date(user.lastSeen))}` : 'Offline'}
      </span>
    </div>
  );
};

OnlineStatus.propTypes = {
  user: PropTypes.object.isRequired,
  small: PropTypes.bool,
};

export default OnlineStatus;
