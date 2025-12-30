import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import "./css/Resources.css";
import { FaHeart, FaDownload, FaCommentDots, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyResources = () => {
  const [myResources, setMyResources] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch user's uploaded resources (no ESLint warnings)
  const fetchMyResources = useCallback(async () => {
    if (!token) {
      toast.error("⚠️ You must be logged in to view your resources!");
      return;
    }

    try {
      // Inline decode JWT
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const userId = JSON.parse(window.atob(base64)).id;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/resources/my`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { uploaderId: userId },
      });

      setMyResources(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("❌ Failed to fetch your resources!");
    }
  }, [token]);

  useEffect(() => {
    fetchMyResources();
  }, [fetchMyResources]);

  // ✅ Delete handler with custom toast confirmation
  const handleDelete = async (id) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div style={{ textAlign: "center" }}>
          <p>🗑️ Are you sure you want to delete this resource?</p>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button
              style={{
                background: "#d9534f",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  await axios.delete(`${process.env.REACT_APP_API_URL}/api/resources/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setMyResources((prev) => prev.filter((r) => r._id !== id));
                  toast.dismiss(toastId);
                  toast.success("✅ Resource deleted successfully!");
                } catch (err) {
                  console.error("Delete error:", err);
                  toast.dismiss(toastId);
                  toast.error("❌ Failed to delete resource!");
                }
              }}
            >
              Yes
            </button>
            <button
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
              onClick={() => {
                toast.dismiss(toastId);
                toast.info("❎ Deletion cancelled.");
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "bottom-right",
      }
    );
  };

  return (
    <div className="resources-page">
      <Header />
      <main className="see-container">
        <h1>My Uploaded Resources</h1>
        <p>Here are all the resources you've uploaded.</p>

        <div className="resources-list">
          {myResources.length > 0 ? (
            myResources.map((res) => (
              <div className="resource-card" key={res._id}>
                <div className="resource-tags">
                  <span className="tag stream">{res.stream}</span>
                  <span className="tag semester">Sem {res.semester}</span>
                  <span className="tag subject">{res.subject}</span>
                </div>

                <h3>{res.title}</h3>
                <p className="desc">{res.description || "No description provided"}</p>

                <div className="meta">
                  <span>Date: {new Date(res.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="stats">
                  <span>
                    <FaHeart className="icon" /> {res.likes?.length || 0} Likes
                  </span>
                  <span>
                    <FaCommentDots className="icon" /> {res.comments?.length || 0} Comments
                  </span>
                  <span>
                    <FaDownload className="icon" /> {res.downloadCount || 0} Downloads
                  </span>
                </div>

                <div className="actions">
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    <FaDownload className="icon" /> View / Download
                  </a>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(res._id)}
                  >
                    <FaTrashAlt className="icon" /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>You haven't uploaded any resources yet.</p>
          )}
        </div>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar theme="colored" />
    </div>
  );
};

export default MyResources;
