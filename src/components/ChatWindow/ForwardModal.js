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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-full p-6 animate-slideUp border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Forward Message
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-700 outline-none"
          />
        </div>

        {/* User List */}
        <div className="max-h-72 overflow-y-auto custom-scrollbar mb-5">
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                  selectedUsers.includes(user._id)
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleToggle(user._id)}
              >
                <div
                  className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all ${
                    selectedUsers.includes(user._id)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selectedUsers.includes(user._id) && (
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

                <img
                  src={user.avatarUrl || "/default-avatar.png"}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <span className="text-gray-800 text-sm font-medium truncate">
                  {user.name}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedUsers.length === 0}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition ${
              selectedUsers.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-300 text-white cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>

      {/* Animations and Scrollbar */}
      <style>
        {`
          @keyframes fadeIn {
            from {opacity: 0;}
            to {opacity: 1;}
          }
          .animate-fadeIn { animation: fadeIn 0.25s ease-in-out; }

          @keyframes slideUp {
            from {transform: translateY(20px); opacity: 0;}
            to {transform: translateY(0); opacity: 1;}
          }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.15);
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
