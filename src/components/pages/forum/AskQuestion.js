import React, { useState } from "react";
import { askQuestion } from "../../services/forumApi";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Header from "../Header";

export default function AskQuestion() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     Tag Handling
  =============================== */
  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim().toLowerCase();

      if (!value || tags.includes(value) || tags.length >= 5) return;

      setTags([...tags, value]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  /* ===============================
     Submit
  =============================== */
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (question.length < 10) {
      return setError("Question title should be at least 10 characters.");
    }

    try {
      setLoading(true);
      await askQuestion({ question, description, tags });
      navigate("/forum");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* HEADER */}
        <h2 className="text-4xl font-bold text-white mb-2">
          Ask a <span className="text-indigo-400">Question</span>
        </h2>
        <p className="text-slate-300 mb-5">
          Be specific and imagine you’re asking another student or developer.
        </p>

        {/* FORM */}
        <form
          onSubmit={submitHandler}
          className="
            bg-white/10 backdrop-blur-xl
            border border-white/10
            rounded-3xl p-8 space-y-4
          "
        >
          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Question Title
            </label>
            <input
              className="
                w-full rounded-xl
                bg-white/10 backdrop-blur
                border border-white/20
                px-4 py-3
                text-white
                transition-all
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:scale-[1.01]
              "
              placeholder="e.g. How to prevent multiple API calls in React?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              {question.length}/120 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              className="
                w-full rounded-xl
                bg-white/10 backdrop-blur
                border border-white/20
                px-4 py-3
                text-white
                transition-all
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:scale-[1.01]
              "
              placeholder="Explain what you tried, what you expected, and what happened."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-0">
              Tags <span className="text-slate-400">(up to 5)</span>
            </label>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="
                    flex items-center gap-1
                    bg-indigo-500/15
                    text-indigo-300
                    px-3 py-1.5
                    rounded-full text-sm
                    border border-indigo-400/30
                  "
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Input */}
            <input
              className="
                w-full rounded-xl
                bg-white/10 backdrop-blur
                border border-white/20
                px-4 py-3
                text-white
                transition-all
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />

            <p className="text-xs text-slate-400 mt-1">
              Examples: <b>react</b>, <b>node</b>, <b>mongodb</b>
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 font-medium">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              disabled={loading}
              className={`
                px-8 py-3 rounded-xl
                font-medium
                transition-all
                ${
                  loading
                    ? "bg-indigo-400/50 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 hover:scale-[1.03]"
                }
              `}
            >
              {loading ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
