import React, { useEffect, useState, useMemo } from "react";
import { getQuestions } from "../../services/forumApi";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";

/* =========================
   AVATAR COMPONENT
========================= */
const Avatar = ({ name, src, size = 28 }) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover border border-indigo-500"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs"
    >
      {initials}
    </div>
  );
};

export default function ForumList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getQuestions().then((res) => {
      setQuestions(res.data);
      setLoading(false);
    });
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set();
    questions.forEach((q) => q.tags?.forEach((t) => tags.add(t)));
    return [...tags];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.question
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTag = selectedTag ? q.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [questions, search, selectedTag]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <main className="max-w-6xl mx-auto px-12 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Discussion Forum</h2>
          <button
            onClick={() => navigate("/forum/ask")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition"
          >
            + Ask Question
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full border border-white/20 rounded-xl bg-white/5 backdrop-blur px-10 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="border border-white/20 rounded-xl bg-white/5 backdrop-blur px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>

          {(search || selectedTag) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedTag("");
              }}
              className="text-red-400 hover:text-red-500 flex items-center gap-1"
            >
              <X size={18} />
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Loading...</p>
        ) : filteredQuestions.length === 0 ? (
          <p className="text-center text-slate-400">No questions found.</p>
        ) : (
          <div className="space-y-5">
            {filteredQuestions.map((q) => (
              <div
                key={q._id}
                onClick={() => navigate(`/forum/${q._id}`)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {q.question}
                </h3>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={q.askedBy?.name}
                      src={q.askedBy?.avatarUrl}
                    />
                    <span className="text-sm text-slate-300">
                      {q.askedBy?.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-indigo-400">
                    {q.answers.length} answers
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {q.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
