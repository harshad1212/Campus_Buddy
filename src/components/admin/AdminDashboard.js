import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const AdminDashboard = ({ currentUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const universityCode = currentUser?.universityCode;

  useEffect(() => {
    if (universityCode) fetchRequests();
  }, [universityCode]);

  // ✅ Fetch all pending requests for this admin’s university
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/registerrequests/${universityCode}`
      );
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle approve or reject
  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      const endpoint =
        action === "approve"
          ? `/api/approve-request/${id}`
          : `/api/reject-request/${id}`;

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        fetchRequests();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      console.error("Action Error:", err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex flex-col items-center p-6 font-poppins">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6 mt-6">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">
          Admin Dashboard
        </h2>

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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all"
          >
            Refresh
          </button>
        </div>

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
                  <th className="px-4 py-3 text-left">University</th>
                  <th className="px-4 py-3 text-center">Action</th>
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
                    <td className="px-4 py-3 text-gray-700">
                      {req.universityCode}
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
