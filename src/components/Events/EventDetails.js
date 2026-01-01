import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Header from "../pages/Header";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async () => {
    try {
      await api.post(`/events/${id}/join`);
      fetchEvent(); // refresh attendee count
    } catch (err) {
      alert("Unable to RSVP");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-600">Loading event...</p>
    );
  }

  if (!event) {
    return (
      <p className="text-center mt-20 text-gray-600">
        Event not found
      </p>
    );
  }

  return (
    <>
      {/* 🔹 YOUR HEADER HERE */}
      {/* <Header /> */}
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 p-6 font-poppins">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100"
          >
            {/* Category */}
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {event.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-semibold text-gray-800 mt-4">
              {event.title}
            </h1>

            {/* Meta Info */}
            <div className="mt-6 space-y-3 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                {new Date(event.date).toDateString()}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                {event.time}
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

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                About this event
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* RSVP */}
            <button
              onClick={joinEvent}
              className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              RSVP / Join Event
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
