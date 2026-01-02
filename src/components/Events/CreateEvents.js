import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/Header";

const CreateEvents = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const universityCode = user?.universityCode;

  /* ================= STATES ================= */
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    eventType: "",
    mode: "",
    department: "",
    deadline: "",
    contactEmail: "",
    registrationLink: "",
    notes: "",
  });

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);

  /* DROPDOWN STATE */
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");


  /* ================= ACCESS CONTROL ================= */
  useEffect(() => {
    if (user?.role !== "teacher") navigate("/events");
  }, [user, navigate]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/university/${universityCode}/departments`
      );
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch {
      setDepartments([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/teachers/${universityCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
      setFilteredTeachers(Array.isArray(data) ? data : []);
    } catch {
      setTeachers([]);
    }
  };

  /* ================= FILTER TEACHERS ================= */
  useEffect(() => {
    if (!form.department) {
      setFilteredTeachers(teachers);
    } else {
      setFilteredTeachers(
        teachers.filter((t) => t.department === form.department)
      );
    }
    setOrganizers([]);
  }, [form.department, teachers]);

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleOrganizer = (id) => {
    setOrganizers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.department || organizers.length === 0) {
      alert("Select department and at least one organizer");
      return;
    }

    /* DATE + TIME VALIDATION */
    const today = new Date();
    today.setSeconds(0, 0);

    const eventDateTime = new Date(`${form.date}T${form.time}`);

    if (eventDateTime < today) {
      alert("Event date & time cannot be in the past");
      return;
    }

    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...form, organizers }),
      });

      alert("Event submitted for admin approval");
      navigate("/events");
    } catch {
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto my-10 bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-semibold text-[#1b3b5f] mb-1">
          Create Event
        </h1>
        <p className="text-gray-500 mb-6">
          Events created by teachers require admin approval
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFO */}
          <Section title="Basic Information">
            <Input name="title" label="Event Title" onChange={handleChange} />
            <Textarea
              name="description"
              label="Event Description"
              onChange={handleChange}
            />
          </Section>

          {/* DATE & LOCATION */}
          <Section title="Schedule & Venue">
            <Row>
              <Input
                type="date"
                name="date"
                label="Event Date"
                min={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
              />
              <Input
                type="time"
                name="time"
                label="Event Time"
                onChange={handleChange}
              />
            </Row>
            <Input name="venue" label="Venue / Platform" onChange={handleChange} />
          </Section>

          {/* EVENT DETAILS */}
          <Section title="Event Details">
            <Row>
              <Select
                name="eventType"
                label="Event Type"
                options={["Seminar", "Workshop", "Hackathon", "Guest Lecture"]}
                onChange={handleChange}
              />
              <Select
                name="mode"
                label="Mode"
                options={["Offline", "Online", "Hybrid"]}
                onChange={handleChange}
              />
            </Row>
          </Section>

          {/* DEPARTMENT */}
          <Section title="Organizing Department">
            <div className="flex flex-col gap-1 relative">
              

              {/* Selected / Trigger */}
              <div
                onClick={() => setDeptOpen(!deptOpen)}
                className="border rounded-lg px-4 py-2 cursor-pointer bg-white hover:border-blue-400 transition flex justify-between items-center"
              >
                <span className={form.department ? "" : "text-gray-400"}>
                  {form.department || "Select department"}
                </span>
                <span className="text-gray-400">▾</span>
              </div>

              {/* Dropdown */}
              {deptOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-20">
                  <input
                    type="text"
                    placeholder="Search department..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    className="w-full px-4 py-2 border-b outline-none"
                  />

                  <div className="max-h-40 overflow-y-auto">
                    {departments
                      .filter((d) =>
                        d.toLowerCase().includes(deptSearch.toLowerCase())
                      )
                      .map((dept, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setForm({ ...form, department: dept });
                            setDeptOpen(false);
                            setDeptSearch("");
                          }}
                          className={`px-4 py-2 cursor-pointer ${
                            form.department === dept
                              ? "bg-blue-100 text-blue-900"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          {dept}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Section>


          {/* ORGANIZERS */}
          <Section title="Event Organizers (Professors)">
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setOpen(!open)}
                className="border rounded-lg px-3 py-2 min-h-[3.5rem] flex flex-wrap gap-2 items-center cursor-pointer bg-white hover:border-blue-400 transition"
              >
                {organizers.length === 0 && (
                  <span className="text-gray-400 text-sm">
                    Select organizers
                  </span>
                )}

                {organizers.map((id) => {
                  const t = teachers.find((x) => x._id === id);
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                    >
                      {t?.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrganizer(id);
                        }}
                        className="text-blue-600 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}

                <span className="ml-auto text-gray-400">▾</span>
              </div>

              {open && (
                <div className="absolute left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl z-20">
                  <input
                    type="text"
                    placeholder="Search professors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border-b outline-none"
                  />

                  <div className="max-h-48 overflow-y-auto">
                    {filteredTeachers
                      .filter((t) =>
                        t.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((t) => {
                        const selected = organizers.includes(t._id);
                        return (
                          <div
                            key={t._id}
                            onClick={() => toggleOrganizer(t._id)}
                            className={`px-4 py-2 cursor-pointer flex justify-between ${
                              selected
                                ? "bg-blue-100 text-blue-900"
                                : "hover:bg-blue-50"
                            }`}
                          >
                            {t.name}
                            {selected && <span>✓</span>}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* REGISTRATION */}
          <Section title="Registration Details">
            <Row>
              <Input
                type="date"
                name="deadline"
                label="Registration Deadline"
                min={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
              />
              <Input
                type="url"
                name="registrationLink"
                label="Registration Link"
                placeholder="https://"
                onChange={handleChange}
              />
            </Row>
            <Input
              type="email"
              name="contactEmail"
              label="Contact Email"
              onChange={handleChange}
            />
          </Section>

          {/* NOTES */}
          <Section title="Additional Notes">
            <Textarea
              name="notes"
              label="Any extra information"
              onChange={handleChange}
            />
          </Section>

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#43a7e9] to-[#25cdd2]"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>
      </div>
    </>
  );
};

/* ================= UI HELPERS ================= */

const Section = ({ title, children }) => (
  <div className="bg-[#f8faff] border rounded-xl p-5">
    <h3 className="text-lg font-semibold text-[#1b3b5f] mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Row = ({ children }) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      {...props}
      required
      className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <textarea
      {...props}
      rows="4"
      required
      className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <select
      {...props}
      required
      className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
    >
      <option value="">Select</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default CreateEvents;
