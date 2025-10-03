import React, { useState } from "react";
import "./css/Resources.css";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");

  // Upload form states
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);

  // Upload new resource
  const handleUpload = (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file!");
      return;
    }

    const newResource = {
      id: Date.now(),
      title,
      course,
      semester,
      subject,
      tags: tags.split(",").map((t) => t.trim()),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file), // preview only (local)
      likes: 0,
      comments: [],
      ratings: [],
      downloadCount: 0,
    };

    setResources([...resources, newResource]);

    // Reset form
    setTitle("");
    setCourse("");
    setSemester("");
    setSubject("");
    setTags("");
    setFile(null);
  };

  // Like a resource
  const handleLike = (id) => {
    setResources(
      resources.map((res) =>
        res.id === id ? { ...res, likes: res.likes + 1 } : res
      )
    );
  };

  // Add comment
  const handleComment = (id, text) => {
    setResources(
      resources.map((res) =>
        res.id === id
          ? { ...res, comments: [...res.comments, text] }
          : res
      )
    );
  };

  // Rate resource (1–5 stars)
  const handleRate = (id, value) => {
    setResources(
      resources.map((res) =>
        res.id === id
          ? { ...res, ratings: [...res.ratings, value] }
          : res
      )
    );
  };

  // Download (simulated)
  const handleDownload = (id) => {
    setResources(
      resources.map((res) =>
        res.id === id
          ? { ...res, downloadCount: res.downloadCount + 1 }
          : res
      )
    );
    alert("Download started! (Simulated)");
  };

  // Filter resources by search
  const filteredResources = resources.filter(
    (res) =>
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.subject.toLowerCase().includes(search.toLowerCase()) ||
      res.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="resources-container">
      <h1>📘 Campus Resources</h1>

      {/* Upload Form */}
      <form className="upload-form" onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Title (e.g. Data Structures Notes)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload Resource</button>
      </form>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, course, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Resource List */}
      <div className="resource-list">
        {filteredResources.length === 0 ? (
          <p className="empty">No resources available 🚀</p>
        ) : (
          filteredResources.map((res) => (
            <div key={res.id} className="resource-card">
              <h3>{res.title}</h3>
              <p>
                📖 {res.subject} | 📚 {res.course} | 🎓 Semester {res.semester}
              </p>
              <p className="tags">
                {res.tags.map((t, i) => (
                  <span key={i}>#{t} </span>
                ))}
              </p>

              {/* File actions */}
              <div className="actions">
                <button onClick={() => handleLike(res.id)}>👍 Like</button>
                <span>{res.likes} Likes</span>
                <button onClick={() => handleDownload(res.id)}>⬇ Download</button>
                <span>{res.downloadCount} Downloads</span>
              </div>

              {/* Rating */}
              <div className="rating">
                Rate:
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(res.id, star)}
                  >
                    ⭐
                  </button>
                ))}
                <p>
                  Avg Rating:{" "}
                  {res.ratings.length > 0
                    ? (
                        res.ratings.reduce((a, b) => a + b, 0) /
                        res.ratings.length
                      ).toFixed(1)
                    : "No ratings yet"}
                </p>
              </div>

              {/* Comments */}
              <div className="comments-section">
                <h4>Comments</h4>
                {res.comments.length === 0 ? (
                  <p>No comments yet</p>
                ) : (
                  <ul>
                    {res.comments.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
                <CommentBox onAdd={(text) => handleComment(res.id, text)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Comment Box component
const CommentBox = ({ onAdd }) => {
  const [text, setText] = useState("");

  const submitComment = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText("");
    }
  };

  return (
    <form onSubmit={submitComment} className="comment-box">
      <input
        type="text"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default Resources;
