import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import {
  FaHeart,
  FaDownload,
  FaCommentDots,
  FaTrashAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyResources = () => {
  const [myResources, setMyResources] = useState([]);
  const token = localStorage.getItem("token");

  /* ================= FETCH MY RESOURCES ================= */
  const fetchMyResources = useCallback(async () => {
    if (!token) {
      toast.error("⚠️ Login required");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const userId = JSON.parse(atob(base64)).id;

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/resources/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { uploaderId: userId },
        }
      );

      setMyResources(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch resources");
    }
  }, [token]);

  useEffect(() => {
    fetchMyResources();
  }, [fetchMyResources]);

  /* ================= DELETE RESOURCE ================= */
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
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/resources/${id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  setMyResources((prev) =>
                    prev.filter((r) => r._id !== id)
                  );
                  toast.dismiss(toastId);
                  toast.success("✅ Resource deleted");
                } catch (err) {
                  console.error(err);
                  toast.dismiss(toastId);
                  toast.error("❌ Delete failed");
                }
              }}
            >
              Yes
            </button>

            <button
              style={{
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
              onClick={() => {
                toast.dismiss(toastId);
                toast.info("❎ Deletion cancelled");
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

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-bold text-white mb-3 text-center">
          My <span className="text-indigo-400">Uploaded Resources</span>
        </h1>

        <p className="text-slate-300 text-center mb-12">
          Here are all the resources you've uploaded
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {myResources.length > 0 ? (
            myResources.map((res) => (
              <div
                key={res._id}
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
              >
                {/* TAGS */}
                <div className="flex gap-2 text-sm mb-3">
                  <span className="tag">{res.stream}</span>
                  <span className="tag">Sem {res.semester}</span>
                  <span className="tag">{res.subject}</span>
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {res.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-slate-300 text-sm mb-4">
                  {res.description || "No description provided"}
                </p>

                {/* META */}
                <p className="text-xs text-slate-400 mb-5">
                  Date:{" "}
                  {new Date(res.createdAt).toLocaleDateString()}
                </p>

                {/* STATS — SAME TEXT AS OLD DESIGN */}
                <div className="flex justify-between items-center mb-5">
                  <span className="flex items-center gap-2 text-slate-300">
                    <FaHeart /> {res.likes?.length || 0} Likes
                  </span>

                  <span className="flex items-center gap-2 text-slate-300">
                    <FaCommentDots />{" "}
                    {res.comments?.length || 0} Comments
                  </span>

                  <span className="flex items-center gap-2 text-indigo-400">
                    <FaDownload /> {res.downloadCount || 0} Downloads
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between items-center">
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <FaDownload />
                    View / Download
                  </a>

                  <button
                    onClick={() => handleDelete(res._id)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                  >
                    <FaTrashAlt />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 col-span-full">
              You haven't uploaded any resources yet.
            </p>
          )}
        </div>
      </main>

      <Footer />

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar
        theme="colored"
      />
    </div>
  );
};

export default MyResources;
