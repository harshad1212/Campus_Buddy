// src/components/Events/AdminEvents.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Events.css";
import Header from "../pages/Header";
import Footer from "../pages/Footer";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  const fetchPending = async () => {
    try {
      const res = await axios.get("/api/events/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveEvent = async (id) => {
    try {
      await axios.put(
        `/api/events/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Event approved!");
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Error approving event");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <>
      <Header />
      <div className="events-container">
        <h2>Pending Events for Approval</h2>
        <div className="event-grid">
          {events.length === 0 && <p>No pending events.</p>}
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>
                <b>Date:</b> {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <b>Venue:</b> {event.venue}
              </p>
              <button onClick={() => approveEvent(event._id)}>Approve</button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminEvents;
