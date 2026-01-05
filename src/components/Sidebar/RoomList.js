import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FiSearch, FiPlus } from "react-icons/fi";

/* ================= ROOM ITEM ================= */
const RoomItem = ({ room, active, onClick }) => {
  const last = room?.lastMessage;

  return (
    <button
      onClick={() => onClick(room._id)}
      aria-pressed={active}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all
        ${
          active
            ? "bg-indigo-600/20 border-l-4 border-indigo-500"
            : "hover:bg-white/5"
        }
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full
          bg-gradient-to-br from-indigo-500 to-purple-500
          flex items-center justify-center text-white
          font-semibold shadow-md">
          {room.isGroup
            ? room.name?.charAt(0)?.toUpperCase() || "G"
            : room.name?.slice(0, 2)?.toUpperCase() || "DM"}
        </div>

        {room.unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
              px-1 rounded-full bg-red-500 text-white
              text-[10px] flex items-center justify-center font-semibold"
          >
            {room.unreadCount}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-100 truncate">
          {room.name || "Unnamed"}
        </h4>

        <p className="text-xs text-slate-400 truncate mt-0.5">
          {last
            ? `${last.sender?.name ? last.sender.name + ": " : ""}${last.content?.slice(
                0,
                70
              )}`
            : "No messages yet"}
        </p>
      </div>
    </button>
  );
};

RoomItem.propTypes = {
  room: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

/* ================= ROOMS LIST ================= */
const RoomsList = ({
  rooms = [],
  activeRoomId,
  onSelectRoom,
  onCreateRoom,
}) => {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const filtered = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) =>
      (r.name || "").toLowerCase().includes(q)
    );
  }, [rooms, query]);

  return (
    <div className="flex flex-col h-full
      bg-slate-900 border-r border-white/10">

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10
        bg-slate-900/80 backdrop-blur sticky top-0 z-10">

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2
                text-slate-400"
            />
            <input
              aria-label="Search rooms"
              className="w-full pl-10 pr-3 py-2 rounded-full
                bg-slate-800 border border-white/10
                text-sm text-slate-100 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search chats"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Create button */}
          <button
            onClick={() => setCreating((p) => !p)}
            aria-expanded={creating}
            title="Create room"
            className="w-9 h-9 rounded-full
              bg-indigo-600 text-white
              flex items-center justify-center
              hover:bg-indigo-700 transition shadow-md"
          >
            <FiPlus />
          </button>
        </div>

        {/* Create room */}
        {creating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              onCreateRoom(newName.trim());
              setNewName("");
              setCreating(false);
            }}
            className="mt-3 flex gap-2"
          >
            <input
              className="flex-1 px-3 py-2 rounded-lg
                bg-slate-800 border border-white/10
                text-sm text-slate-100 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Room name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg
                bg-green-600 text-white text-sm
                hover:bg-green-700 transition shadow"
            >
              Create
            </button>
          </form>
        )}
      </div>

      {/* Rooms */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400 text-center">
            No rooms found
          </div>
        ) : (
          filtered.map((room) => (
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
