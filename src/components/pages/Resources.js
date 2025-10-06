import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/Resources.css";

const API = "http://localhost:4000/api/resources"; // Change if deployed

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Upload form fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token"); // JWT from login

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API}?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("course", course);
    formData.append("semester", semester);
    formData.append("tags", tags);

    try {
      await axios.post(`${API}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully!");
      setSelectedFile(null);
      setTitle("");
      setSubject("");
      setCourse("");
      setSemester("");
      setTags("");
      setDescription("");
      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.post(`${API}/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (id) => {
    const text = prompt("Enter your comment:");
    if (!text) return;
    try {
      await axios.post(
        `${API}/${id}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (id) => {
    try {
      window.open(`${API}/${id}/download?token=${token}`, "_blank");
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="resources-container">
      <h1>📚 Campus Resources</h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {/* UPLOAD FORM */}
      <form className="upload-form" onSubmit={handleUpload}>
        <h3>Upload New Resource</h3>

        <input
          type="text"
          placeholder="Title"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* DROPDOWNS */}
        <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
          <option value="">Select Subject</option>
          <option value="Maths">DS</option>
          <option value="Physics">OS</option>
          <option value="Computer Science">CN</option>
          <option value="Chemistry">AWT</option>
          <option value="Chemistry">AJT</option>
        </select>

        <select value={course} onChange={(e) => setCourse(e.target.value)} required>
          <option value="">Select Course</option>
          <option value="B.Tech">B.Tech</option>
          <option value="B.Sc">B.Sc</option>
          <option value="M.Sc">M.Sc</option>
        </select>

        <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
          <option value="">Select Semester</option>
          <option value="1">1st</option>
          <option value="2">2nd</option>
          <option value="3">3rd</option>
          <option value="4">4th</option>
          <option value="5">5th</option>
          <option value="6">6th</option>
          <option value="7">7th</option>
          <option value="8">8th</option>
        </select>

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button type="submit" className="upload-btn">Upload</button>
      </form>

      {/* RESOURCE LIST */}
      <div className="resource-list">
        {resources.length === 0 ? (
          <p>No resources found.</p>
        ) : (
          resources.map((r) => (
            <div key={r._id} className="resource-card">
              <h3>{r.title}</h3>
              <p className="desc">{r.description || "No description"}</p>
              <p className="info">
                <strong>Subject:</strong> {r.subject || "N/A"} |{" "}
                <strong>Course:</strong> {r.course || "N/A"} |{" "}
                <strong>Sem:</strong> {r.semester || "N/A"}
              </p>

              <div className="actions">
                <button onClick={() => handleDownload(r._id)}>⬇️ Download</button>
                <button onClick={() => handleLike(r._id)}>❤️ {r.likes?.length || 0}</button>
                <button onClick={() => handleComment(r._id)}>💬 {r.comments?.length || 0}</button>
              </div>

              <div className="stats">
                <p>⬇️ Downloads: {r.downloadCount || 0}</p>
                <p>👤 Uploaded by: {r.uploader?.name || "Unknown"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Resources;
