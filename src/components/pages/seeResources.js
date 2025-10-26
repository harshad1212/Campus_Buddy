import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import "./css/Resources.css";
import { streamsList, semestersList, resourcesData } from "../../utils/academicData";

const SeeResources = () => {
  const [stream, setStream] = useState(streamsList[0]);
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState(resourcesData[streamsList[0]][1][0]);
  const [resources, setResources] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // logged-in user info

  useEffect(() => {
    const subjects = resourcesData[stream]?.[semester];
    setSubject(subjects ? subjects[0] : "");
  }, [stream, semester]);

  const getUserIdFromToken = () => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64)).id;
    } catch {
      return null;
    }
  };

  const fetchResources = async () => {
    if (!token) {
      alert("You must be logged in to view resources!");
      return;
    }

    try {
      const res = await axios.get("http://localhost:4000/api/resources", {
        headers: { Authorization: `Bearer ${token}` },
        params: { stream, semester, subject },
      });

      const resourcesWithFlags = res.data.map((r) => ({
        ...r,
        liked: r.likes?.includes(getUserIdFromToken()),
        commentText: "",
        showComments: false,
      }));

      setResources(resourcesWithFlags);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch resources!");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleLike = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/resources/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResources((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, liked: res.data.liked, likes: Array(res.data.likesCount).fill("x") }
            : r
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleCommentSubmit = async (e, id) => {
    e.preventDefault();
    const resource = resources.find((r) => r._id === id);
    if (!resource?.commentText) return;

    try {
      const newComment = await axios.post(
        `http://localhost:4000/api/resources/${id}/comment`,
        { text: resource.commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResources((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                comments: [...(r.comments || []), newComment.data],
                commentText: "",
              }
            : r
        )
      );
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const toggleComments = (id) => {
    setResources((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, showComments: !r.showComments } : r
      )
    );
  };

  return (
    <div className="resources-page">
      <Header />
      <main className="see-container">
        <h1>Search Resources</h1>
        <p>Filter resources by stream, semester, and subject.</p>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Stream</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)}>
                {streamsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Semester</label>
              <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                {semestersList.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {resourcesData[stream][semester].map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit">Search</button>
            </div>
          </div>
        </form>

        <div className="resources-list">
          {resources.length > 0 ? resources.map((res) => (
            <div className="resource-card" key={res._id}>
              <div className="resource-tags">
                <span className="tag stream">{res.stream}</span>
                <span className="tag semester">Sem {res.semester}</span>
                <span className="tag subject">{res.subject}</span>
              </div>

              <h3>{res.title}</h3>
              <p className="desc">{res.description || "No description available"}</p>

              <div className="meta">
                <span>Uploaded by: {res.uploader?.name || "Unknown"}</span>
                <span>Date: {new Date(res.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="actions">
                <button
                  onClick={() => handleLike(res._id)}
                  className={`like-btn ${res.liked ? "liked" : ""}`}
                >
                  ❤️ {res.likes?.length || 0}
                </button>
                <a href={res.fileUrl} download={res.fileName} target="_blank" rel="noopener noreferrer">
                  <button>Download</button>
                </a>
              </div>

              <div className="comments-toggle">
                <button
                  className="toggle-btn"
                  onClick={() => toggleComments(res._id)}
                >
                  {res.showComments
                    ? "Hide Comments"
                    : `View Comments (${res.comments?.length || 0})`}
                </button>
              </div>

              {res.showComments && (
                <div className="comments-section">
                  <form onSubmit={(e) => handleCommentSubmit(e, res._id)} className="comment-form">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={res.commentText || ""}
                      onChange={(e) =>
                        setResources((prev) =>
                          prev.map((r) =>
                            r._id === res._id ? { ...r, commentText: e.target.value } : r
                          )
                        )
                      }
                    />
                    <button type="submit">Post</button>
                  </form>

                  <div className="comments-list">
                    {res.comments?.length > 0 ? res.comments.map((c) => (
                      <p key={c._id}>
                        <strong>{c.user?.name || user?.name || "User"}:</strong> {c.text}
                      </p>
                    )) : (
                      <p className="no-comments">No comments yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )) : <p>No resources found for selected filters.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeeResources;
