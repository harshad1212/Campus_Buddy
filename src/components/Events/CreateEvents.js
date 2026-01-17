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

  /* ================= CLOSE DROPDOWN ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* HEADER */}
        <section className="text-center mb-5">
          <h1 className="text-4xl font-bold text-white mb-3">
            Create <span className="text-indigo-400">Event</span>
          </h1>
          <p className="text-slate-300">
            Events created by teachers require admin approval
          </p>
        </section>

        {/* FORM CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            <Section title="Basic Information">
              <Input name="title" label="Event Title" onChange={handleChange} />
              <Textarea
                name="description"
                label="Event Description"
                onChange={handleChange}
              />
            </Section>

            <Section title="Schedule & Venue">
              <Row>
                <Input
                  type="date"
                  name="date"
                  min={new Date().toISOString().split("T")[0]}
                  label="Event Date"
                  onChange={handleChange}
                />
                <Input
                  type="time"
                  name="time"
                  label="Event Time"
                  onChange={handleChange}
                />
              </Row>
              <Input
                name="venue"
                label="Venue / Platform"
                onChange={handleChange}
              />
            </Section>

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
              <div className="relative">
                <div
                  onClick={() => setDeptOpen(!deptOpen)}
                  className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2 cursor-pointer flex justify-between"
                >
                  <span className={form.department ? "text-white" : "text-slate-400"}>
                    {form.department || "Select department"}
                  </span>
                  <span className="text-slate-400">▾</span>
                </div>

                {deptOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-xl">
                    <input
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      placeholder="Search department..."
                      className="w-full px-4 py-2 bg-transparent border-b border-white/10 outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto">
                      {departments
                        .filter((d) =>
                          d.toLowerCase().includes(deptSearch.toLowerCase())
                        )
                        .map((dept) => (
                          <div
                            key={dept}
                            onClick={() => {
                              setForm({ ...form, department: dept });
                              setDeptOpen(false);
                              setDeptSearch("");
                            }}
                            className="px-4 py-2 hover:bg-indigo-500/20 cursor-pointer"
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
                  className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 min-h-[3.5rem] flex flex-wrap gap-2 cursor-pointer"
                >
                  {organizers.length === 0 && (
                    <span className="text-slate-400 text-sm">
                      Select organizers
                    </span>
                  )}

                  {organizers.map((id) => {
                    const t = teachers.find((x) => x._id === id);
                    return (
                      <span
                        key={id}
                        className="bg-indigo-500/20 text-indigo-300 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        {t?.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrganizer(id);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>

                {open && (
                  <div className="absolute z-20 mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-xl">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search professors..."
                      className="w-full px-4 py-2 bg-transparent border-b border-white/10 outline-none"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {filteredTeachers
                        .filter((t) =>
                          t.name.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((t) => (
                          <div
                            key={t._id}
                            onClick={() => toggleOrganizer(t._id)}
                            className="px-4 py-2 hover:bg-indigo-500/20 cursor-pointer flex justify-between"
                          >
                            {t.name}
                            {organizers.includes(t._id) && "✓"}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Registration Details">
              <Row>
                <Input
                  type="date"
                  name="deadline"
                  min={new Date().toISOString().split("T")[0]}
                  label="Registration Deadline"
                  onChange={handleChange}
                />
                <Input
                  type="url"
                  name="registrationLink"
                  label="Registration Link"
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

            <Section title="Additional Notes">
              <Textarea
                name="notes"
                label="Any extra information"
                onChange={handleChange}
              />
            </Section>

            <button
              disabled={loading}
              className="w-full py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition"
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};

/* ================= UI HELPERS ================= */

const Section = ({ title, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-indigo-300 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Row = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-slate-300">{label}</label>
    <input
      {...props}
      required
      className="bg-slate-900/60 text-white border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-slate-300">{label}</label>
    <textarea
      {...props}
      rows="4"
      required
      className="bg-slate-900/60 text-white border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-slate-300">{label}</label>
    <select
      {...props}
      required
      className="bg-slate-900/60 text-white border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
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
