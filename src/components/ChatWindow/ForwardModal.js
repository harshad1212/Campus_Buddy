import React, { useState } from "react";
import PropTypes from "prop-types";
import { Search, Send, X } from "lucide-react";

const ForwardModal = ({ users, excludeUserIds = [], onClose, onForward }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleForward = () => {
    if (selectedUsers.length === 0) return;
    onForward(selectedUsers);
  };

  const filteredUsers = users.filter(
    (u) =>
      !excludeUserIds.includes(u._id) &&
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/60 backdrop-blur-md animate-fadeIn">

      <div className="w-[420px] max-w-full
        bg-slate-900/90 backdrop-blur-xl
        border border-white/10
        rounded-2xl shadow-2xl
        p-5 animate-slideUp">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-100">
            Forward Message
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl
              bg-slate-800 text-slate-200 text-sm
              border border-white/10
              focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* USER LIST */}
        <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => {
              const selected = selectedUsers.includes(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => handleToggle(user._id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition
                    ${selected
                      ? "bg-indigo-500/20 border border-indigo-400/30"
                      : "hover:bg-white/5"
                    }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center
                      ${selected
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-white/20"
                      }`}
                  >
                    {selected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Avatar */}
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />

                  {/* Name */}
                  <span className="flex-1 text-sm text-slate-200 font-medium truncate">
                    {user.name}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium
              bg-slate-800 text-slate-300
              hover:bg-slate-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleForward}
            disabled={selectedUsers.length === 0}
            className={`px-4 py-2 rounded-xl text-sm font-medium
              flex items-center gap-2 transition
              ${selectedUsers.length > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-indigo-600/40 text-white cursor-not-allowed"
              }`}
          >
            <Send className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>

      {/* Animations + Scrollbar */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.25s ease-out;
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.15);
            border-radius: 3px;
          }
        `}
      </style>
    </div>
  );
};

ForwardModal.propTypes = {
  users: PropTypes.array.isRequired,
  excludeUserIds: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onForward: PropTypes.func.isRequired,
};

export default ForwardModal;
