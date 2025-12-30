import { NavLink } from "react-router-dom";
import { ClipboardList, Users, Building2 } from "lucide-react";

const AdminSidebar = ({ pendingCount }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
     ${isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`;

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 p-4">
      <h2 className="text-white text-xl font-bold mb-8">
        Admin Panel
        <span className="block text-sm text-slate-400">University Control</span>
      </h2>

      <nav className="space-y-2">
        <NavLink to="/admin/requests" className={linkClass}>
          <ClipboardList size={18} />
          Pending Requests
          {pendingCount > 0 && (
            <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <Users size={18} />
          Users
        </NavLink>

        <NavLink to="/admin/departments" className={linkClass}>
          <Building2 size={18} />
          Departments
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
