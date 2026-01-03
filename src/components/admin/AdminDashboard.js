import React, { useEffect, useState } from "react";
import AdminHeader from "../admin/AdminHeader";
import AdminSidebar from "../admin/AdminSidebar";
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCcw,
  Eye
} from "lucide-react";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard"); 
  const [events, setEvents] = useState([]);
  
  // dashboard | pending

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const universityCode = currentUser?.universityCode;

  useEffect(() => {
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

  const handleAction = async (id, action) => {
    await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/${
        action === "approve" ? "approve-request" : "reject-request"
      }/${id}`,
      { method: "POST" }
    );
    setSelectedUser(null);
    fetchRequests();
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminSidebar
        pendingCount={requests.length}
        onPendingClick={() => setActiveView("pending")}  
        pendingEventsCount={events.length}
        />
      <AdminHeader />

      <main className="ml-64 p-6 bg-slate-100 min-h-screen">
        {/* ================= DEFAULT DASHBOARD VIEW ================= */}
        {activeView === "dashboard" && (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">
              Welcome Admin 👋
            </h2>
            <p className="text-gray-600">
              Manage user registrations, verify documents, and monitor campus
              activity from here.
            </p>
          </div>
        )}
        {/* ================= DASHBOARD CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6">
          <div
            onClick={() => setActiveView("pending")}
            className="bg-white rounded-xl shadow p-5 cursor-pointer hover:scale-[1.02] transition"
          >
            <p className="text-sm text-slate-500">Pending Requests</p>
            <h2 className="text-3xl font-bold text-indigo-600">
              {requests.length}
            </h2>
          </div>
          <div
            onClick={() => setActiveView("pending")}
            className="bg-white rounded-xl shadow p-5 cursor-pointer hover:scale-[1.02] transition"
          >
            <p className="text-sm text-slate-500">Pending Events</p>
            <h2 className="text-3xl font-bold text-indigo-600">
              {events.length}
            </h2>
          </div>

          
        </div>
    
          

        {/* ================= PENDING REQUESTS VIEW ================= */}
        {activeView === "pending" && (
          <>
            <button
              onClick={() => setActiveView("dashboard")}
              className="mb-4 text-indigo-600 font-medium"
            >
              ← Back to Dashboard
            </button>

            {/* Search + Refresh */}
            <div className="bg-white p-5 rounded-xl shadow mb-6 flex justify-between">
              <input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-4 py-2 rounded-lg w-1/3"
              />
              <button
                onClick={fetchRequests}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2
                    className="animate-spin text-indigo-600"
                    size={32}
                  />
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">{req.name}</td>
                        <td>{req.email}</td>
                        <td className="capitalize">{req.role}</td>
                        <td className="text-center">
                          <button
                            onClick={() => setSelectedUser(req)}
                            className="text-indigo-600 flex items-center gap-1 mx-auto"
                          >
                            <Eye size={16} /> View
                          </button>
                        </td>
                        <td className="flex gap-2 justify-center py-3">
                          <button
                            onClick={() =>
                              handleAction(req._id, "approve")
                            }
                            className="bg-green-500 text-white px-3 py-1.5 rounded"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleAction(req._id, "reject")
                            }
                            className="bg-red-500 text-white px-3 py-1.5 rounded"
                          >
                            <XCircle size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* ================= MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl">
            <h3 className="text-2xl font-bold text-indigo-700 text-center mb-4">
              User Verification
            </h3>

            <div className="flex justify-center mb-4">
              <img
                src={selectedUser.profilePhoto || "/avatar.png"}
                alt="Profile"
                className="w-28 h-28 rounded-full border object-cover shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p><b>Name:</b> {selectedUser.name}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Phone:</b> {selectedUser.phone || "—"}</p>
              <p><b>Gender:</b> {selectedUser.gender || "—"}</p>
              <p><b>DOB:</b> {selectedUser.dob || "—"}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
              <p><b>Department:</b> {selectedUser.department}</p>
              <p>
                <b>Enrollment / Employee ID:</b>{" "}
                {selectedUser.enrollmentNumber ||
                  selectedUser.employeeId ||
                  "—"}
              </p>
            </div>

            <div className="mt-5">
              <h4 className="font-semibold text-indigo-600 mb-2">
                Verification Document
              </h4>
              {selectedUser.idDocument ? (
                <a
                  href={selectedUser.idDocument}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  View / Download Document
                </a>
              ) : (
                <p className="text-gray-500 text-sm">
                  No document uploaded
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() =>
                  handleAction(selectedUser._id, "approve")
                }
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  handleAction(selectedUser._id, "reject")
                }
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
