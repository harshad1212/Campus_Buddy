import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import OnlineStatus from '../Status/OnlineStatus';

/**
 * UsersList — shows all users (students & teachers) with search, status, and chat options.
 * Props:
 *  - users: array of user objects { _id, name, avatarUrl, online, lastSeen, unreadCount }
 *  - onStartPrivateChat(user)
 */

const UserRow = ({ user, onClick }) => (
  <button
    onClick={() => onClick(user)}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 transition rounded-xl text-left group"
  >
    {/* Avatar */}
    <div className="relative">
      <img
        src={user.avatarUrl || '/default-avatar.png'}
        alt={`${user.name} avatar`}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />
      {/* Online status dot */}
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          user.online ? 'bg-green-500' : 'bg-gray-400'
        }`}
      ></span>
    </div>

    {/* User Info */}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium truncate">{user.name}</span>

        {/* Unread messages badge */}
        {user.unreadCount > 0 && (
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {user.unreadCount}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 truncate">
        {user.online ? 'Online' : `Last seen ${user.lastSeen || 'recently'}`}
      </div>
    </div>
  </button>
);

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

const UsersList = ({ users, currentUserId, onStartPrivateChat }) => {
  const [searchTerm, setSearchTerm] = useState('');

 const filteredUsers = users
    .filter(u => u._id !== currentUserId) // Exclude logged-in user
    .filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex flex-col h-full bg-white shadow-lg rounded-xl border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
        <h2 className="text-sm font-semibold text-gray-700">All Users</h2>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center bg-white rounded-full border border-gray-300 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-5 text-center text-gray-500 text-sm">
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserRow key={user._id} user={user} onClick={onStartPrivateChat} />
          ))
        )}
      </div>
    </div>
  );
};

UsersList.propTypes = {
  users: PropTypes.array.isRequired,
  onStartPrivateChat: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired, 
};

export default UsersList;
