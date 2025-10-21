import React from "react";
import PropTypes from "prop-types";

const OnlineStatus = ({ user, small }) => {
  if (!user) return null;
  return (
    <span
      className={`inline-flex items-center ${
        small ? "text-xs" : "text-sm"
      } ${user.online ? "text-green-500" : "text-gray-400"}`}
    >
      <span
        className={`w-2 h-2 mr-1 rounded-full ${
          user.online ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>
      {user.online ? "Online" : "Offline"}
    </span>
  );
};

OnlineStatus.propTypes = {
  user: PropTypes.object.isRequired,
  small: PropTypes.bool,
};

export default OnlineStatus;
