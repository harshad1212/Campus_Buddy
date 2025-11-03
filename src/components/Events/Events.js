// src/components/Events/Events.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Events.css";
import Header from "../pages/Header";
import Footer from "../pages/Footer";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (id) => {
    try {
      await axios.post(
        `/api/events/${id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Joined successfully!");
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error joining event");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <>
      <Header />
      <div className="events-container">
        <h2>Upcoming Events</h2>
        <div className="event-grid">
          {events.length === 0 && <p>No events found.</p>}
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>
                <b>Date:</b> {new Date(event.date).toLocaleDateString()}
              </p>
              {event.time && <p><b>Time:</b> {event.time}</p>}
              {event.venue && <p><b>Venue:</b> {event.venue}</p>}
              <p><b>Attendees:</b> {event.attendees?.length || 0}</p>
              <button onClick={() => joinEvent(event._id)}>RSVP / Join</button>
            </div>
          ))}
        </div>

        {/* Floating Add Button */}
        <button
          className="floating-add-btn"
          onClick={() => navigate("/events/create")}
        >
          +
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Events;
