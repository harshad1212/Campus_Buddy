import React, { useEffect,useRef, useState } from "react";
import {
  getQuestion,
  postAnswer,
  voteAnswer,
  markBestAnswer,
  editAnswer,
  deleteAnswer,
} from "../../services/forumApi";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Header from "../Header";

/* ===============================
   Avatar
=============================== */
const Avatar = ({ name, src, size = 40 }) => {
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
      className="rounded-full object-cover border border-white/20"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold"
    >
      {initials}
    </div>
  );
};

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const answerRef = useRef(null);

  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [localVotes, setLocalVotes] = useState({});

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  /* ===============================
     Load
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
    const v = answer.voters.find(
      (x) => x.userId?.toString() === userId.toString()
    );
    return v ? v.vote : 0;
  };

  /* ===============================
     Actions
  =============================== */
  const handleVote = async (answerId, voteValue) => {
  const answer = question.answers.find((a) => a._id === answerId);
  const serverVote = getUserVote(answer, currentUser);
  const localVote = localVotes[answerId] ?? serverVote;

  // 🔁 Same vote clicked → remove color only (NO API CALL)
  if (localVote === voteValue) {
    setLocalVotes((prev) => ({
      ...prev,
      [answerId]: 0,
    }));
    return;
  }

  // ✅ New or switched vote → API call
  setLocalVotes((prev) => ({
    ...prev,
    [answerId]: voteValue,
  }));

  try {
    await voteAnswer(id, answerId, voteValue);
    loadQuestion();
  } catch (err) {
    console.error(err);
  }
};


  const handleMarkBest = async (answerId) => {
    await markBestAnswer(id, answerId);
    const fresh = await getQuestion(id);
    setQuestion(fresh.data);
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) return;
    const res = await postAnswer(id, answerText);
    setQuestion(res.data);
    setAnswerText("");
  };

  const startEdit = (a) => {
    setEditingAnswerId(a._id);
    setEditedText(a.text);
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

  if (!question) return null;

  const isOwner = question.askedBy?._id === currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-200">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6"
        >
          <ArrowLeft size={18} /> Back to forum
        </button>

        {/* Question */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              name={question.askedBy?.name}
              src={question.askedBy?.avatarUrl}
            />
            <p className="font-semibold text-white">
              {question.askedBy?.name}
            </p>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {question.question}
          </h2>

          <p className="mt-4 text-slate-300 leading-relaxed">
            {question.description}
          </p>
        </div>

        {/* Answers */}
        <div className="mt-10 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            {question.answers.length} Answers
          </h3>

          {!isOwner && (
            <button
              onClick={() =>
                answerRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-sm px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/30 transition"
            >
              ✍️ Write an answer
            </button>
          )}
        </div>


        <div className="space-y-6 mt-5">
          {question.answers
            .filter((a) => a.userId)
            .sort((a, b) => b.isBestAnswer - a.isBestAnswer)
            .map((a) => {
            const userVote =
            localVotes[a._id] ?? getUserVote(a, currentUser);
              const canManage = a.userId?._id === currentUser;

              return (
                <div
                  key={a._id}
                  className={`rounded-3xl p-6 border transition ${
                    a.isBestAnswer
                      ? "bg-green-500/10 border-green-400/40"
                      : "bg-white/10 border-white/10 hover:shadow-lg"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={a.userId?.name}
                        src={a.userId?.avatarUrl}
                        size={34}
                      />
                      <div>
                        <p className="font-medium text-white">
                          {a.userId?.name}
                        </p>
                        {a.isBestAnswer && (
                          <span className="text-green-400 text-sm font-semibold">
                            ✔ Accepted Answer
                          </span>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === a._id ? null : a._id
                            )
                          }
                        >
                          <MoreVertical />
                        </button>

                        {openMenuId === a._id && (
                          <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-white/10 rounded-xl shadow">
                            <button
                              onClick={() => startEdit(a)}
                              className="w-full px-4 py-2 text-left hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeAnswer(a._id)}
                              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  {editingAnswerId === a._id ? (
                    <>
                      <textarea
                        className="w-full mt-4 rounded-xl bg-white/10 border border-white/20 p-3 focus:ring-2 focus:ring-indigo-500"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />
                      <button
                        onClick={() => saveEdit(a._id)}
                        className="mt-3 bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-xl"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <p className="mt-4 text-slate-300 leading-relaxed">
                      {a.text}
                    </p>
                  )}

                  {/* Voting */}
                  <div className="flex items-center gap-4 mt-6">
                    <button onClick={() => handleVote(a._id, 1)}>
                      <ChevronUp
                        className={`transition transform ${
                          userVote === 1
                            ? "text-indigo-500 scale-110"
                            : "text-slate-400 hover:text-indigo-400"
                        }`}
                        strokeWidth={2}
                      />

                    </button>

                    <span className="font-semibold">{a.votes}</span>

                    <button onClick={() => handleVote(a._id, -1)}>
                      <ChevronDown
                        className={`transition transform ${
                          userVote === -1
                            ? "text-orange-500 scale-110"
                            : "text-slate-400 hover:text-orange-400"
                        }`}
                        strokeWidth={2}
                      />

                    </button>

                    {question.askedBy?._id === currentUser &&
                      !a.isBestAnswer && (
                        <button
                          onClick={() => handleMarkBest(a._id)}
                          className="ml-auto text-green-400 hover:underline"
                        >
                          Mark Accepted
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Post Answer */}
        {!isOwner && (
          <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <textarea
            ref={answerRef}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Write your answer..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />

            <button
              onClick={submitAnswer}
              className="mt-4 bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-xl"
            >
              Post Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
