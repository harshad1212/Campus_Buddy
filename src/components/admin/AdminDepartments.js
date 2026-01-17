import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { Plus, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
const AdminDepartments = () => {
    const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const universityCode = currentUser?.universityCode;

  /* ================= FETCH DEPARTMENTS WITH COUNT ================= */
  const fetchDepartments = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/departments/${universityCode}`
    );
    const data = await res.json();
    setDepartments(data || []);
  };

  useEffect(() => {
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

  /* ================= ADD DEPARTMENT ================= */
  const addDepartment = async () => {
    if (!newDept.trim()) return;

    await fetch(
      `${process.env.REACT_APP_API_URL}/api/university/${universityCode}/departments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: newDept }),
      }
    );

    setNewDept("");
    fetchDepartments();
  };

  /* ================= REMOVE DEPARTMENT ================= */
  const removeDepartment = async (dept) => {
    if (!window.confirm("Delete this department?")) return;

    await fetch(
      `${process.env.REACT_APP_API_URL}/api/university/${universityCode}/departments`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: dept }),
      }
    );

    fetchDepartments();
  };

  return (
    <>
      <AdminSidebar
        pendingCount={requests.length}
        pendingEventsCount={events.length}
        />
      <AdminHeader />
        

      <main className="ml-64 p-6 bg-slate-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Departments</h2>

        {/* ➕ Add Department */}
        <div className="bg-white p-5 rounded-xl shadow mb-6 flex gap-3">
          <input
            placeholder="Department name"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
          />
          <button
            onClick={addDepartment}
            className="bg-indigo-600 text-white px-4 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* 📋 Departments Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 text-left">Department</th>
                <th className="text-center">Students</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((dept, i) => (
                <tr key={i} className="border-b hover:bg-slate-50" 
                onClick={() =>
                        navigate(
                          `/admin/departments/${encodeURIComponent(
                            dept.name
                          )}/students`
                        )
                      }>
                  <td className="p-4 font-medium">{dept.name}</td>

                  <td className="text-center">
                    <div className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                      <Users size={16} />
                      {dept.students}
                    </div>
                  </td>

                  <td className="text-center">
                    <button
                      onClick={() => removeDepartment(dept.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departments.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No departments added yet
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDepartments;
