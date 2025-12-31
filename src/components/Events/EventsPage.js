import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (id) => {
    try {
      await api.post(`/events/${id}/join`);
      fetchEvents(); // refresh attendees count
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join event");
    }
  };

  return (
    <>
      {/* 🔹 YOUR EXISTING HEADER GOES HERE */}
      {/* <Header /> */}

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 p-6 font-poppins">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-blue-700">Events</h1>
              <p className="text-sm text-gray-600">
                Discover workshops, fests & campus activities
              </p>
            </div>

            <Link
              to="/create-events"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow hover:bg-blue-700 transition"
            >
              + Create Event
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-600">Loading events...</p>
          )}

          {/* No Events */}
          {!loading && events.length === 0 && (
            <p className="text-center text-gray-600">
              No events available
            </p>
          )}

          {/* Events Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event._id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border border-blue-100"
              >
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {event.category}
                </span>

                <h2 className="text-lg font-semibold mt-3 text-gray-800">
                  {event.title}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    {new Date(event.date).toDateString()} • {event.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {event.venue}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    {event.attendees?.length || 0} Attending
                  </div>
                </div>
                <Link to={`/events/${event._id}`}>
                <button className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-xl">
                  View Details
                </button>
              </Link>

                <button
                  onClick={() => joinEvent(event._id)}
                  className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  Join Event
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsPage;
