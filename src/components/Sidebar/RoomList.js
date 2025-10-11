import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiPlus } from 'react-icons/fi';

const RoomItem = ({ room, active, onClick }) => {
  const last = room?.lastMessage;
  return (
    <button
      onClick={() => onClick(room._id)}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 focus:outline-none ${
        active ? 'bg-gray-100' : ''
      }`}
      aria-pressed={active}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
        {room.isGroup
          ? room.name?.charAt(0)?.toUpperCase() || 'G'
          : room.name?.slice(0, 2)?.toUpperCase() || 'DM'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate">{room.name || 'Unnamed'}</div>
          {room.unreadCount > 0 && (
            <div className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded">
              {room.unreadCount}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {last ? `${last.sender?.name ? last.sender.name + ': ' : ''}${last.content?.slice(0, 70)}` : 'No messages yet'}
        </div>
      </div>
    </button>
  );
};

RoomItem.propTypes = {
  room: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const RoomsList = ({ rooms = [], activeRoomId, onSelectRoom, onCreateRoom }) => {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const filtered = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(r => (r.name || '').toLowerCase().includes(q));
  }, [rooms, query]);

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      {/* Search and Create */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              aria-label="Search rooms"
              className="pl-10 pr-3 py-2 w-full rounded bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Search rooms or groups"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setCreating(prev => !prev)}
            aria-expanded={creating}
            className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
            title="Create room"
          >
            <FiPlus />
          </button>
        </div>

        {creating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) {
                onCreateRoom(newName.trim());
                setNewName('');
                setCreating(false);
              }
            }}
            className="mt-3 flex gap-2"
          >
            <input
              className="flex-1 px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-green-200"
              placeholder="New room name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              type="submit"
            >
              Create
            </button>
          </form>
        )}
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-xs text-gray-500">No rooms found</div>
        ) : (
          filtered.map(room => (
            <RoomItem
              key={room._id}
              room={room}
              active={room._id === activeRoomId}
              onClick={onSelectRoom}
            />
          ))
        )}
      </div>
    </div>
  );
};

RoomsList.propTypes = {
  rooms: PropTypes.array,
  activeRoomId: PropTypes.string,
  onSelectRoom: PropTypes.func.isRequired,
  onCreateRoom: PropTypes.func.isRequired,
};

export default RoomsList;
