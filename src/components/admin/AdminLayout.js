import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = ({ pendingCount }) => {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <AdminSidebar pendingCount={pendingCount} />

      {/* Header */}
      <AdminHeader pendingCount={pendingCount} />

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
