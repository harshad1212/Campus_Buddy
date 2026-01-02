import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { Trash2, Search, Award, Filter } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
 
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const universityCode = currentUser?.universityCode;

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/users/${universityCode}`
    );
    const data = await res.json();
    setUsers(data.filter((u) => u.isApproved));
  };

  /* ================= FETCH DEPARTMENTS ================= */
  const fetchDepartments = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/university/${universityCode}/departments`
    );
    const data = await res.json();
    setDepartments(data.departments || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchRequests();
    fetchPendingEvents();
  }, []);
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/admin/pending-requests/${universityCode}`
                );
                const data = await res.json();
                setRequests(data || []);
            } catch {
                console.error("Failed to fetch requests");
            } finally {
                setLoading(false);
            }
            };
            const fetchPendingEvents = async () => {
            try {
                const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/admin/events/pending`,
                {
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
                );
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch pending events");
            }
            };
  /* ================= DELETE USER ================= */
        const deleteUser = async (id) => {
            if (!window.confirm("Delete this user?")) return;
            await fetch(
            `${process.env.REACT_APP_API_URL}/api/admin/user/${id}`,
            { method: "DELETE" }
            );
            fetchUsers();
        };

  /* ================= FILTER LOGIC ================= */
        const filteredUsers = users.filter((u) => {
            const query = search.toLowerCase();

            const matchesSearch =
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.enrollmentNumber?.toLowerCase().includes(query) ||
            u.employeeId?.toLowerCase().includes(query);

            const matchesDept =
            selectedDept === "ALL" || u.department === selectedDept;

            return matchesSearch && matchesDept;
        });

  return (
    <>
      <AdminSidebar 
        pendingCount={requests.length}
        pendingEventsCount={events.length} />
      <AdminHeader />

      <main className="ml-64 p-6 bg-slate-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Approved Users</h2>

        {/* 🔍 SEARCH + DEPARTMENT FILTER */}
        <div className="bg-white px-4 py-2 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex items-center gap-3 w-full md:w-2/3">
            <Search size={18} />
            <input
              placeholder="Search by name, email, enrollment or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Department Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-1/3">
            <Filter size={18} />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 👥 USERS TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Enrollment / ID</th>
                <th>Department</th>
                <th>Points</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td>
                    {u.enrollmentNumber || u.employeeId || "—"}
                  </td>
                  <td>{u.department || "—"}</td>
                  <td className="flex items-center gap-1 pt-4">
                    <Award size={14} className="text-yellow-500" />
                    {u.totalPoints}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No users found
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminUsers;
