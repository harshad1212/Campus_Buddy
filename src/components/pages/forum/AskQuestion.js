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
      await askQuestion({
        question,
        description,
        tags,
      });
      navigate("/forum");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header/>
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Ask a Question
      </h2>
      <p className="text-gray-500 mb-6">
        Be specific and imagine you’re asking another developer for help.
      </p>

      {/* Form */}
      <form
        onSubmit={submitHandler}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-6"
      >
        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Title
          </label>
          <input
            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. How to prevent multiple API calls in React?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {question.length}/120 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Explain what you tried, what you expected, and what actually happened."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (up to 5)
          </label>

          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <input
            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />

          <p className="text-xs text-gray-500 mt-1">
            Add relevant topics like <b>react</b>, <b>node</b>, <b>mongodb</b>
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 font-medium">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Posting..." : "Post Question"}
        </button>
      </form>
    </div>
    </>
  );
}
