import React, { useEffect, useState } from "react";
import Header from "../pages/Header";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
} from "lucide-react";

/* ================= EVENTS PAGE ================= */

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-14">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <h1 className="text-4xl font-bold text-white">
            University <span className="text-indigo-400">Events</span>
          </h1>

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              bg-white/10 backdrop-blur-xl
              border border-white/20
              rounded-xl
              px-4 py-2
              text-white
              placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          />
        </div>

        {/* CONTENT */}
        {loading ? (
          /* ===== SKELETON LOADER ===== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-slate-400">No events found</p>
        ) : (
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
      </main>
    </div>
  );
};

export default EventsPage;

/* ================= EVENT CARD ================= */

const EventCard = ({ event, user, onApprove, onReject }) => {
  const statusStyle = {
    pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-green-500/10 text-green-400",
    rejected: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="
      bg-white/10 backdrop-blur-xl
      border border-white/10
      rounded-3xl
      p-6
      flex flex-col
      h-full
    ">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-semibold text-white leading-snug">
          {event.title}
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      {/* META */}
      <p className="text-sm text-slate-400 mb-3">
        {event.eventType} • {event.mode} • {event.department}
      </p>

      {/* DESCRIPTION */}
      <p className="text-sm text-slate-300 line-clamp-2 mb-4">
        {event.description}
      </p>

      {/* DETAILS */}
      <div className="space-y-2 text-sm text-slate-300 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <Clock className="w-4 h-4 text-indigo-400 ml-3" />
          <span>{event.time}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <span>{event.venue}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>{event.organizers?.map((o) => o.name).join(", ")}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-400" />
          <span>{event.contactEmail}</span>
        </div>
      </div>

      {/* REGISTER */}
      {event.registrationLink && (
        <a
          href={event.registrationLink}
          target="_blank"
          rel="noreferrer"
          className="
            mt-auto
            text-center
            py-2.5
            rounded-xl
            bg-indigo-600
            text-white
            font-medium
            hover:bg-indigo-500
            transition
          "
        >
          Register
        </a>
      )}

      {/* ADMIN ACTIONS */}
      {user?.role === "admin" && event.status === "pending" && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={onApprove}
            className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-500 transition"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= SKELETON CARD ================= */

const EventCardSkeleton = () => {
  return (
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-3xl
        p-6
        animate-pulse
        h-full
      "
    >
      <div className="flex justify-between mb-4">
        <div className="h-5 w-2/3 bg-white/20 rounded" />
        <div className="h-5 w-16 bg-white/20 rounded-full" />
      </div>

      <div className="h-4 w-3/4 bg-white/20 rounded mb-4" />

      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-white/20 rounded" />
        <div className="h-4 w-5/6 bg-white/20 rounded" />
      </div>

      <div className="space-y-3 mb-8">
        <div className="h-4 w-2/3 bg-white/20 rounded" />
        <div className="h-4 w-1/2 bg-white/20 rounded" />
        <div className="h-4 w-3/4 bg-white/20 rounded" />
        <div className="h-4 w-2/3 bg-white/20 rounded" />
      </div>

      <div className="h-11 w-full bg-white/20 rounded-xl mt-auto" />
    </div>
  );
};
