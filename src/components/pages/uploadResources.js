import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { streamsList, semestersList, resourcesData } from "../../utils/academicData";
import { FiBookOpen, FiLayers, FiUpload, FiFileText } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const UploadResources = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [stream, setStream] = useState(streamsList[0]);
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState(resourcesData[streamsList[0]][1][0]);
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const subjects = resourcesData[stream]?.[semester];
    setSubject(subjects ? subjects[0] : "");
  }, [stream, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    if (!title || !file || !stream || !semester || !subject) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("stream", stream);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("description", description);

    try {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/resources/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Resource uploaded successfully 🚀");
      setTitle("");
      setFile(null);
      setStream(streamsList[0]);
      setSemester(1);
      setSubject(resourcesData[streamsList[0]][1][0]);
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };
console.log("UploadResources rendered");
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />
      <Toaster position="top-right" />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Upload <span className="text-indigo-400">Resources</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
        >
          {/* Title */}
          <div className="relative">
            <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input
              type="text"
              placeholder="Resource Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-11 bg-white/10 border border-white/20 rounded-xl px-4 py-3
                text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Stream"
              icon={<FiLayers />}
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              options={streamsList}
            />

            <Select
              label="Semester"
              icon={<FiLayers />}
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              options={semestersList}
            />

            <Select
              label="Subject"
              icon={<FiBookOpen />}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={resourcesData[stream][semester]}
            />
          </div>

          {/* Description */}
          <div className="relative">
            <FiFileText className="absolute left-4 top-4 text-indigo-400" />
            <textarea
              rows={3}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-11 bg-white/10 border border-white/20 rounded-xl px-4 py-3
                text-white placeholder-slate-400 resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Drag & Drop Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              setFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
              ${dragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/20"}
            `}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <FiUpload className="mx-auto text-3xl text-indigo-400 mb-2" />
            <p className="text-sm text-slate-300">
              {file ? file.name : "Drag & drop resource here or click to upload"}
            </p>
            <input
              id="fileInput"
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {/* Outlined Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500
              text-white py-3 rounded-xl font-semibold transition"
          >
            Upload Resource
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

/* ---------- Reusable Select ---------- */
const Select = ({ label, icon, value, onChange, options }) => (
  <div>
    <label className="block text-sm mb-1 text-slate-300">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
        {icon}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-11 bg-indigo-500/10 border border-indigo-400/30
          rounded-xl px-4 py-3 text-slate-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default UploadResources;
