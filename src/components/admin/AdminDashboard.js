import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, RefreshCcw } from "lucide-react";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Load admin from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const universityCode = currentUser?.universityCode;

  useEffect(() => {
    console.log("🎓 Admin loaded:", currentUser);
    console.log("🏫 University Code:", universityCode);
    if (universityCode) fetchRequests();
  }, [universityCode]);

  // ✅ Fetch all pending registration requests
  const fetchRequests = async () => {
    if (!universityCode) {
      setMessage("⚠️ No university code found for this admin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/pending-requests/${universityCode}`
      );
      const data = await res.json();

      if (res.ok) {
        setRequests(data);
        console.log("✅ Loaded pending requests:", data);
      } else {
        setMessage(data.error || "Failed to fetch requests");
      }
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      setMessage("Server error while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle approve/reject actions
  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      const endpoint =
        action === "approve"
          ? `/api/admin/approve-request/${id}`
          : `/api/admin/reject-request/${id}`;

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchRequests(); // refresh list
      } else {
        setMessage(data.error || "Action failed");
      }
    } catch (err) {
      console.error("❌ Action Error:", err);
      setMessage("Server error while performing action");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ✅ Filter by search
  const filteredRequests = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex flex-col items-center p-6 font-poppins">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6 mt-6">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">
          Admin Dashboard
        </h2>

        {/* 🔍 Search & Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>

        {/* ✅ Status message */}
        {message && (
          <p className="text-center text-indigo-700 font-medium mb-4">
            {message}
          </p>
        )}

        {/* ✅ Loader */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
          </div>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            🎉 No pending registration requests.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Requested On</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req._id}
                    className="border-b hover:bg-indigo-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {req.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{req.email}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">
                      {req.role}
                    </td>
                    <td className="px-4 py-3 text-gray-500 time-cell">
                      {req.createdAt
                        ? (() => {
                            const date = new Date(req.createdAt);
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(today.getDate() - 1);

                            const isToday = date.toDateString() === today.toDateString();
                            const isYesterday = date.toDateString() === yesterday.toDateString();

                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const year = date.getFullYear();
                            const hours = date.getHours() % 12 || 12;
                            const minutes = String(date.getMinutes()).padStart(2, "0");
                            const ampm = date.getHours() >= 12 ? "PM" : "AM";

                            const time = `${hours}:${minutes} ${ampm}`;

                            if (isToday) return `Today • ${time}`;
                            if (isYesterday) return `Yesterday • ${time}`;
                            return `${day}-${month}-${year} • ${time}`;
                          })()
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleAction(req._id, "approve")}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-md transition"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-md transition"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
