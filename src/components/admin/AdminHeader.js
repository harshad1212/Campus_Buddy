import React from "react";
import { LogOut, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="ml-64 h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-slate-800 pt-6">
        Admin Dashboard
      </h1>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
          <UserCog size={18} className="text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">
            {user?.name || "Admin"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
