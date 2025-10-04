import React from 'react';
import PropTypes from 'prop-types';
import OnlineStatus from '../Status/OnlineStatus';

/**
 * UsersList — lists users with online/offline presence.
 * Props:
 *  - users: array of user objects { _id, name, avatarUrl, online, lastSeen }
 *  - onStartPrivateChat(user)
 *
 * Accessibility: use button for each user with keyboard focus.
 */

const UserRow = ({ user, onClick }) => (
  <button
    onClick={() => onClick(user)}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none text-left"
  >
    <img src={user.avatarUrl} alt={`${user.name} avatar`} className="w-10 h-10 rounded-full object-cover" />
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{user.name}</div>
        <div className="text-xs text-gray-400">{user.online ? 'Online' : 'Offline'}</div>
      </div>
      <div className="text-xs text-gray-500">
        <OnlineStatus user={user} small />
      </div>
    </div>
  </button>
);

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

const UsersList = ({ users, onStartPrivateChat }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b">
        <div className="text-xs text-gray-500">All users</div>
      </div>

      <div className="overflow-y-auto">
        {users.length === 0 && <div className="p-4 text-xs text-gray-500">No users</div>}
        {users.map(u => (
          <UserRow key={u._id} user={u} onClick={onStartPrivateChat} />
        ))}
      </div>
    </div>
  );
};

UsersList.propTypes = {
  users: PropTypes.array.isRequired,
  onStartPrivateChat: PropTypes.func.isRequired,
};

export default UsersList;
