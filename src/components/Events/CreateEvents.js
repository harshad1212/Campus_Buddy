import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // axios instance
import Header from "../pages/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/events", formData);
      alert("Event created successfully 🎉");
      navigate("/events");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create event");
    }
  };

  return (
    <>
      {/* 🔹 YOUR EXISTING HEADER GOES HERE */}
      <Header/>

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6 font-poppins">
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-8 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Create Event
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <textarea
              name="description"
              placeholder="Event Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <DatePicker
              selected={formData.dob}
              onChange={(date) => setFormData({ ...formData, dob: date })}
              placeholderText="Date of Event"
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />   
              
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="time"
                className="px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>

            <input
              type="text"
              name="venue"
              placeholder="Venue / Online Link"
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Select Category</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Fest">Fest</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Submit Event
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
