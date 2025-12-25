import React, { useEffect, useState } from "react";
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
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const universityCode = currentUser?.universityCode;

  useEffect(() => {
    if (universityCode) fetchRequests();
  }, [universityCode]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/pending-requests/${universityCode}`
      );
      const data = await res.json();
      if (res.ok) setRequests(data);
      else setMessage(data.error || "Failed to fetch requests");
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      const endpoint =
        action === "approve"
          ? `/api/admin/approve-request/${id}`
          : `/api/admin/reject-request/${id}`;

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setSelectedUser(null);
        fetchRequests();
      } else {
        setMessage(data.error || "Action failed");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-3xl font-bold text-indigo-800 text-center mb-6">
          Admin Dashboard
        </h2>

        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full sm:w-1/2"
          />
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>

        {message && (
          <p className="text-center text-indigo-700 mb-4">{message}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
          </div>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-600">
            No pending requests 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req._id}
                    className="border-b hover:bg-indigo-50"
                  >
                    <td className="px-4 py-3">{req.name}</td>
                    <td className="px-4 py-3">{req.email}</td>
                    <td className="px-4 py-3 capitalize">{req.role}</td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedUser(req)}
                        className="text-indigo-600 hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>

                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <button
                        onClick={() => handleAction(req._id, "approve")}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= USER DETAILS MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-xl">

            <h3 className="text-2xl font-bold text-indigo-700 text-center mb-4">
              User Verification
            </h3>

            <div className="flex justify-center mb-4">
              <img
                src={selectedUser.profilePhoto || "/avatar.png"}
                alt="Profile"
                className="w-28 h-28 rounded-full border object-cover"
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
                <b>Enrollment No.:</b>{" "}
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
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleAction(selectedUser._id, "approve")}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(selectedUser._id, "reject")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
