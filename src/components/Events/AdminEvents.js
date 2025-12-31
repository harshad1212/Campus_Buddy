import { useEffect, useState } from "react";
import api from "../../api/axios";
import { CheckCircle, XCircle } from "lucide-react";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/admin/all");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/events/admin/${id}/status`, { status });
    fetchEvents();
  };

  const badge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-600">Loading events...</p>
    );
  }

  return (
    <>
      {/* 🔹 ADMIN HEADER HERE */}
      {/* <AdminHeader /> */}

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 p-6 font-poppins">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-blue-100">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-blue-700">
              Event Approvals
            </h2>
            <p className="text-sm text-gray-600">
              Review and approve campus events
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Created By</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr
                    key={event._id}
                    className="border-t hover:bg-blue-50/40"
                  >
                    <td className="p-4 font-medium">{event.title}</td>
                    <td className="p-4">
                      {new Date(event.date).toDateString()}
                    </td>
                    <td className="p-4">
                      {event.createdBy?.name || "—"}
                    </td>
                    <td className="p-4">{badge(event.status)}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() =>
                          updateStatus(event._id, "approved")
                        }
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle />
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(event._id, "rejected")
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminEvents;
