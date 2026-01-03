import React, { useEffect, useState } from "react";
import AdminHeader from "../admin/AdminHeader";
import AdminSidebar from "../admin/AdminSidebar";
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCcw,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Eye
} from "lucide-react";

const AdminEventApprovals = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requests, setRequests] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const universityCode = currentUser?.universityCode;

  useEffect(() => {
    fetchEvents();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/pending-requests/${universityCode}`
      );
      const data = await res.json();
      setRequests(data || []);
    } catch {
      console.error("Failed to fetch requests");
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/events/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/events/${id}/${action}`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
    fetchEvents();
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminSidebar pendingCount={requests.length} pendingEventsCount={events.length} />
      <AdminHeader />

      <main className="ml-64 p-6 bg-slate-100 min-h-screen">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <StatCard label="Pending Events" value={events.length} color="indigo" />
          <StatCard label="Approved Events" value="—" color="green" />
          <StatCard label="Rejected Events" value="—" color="red" />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-5 rounded-xl shadow mb-6 flex justify-between items-center">
          <input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-1/3"
          />
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        {/* EVENTS TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center py-10 text-gray-500">No pending events</p>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Event Details</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="border-b hover:bg-slate-50 align-top">
                    {/* EVENT INFO */}
                    <td className="px-4 py-4 space-y-2">
                      <h3 className="font-semibold text-slate-800">{event.title}</h3>
                      <p className="text-sm text-slate-600">
                        {event.eventType} • {event.mode} • {event.department}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {event.venue}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users size={14} /> {event.organizers?.map(o => o.name).join(", ")}
                      </div>

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-indigo-600 text-sm underline mt-1"
                      >
                        View Details
                      </button>
                    </td>

                    {/* CREATED BY */}
                    <td className="py-4 text-sm">
                      <p className="font-medium">{event.createdBy?.name}</p>
                      <p className="text-gray-500 text-xs">{event.createdBy?.department}</p>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 text-orange-600 font-semibold">Pending</td>

                    {/* ACTION */}
                    <td className="py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAction(event._id, "approve")}
                          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(event._id, "reject")}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ================= VIEW MODAL ================= */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl">
            <h3 className="text-2xl font-bold text-indigo-700 text-center mb-4">
              Event Details
            </h3>

            <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
              <p><b>Title:</b> {selectedEvent.title}</p>
              <p><b>Type:</b> {selectedEvent.eventType}</p>
              <p><b>Mode:</b> {selectedEvent.mode}</p>
              <p><b>Department:</b> {selectedEvent.department}</p>
              <p><b>Date:</b> {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p><b>Time:</b> {selectedEvent.time}</p>
              <p><b>Venue:</b> {selectedEvent.venue}</p>
              <p><b>Organizers:</b> {selectedEvent.organizers?.map(o => o.name).join(", ")}</p>
              <p><b>Description:</b> {selectedEvent.description || "—"}</p>
              <p><b>Registration Link:</b>{" "}
                {selectedEvent.registrationLink ? (
                  <a
                    href={selectedEvent.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline"
                  >
                    Register Here
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEventApprovals;

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <h2 className={`text-3xl font-bold text-${color}-600`}>{value}</h2>
  </div>
);
