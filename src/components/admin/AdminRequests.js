import { useEffect, useState } from "react";
import { CheckCircle,
  XCircle,
  Loader2,
  RefreshCcw,
  Eye } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  
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
    <div>
      <AdminSidebar 
        pendingCount={requests.length}
        pendingEventsCount={events.length} />
      <AdminHeader />
      <main className="ml-64 p-6 bg-slate-100 min-h-screen">
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
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
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
                        <tr key={req._id} className="border-b hover:bg-slate-50">
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
            </main>
    </div>
  );
};

export default AdminRequests;
