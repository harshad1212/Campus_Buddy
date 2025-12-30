import React from "react";
import { ShieldCheck, LogOut, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Left: Branding */}
        <div className="flex gap-6">
          <ShieldCheck size={28} />
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              Admin Panel
            </h1>

          </div>
        </div>

        {/* Right: Admin Info */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <UserCog size={20} />
            <span className="font-medium">
              {user?.name || "Admin"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;
