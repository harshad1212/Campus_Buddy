import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { streamsList, semestersList, resourcesData } from "../../utils/academicData";

const UploadResources = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [stream, setStream] = useState(streamsList[0]);
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState(resourcesData[streamsList[0]][1][0]);
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const subjects = resourcesData[stream]?.[semester];
    setSubject(subjects ? subjects[0] : "");
  }, [stream, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You must be logged in to upload resources!");
      return;
    }

    if (!title || !file || !stream || !semester || !subject) {
      alert("Please fill all required fields!");
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
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Resource uploaded successfully!");
      setTitle("");
      setFile(null);
      setStream(streamsList[0]);
      setSemester(1);
      setSubject(resourcesData[streamsList[0]][1][0]);
      setDescription("");
    } catch (err) {
      console.error("Upload Error:", err.response || err);
      alert("Failed to upload resource!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Upload <span className="text-indigo-400">Resources</span>
        </h1>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
        >
          {/* Title */}
          <input
            type="text"
            placeholder="Resource Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
              text-white placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Selects */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Stream */}
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Stream
              </label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full bg-white/10 border border-indigo-400/30
                  rounded-xl px-4 py-3 text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {streamsList.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-200">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full bg-white/10 border border-indigo-400/30
                  rounded-xl px-4 py-3 text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {semestersList.map((sem) => (
                  <option key={sem} value={sem} className="bg-slate-900 text-slate-200">
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/10 border border-indigo-400/30
                  rounded-xl px-4 py-3 text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {resourcesData[stream][semester].map((subj) => (
                  <option key={subj} value={subj} className="bg-slate-900 text-slate-200">
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <textarea
            rows={3}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
              text-white placeholder-slate-400 resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* File */}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-slate-300
              file:mr-4 file:py-2 file:px-5
              file:rounded-xl file:border-0
              file:bg-indigo-600 file:text-white
              hover:file:bg-indigo-500 transition"
          />

          {/* Submit */}
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

export default UploadResources;
