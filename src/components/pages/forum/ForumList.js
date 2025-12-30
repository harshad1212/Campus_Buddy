import React, { useEffect, useState, useMemo } from "react";
import { getQuestions } from "../../services/forumApi";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

/* Avatar */
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
      className="rounded-full object-cover border"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs"
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
      const matchesTag = selectedTag
        ? q.tags?.includes(selectedTag)
        : true;
      return matchesSearch && matchesTag;
    });
  }, [questions, search, selectedTag]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Discussion Forum
        </h2>
        <button
          onClick={() => navigate("/forum/ask")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          + Ask Question
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full border rounded-lg pl-10 pr-4 py-2.5"
          />
        </div>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="border rounded-lg px-4 py-2.5"
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
            className="text-sm text-red-500"
          >
            <X />
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div
            key={q._id}
            onClick={() => navigate(`/forum/${q._id}`)}
            className="bg-white border rounded-xl p-5 cursor-pointer hover:shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {q.question}
            </h3>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <Avatar
                  name={q.askedBy?.name}
                  src={q.askedBy?.avatarUrl}
                />
                <span className="text-sm text-gray-600">
                  {q.askedBy?.name}
                </span>
              </div>

              <span className="text-sm font-medium text-blue-600">
                {q.answers.length} answers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
