import React, { useEffect, useRef, useState } from "react";
import {
  getQuestion,
  postAnswer,
  voteAnswer,
  markBestAnswer,
  editAnswer,
  deleteAnswer,
} from "../../services/forumApi";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import Header from "../Header";

/* ===============================
   Avatar Component
=============================== */
const Avatar = ({ name, src, size = 36 }) => {
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
      className="rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm"
    >
      {initials}
    </div>
  );
};

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);

  const currentUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
})();

  const isAdmin = currentUser?.role === "admin";

  /* ===============================
     Load Question
  =============================== */
  const loadQuestion = async () => {
    const res = await getQuestion(id);
    setQuestion(res.data);
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  /* ===============================
     Helpers
  =============================== */
  const getUserVote = (answer, userId) => {
    if (!answer?.voters || !userId) return 0;
    const voter = answer.voters.find(
      (v) => v.userId?.toString() === userId.toString()
    );
    return voter ? voter.vote : 0;
  };

  /* ===============================
     Voting (SAFE VERSION)
  =============================== */
  const handleVote = async (answerId, voteValue) => {
    try {
      await voteAnswer(id, answerId, voteValue);
      await loadQuestion(); // ✅ refetch instead of mutating
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  /* ===============================
     Best Answer
  =============================== */
  const handleMarkBest = async (answerId) => {
    try {
      await markBestAnswer(id, answerId);
      await loadQuestion();
    } catch (err) {
      console.error(err);
    }
  };

  /* ===============================
     Edit / Delete
  =============================== */
  const startEdit = (answer) => {
    setEditingAnswerId(answer._id);
    setEditedText(answer.text);
    setOpenMenuId(null);
  };

  const saveEdit = async (answerId) => {
    const res = await editAnswer(id, answerId, editedText);
    setQuestion(res.data);
    setEditingAnswerId(null);
  };

  const removeAnswer = async (answerId) => {
    if (!window.confirm("Delete this answer?")) return;
    const res = await deleteAnswer(id, answerId);
    setQuestion(res.data);
  };

  /* ===============================
     Post Answer
  =============================== */
  const submitAnswer = async () => {
    if (!answerText.trim()) return;
    const res = await postAnswer(id, answerText);
    setQuestion(res.data);
    setAnswerText("");
  };

  if (!question) return null;

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-4"
        >
          <ArrowLeft size={18} /> Back to forum
        </button>

        {/* Question */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              name={question.askedBy?.name}
              src={question.askedBy?.avatarUrl}
              size={40}
            />
            <div>
              <p className="font-medium">{question.askedBy?.name}</p>
              <p className="text-xs text-gray-500">Asked a question</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold">{question.question}</h2>
          <p className="text-gray-600 mt-3">{question.description}</p>
        </div>

        {/* Answers */}
        <h3 className="mt-8 text-xl font-semibold">
          Answers ({question.answers.length})
        </h3>

        <div className="space-y-4 mt-4">
          {question.answers
            .filter((a) => a.userId) // 🔥 CRITICAL FIX
            .sort((a, b) => b.isBestAnswer - a.isBestAnswer)
            .map((a) => {
              const userVote = getUserVote(a, currentUser?._id);
              const canManage =
                a.userId?._id === currentUser?._id || isAdmin;

              return (
                <div
                  key={a._id}
                  className={`border rounded-xl p-5 ${
                    a.isBestAnswer
                      ? "border-green-500 bg-green-50"
                      : "bg-white"
                  }`}
                >
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={a.userId?.name}
                        src={a.userId?.avatarUrl}
                        size={32}
                      />
                      <div>
                        <p className="font-medium">{a.userId?.name}</p>
                        {a.isBestAnswer && (
                          <span className="text-xs text-green-600">
                            ✓ Best Answer
                          </span>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === a._id ? null : a._id)
                          }
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === a._id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow">
                            <button
                              onClick={() => startEdit(a)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeAnswer(a._id)}
                              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {editingAnswerId === a._id ? (
                    <textarea
                      className="w-full border rounded p-2"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                  ) : (
                    <p>{a.text}</p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm">
  <button
    onClick={() => handleVote(a._id, 1)}
    disabled={userVote === 1}
    className={`${
      userVote === 1 ? "text-blue-600 font-bold" : ""
    }`}
  >
    👍
  </button>

  <span>{a.votes}</span>

  <button
    onClick={() => handleVote(a._id, -1)}
    disabled={userVote === -1}
    className={`${
      userVote === -1 ? "text-red-600 font-bold" : ""
    }`}
  >
    👎
  </button>

  {question.askedBy?._id === currentUser?._id && !a.isBestAnswer && (
    <button
      onClick={() => handleMarkBest(a._id)}
      className="ml-auto text-green-600"
    >
      Mark Best
    </button>
  )}
</div>


                </div>
              );
            })}
        </div>

        {/* Post Answer */}
        <div className="mt-8 bg-white border rounded-xl p-5">
          <textarea
            className="w-full border rounded px-4 py-2"
            rows={4}
            placeholder="Write your answer..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <button
            onClick={submitAnswer}
            className="mt-3 bg-blue-600 text-white px-6 py-2 rounded"
          >
            Post Answer
          </button>
        </div>
      </div>
    </>
  );
}
