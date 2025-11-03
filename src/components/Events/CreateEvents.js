// src/components/Events/CreateEvent.js
import React, { useState } from "react";
import axios from "axios";
import "./Events.css";
import Header from "../pages/Header";
import Footer from "../pages/Footer";

const CreateEvent = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
  });
  const token = localStorage.getItem("token");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/events", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event created! Awaiting admin approval.");
      setForm({ title: "", description: "", date: "", time: "", venue: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Error creating event");
    }
  };

  return (
    <>
      <Header />
      <div className="create-event-container">
        <h2>Create Event</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
          />
          <input
            name="venue"
            placeholder="Venue"
            value={form.venue}
            onChange={handleChange}
          />
          <button type="submit">Create Event</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default CreateEvent;
