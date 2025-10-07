import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import "./css/Resources.css";
import { streamsList, semestersList, resourcesData } from "../../utils/academicData";

const UploadResources = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [stream, setStream] = useState(streamsList[0]);
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState(resourcesData[streamsList[0]][1][0]);
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  // Update subject when stream or semester changes
  useEffect(() => {
    const subjects = resourcesData[stream]?.[semester];
    setSubject(subjects ? subjects[0] : "");
  }, [stream, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file || !stream || !semester || !subject) {
      alert("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("course", stream);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("description", description);

    try {
      await axios.post("http://localhost:4000/api/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      alert("Resource uploaded successfully!");
      setTitle(""); 
      setFile(null); 
      setStream(streamsList[0]); 
      setSemester(1);
      setSubject(resourcesData[streamsList[0]][1][0]); 
      setDescription("");
    } catch (err) {
      console.error(err);
      alert("Failed to upload resource!");
    }
  };

  return (
    <div className="resources-page">
      <Header />
      <main className="upload-container">
        <h1>Upload Resources</h1>
        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Resource Title */}
          <input 
            type="text" 
            placeholder="Resource Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />

          {/* Stream / Semester / Subject Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Stream</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)}>
                {streamsList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Semester</label>
              <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                {semestersList.map((sem) => <option key={sem} value={sem}>{sem}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {resourcesData[stream][semester].map((subj) => <option key={subj} value={subj}>{subj}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <textarea 
            placeholder="Description (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />

          {/* File Upload */}
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          {/* Submit Button */}
          <button type="submit">Upload</button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default UploadResources;
