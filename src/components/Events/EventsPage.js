import React, { useEffect, useState } from "react";
import Header from "../pages/Header";

const EventsPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  /* ================= ADMIN ACTIONS ================= */
  const updateStatus = async (id, status) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/api/events/admin/action/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: status === "approved" ? "approve" : "reject",
          }),
        }
      );
      fetchEvents();
    } catch {
      alert("Failed to update status");
    }
  };

  /* ================= FILTER ================= */
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto my-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-[#1b3b5f]">
            University Events
          </h1>

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-gray-400">
            No events found
          </div>
        ) : (
          /* 🔥 GRID LAYOUT FIX */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((e) => (
              <EventCard
                key={e._id}
                event={e}
                user={user}
                onApprove={() => updateStatus(e._id, "approved")}
                onReject={() => updateStatus(e._id, "rejected")}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EventsPage;

/* ================= EVENT CARD ================= */

const EventCard = ({ event, user, onApprove, onReject }) => {
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-[#1b3b5f]">
            {event.title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {event.eventType} • {event.mode} • {event.department}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      <p className="mt-3 text-gray-700 text-sm line-clamp-3">
        {event.description}
      </p>

      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <div>
          📅 {new Date(event.date).toLocaleDateString()} • ⏰ {event.time}
        </div>
        <div>📍 {event.venue}</div>
        <div>
          👨‍🏫 Organizers: {event.organizers?.map((o) => o.name).join(", ")}
        </div>
        <div>📧 {event.contactEmail}</div>
      </div>

      {/* ================= REGISTER BUTTON ================= */}
      {event.registrationLink && (
        <a
          href={event.registrationLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Register
        </a>
      )}

      {/* ================= ADMIN ACTIONS ================= */}
      {user?.role === "admin" && event.status === "pending" && (
        <div className="flex gap-3 mt-auto pt-5">
          <button
            onClick={onApprove}
            className="flex-1 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};
