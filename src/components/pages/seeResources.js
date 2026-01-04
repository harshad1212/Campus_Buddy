import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { streamsList, semestersList, resourcesData } from "../../utils/academicData";
import {
  FaHeart,
  FaDownload,
  FaCommentDots,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";

const SeeResources = () => {
  const [stream, setStream] = useState(streamsList[0]);
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState(resourcesData[streamsList[0]][1][0]);
  const [resources, setResources] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const subjects = resourcesData[stream]?.[semester];
    setSubject(subjects ? subjects[0] : "");
  }, [stream, semester]);

  const getUserIdFromToken = () => {
    try {
      const base64Url = token.split(".")[1];
      return JSON.parse(atob(base64Url)).id;
    } catch {
      return null;
    }
  };

  const fetchResources = async () => {
    if (!token) return alert("Login required");

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/resources`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { stream, semester, subject },
      }
    );

    setResources(
      res.data.map((r) => ({
        ...r,
        liked: r.likes?.includes(getUserIdFromToken()),
        commentText: "",
        showComments: false,
      }))
    );
  };

  const handleLike = async (id) => {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/resources/${id}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setResources((prev) =>
      prev.map((r) =>
        r._id === id
          ? {
              ...r,
              liked: res.data.liked,
              likes: Array(res.data.likesCount).fill("x"),
            }
          : r
      )
    );
  };

  const handleDownload = async (id) => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/resources/${id}/download`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    window.open(res.data.fileUrl, "_blank");

    setResources((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, downloadCount: res.data.downloadCount } : r
      )
    );
  };

  const handleCommentSubmit = async (e, id) => {
    e.preventDefault();
    const resource = resources.find((r) => r._id === id);
    if (!resource.commentText) return;

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/resources/${id}/comment`,
      { text: resource.commentText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setResources((prev) =>
      prev.map((r) =>
        r._id === id
          ? {
              ...r,
              comments: [...(r.comments || []), res.data],
              commentText: "",
            }
          : r
      )
    );
  };

  const toggleComments = (id) => {
    setResources((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, showComments: !r.showComments } : r
      )
    );
  };

  const SelectBox = ({ value, onChange, options }) => (
    <div className="relative group">
      <select
        value={value}
        onChange={onChange}
        className="
          w-full appearance-none
          bg-white/5 backdrop-blur-xl
          border border-white/20
          rounded-xl
          px-4 py-3 pr-10
          text-slate-200
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-indigo-400
          focus:scale-[1.02]
          hover:border-indigo-400
        "
      >
        {options.map((o) => (
          <option key={o} className="bg-slate-900 text-white">
            {o}
          </option>
        ))}
      </select>

      {/* Animated Chevron */}
      <FaChevronDown
        className="
          absolute right-4 top-1/2 -translate-y-1/2
          text-slate-400
          transition-transform duration-300
          group-focus-within:rotate-180
        "
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-bold text-white mb-3 text-center">
          Browse <span className="text-indigo-400">Resources</span>
        </h1>

        <p className="text-slate-300 text-center mb-10">
          Filter resources by stream, semester, and subject
        </p>

        {/* FILTER BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchResources();
          }}
          className="
            bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl
            p-4 mb-16 mx-6 lg:mx-16
            grid md:grid-cols-[1fr_1fr_1fr_auto]
            gap-4 items-center
          "
        >
          <SelectBox
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            options={streamsList}
          />

          <SelectBox
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            options={semestersList}
          />

          <SelectBox
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={resourcesData[stream][semester]}
          />

          {/* SEARCH BUTTON */}
          <button
            type="submit"
            className="
              outlined-btn
              flex items-center gap-2
              px-6 py-3
              text-indigo-400
              hover:text-white
              transition
              group
            "
          >
            <FaSearch className="transition-transform group-hover:scale-110" />
            Search
          </button>
        </form>

        {/* RESOURCE LIST */}
        <div className="grid md:grid-cols-2 gap-8 mx-10">
          {resources.map((res) => (
            <div
              key={res._id}
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
            >
              <div className="flex gap-2 text-base mb-3">
                <span className="tag">{res.stream}</span>
                <span className="tag">Sem {res.semester}</span>
                <span className="tag">{res.subject}</span>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {res.title}
              </h3>

              <p className="text-slate-300 text-sm mb-4">
                {res.description || "No description"}
              </p>

              <p className="text-xs text-slate-400 mb-4">
                Uploaded by {res.uploader?.name || "Unknown"} •{" "}
                {new Date(res.createdAt).toLocaleDateString()}
              </p>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleLike(res._id)}
                  className={`flex items-center gap-2 ${
                    res.liked ? "text-red-400" : "text-slate-300"
                  }`}
                >
                  <FaHeart />
                  {res.likes?.length || 0}
                </button>

                <button
                  onClick={() => handleDownload(res._id)}
                  className="flex items-center gap-2 text-indigo-400"
                >
                  <FaDownload />
                  {res.downloadCount || 0}
                </button>

                <button
                  onClick={() => toggleComments(res._id)}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <FaCommentDots />
                  {res.comments?.length || 0}
                </button>
              </div>

              {res.showComments && (
                <div className="mt-6 border-t border-white/10 pt-4">
                  <form
                    onSubmit={(e) => handleCommentSubmit(e, res._id)}
                    className="flex gap-2 mb-3"
                  >
                    <input
                      value={res.commentText}
                      onChange={(e) =>
                        setResources((prev) =>
                          prev.map((r) =>
                            r._id === res._id
                              ? { ...r, commentText: e.target.value }
                              : r
                          )
                        )
                      }
                      placeholder="Add a comment..."
                      className="input flex-1"
                    />
                    <button className="outlined-btn">Post</button>
                  </form>

                  {res.comments?.length ? (
                    res.comments.map((c) => (
                      <p key={c._id} className="text-sm text-slate-300">
                        <strong>{c.user?.name || user?.name}:</strong> {c.text}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No comments yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SeeResources;
