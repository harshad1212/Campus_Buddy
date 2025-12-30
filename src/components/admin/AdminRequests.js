import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const admin = JSON.parse(localStorage.getItem("user"));
  const universityCode = admin?.universityCode;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/pending-requests/${universityCode}`
      );
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Pending Requests ({requests.length})
      </h2>

      {requests.length === 0 ? (
        <p className="text-slate-600">No pending requests 🎉</p>
      ) : (
        <table className="w-full border rounded-lg">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r._id} className="border-b hover:bg-indigo-50">
                <td className="p-3">{r.name}</td>
                <td>{r.email}</td>
                <td className="capitalize">{r.role}</td>
                <td>{r.department}</td>
                <td>
                  <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRequests;
