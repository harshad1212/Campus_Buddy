import React, { useEffect, useState } from "react";
import {
  getQuestion,
  postAnswer,
  voteAnswer,
  markBestAnswer,
  editAnswer,
  deleteAnswer,
} from "../../services/forumApi";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, ChevronUp, ChevronDown } from "lucide-react";
import Header from "../Header";

/* ===============================
   Avatar Component
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
      className="rounded-full object-cover border border-blue-100"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold"
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

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  console.log("Current User:", currentUser);

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
    const v = answer.voters.find(
      (x) => x.userId?.toString() === userId.toString()
    );
    return v ? v.vote : 0;
  };

  /* ===============================
     Actions
  =============================== */
  const handleVote = async (answerId, voteValue) => {
    await voteAnswer(id, answerId, voteValue);
    await loadQuestion();
  };

const handleMarkBest = async (answerId) => {
  await markBestAnswer(id, answerId);

  // force fresh DB read
  const fresh = await getQuestion(id);
  setQuestion(fresh.data);
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

  const submitAnswer = async () => {
    if (!answerText.trim()) return;
    const res = await postAnswer(id, answerText);
    setQuestion(res.data);
    setAnswerText("");
  };

  if (!question) return null;

  const isOwner = question.askedBy?._id === currentUser;

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} /> Back to forum
        </button>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              name={question.askedBy?.name}
              src={question.askedBy?.avatarUrl}
            />
            <p className="font-semibold text-gray-800">
              {question.askedBy?.name}
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {question.question}
          </h2>
          <p className="text-gray-600 mt-3 leading-relaxed">
            {question.description}
          </p>
        </div>

        {/* Answers */}
        <h3 className="mt-10 text-lg sm:text-xl font-semibold text-gray-800">
          {question.answers.length} Answers
        </h3>

        <div className="space-y-5 mt-4">
          {question.answers
            .filter((a) => a.userId)
            .sort((a, b) => b.isBestAnswer - a.isBestAnswer)
            .map((a) => {
              const userVote = getUserVote(a, currentUser);
              const canManage =
                a.userId?._id === currentUser;

              return (
                <div
                  key={`${a._id}-${a.isBestAnswer}`}
                  className={`rounded-2xl border p-5 sm:p-6 transition ${
                    a.isBestAnswer
                      ? "border-green-400 bg-green-50"
                      : "border-blue-100 bg-white hover:shadow-sm"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={a.userId?.name}
                        src={a.userId?.avatarUrl}
                        size={34}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {a.userId?.name}
                        </p>
                        {a.isBestAnswer && (
                          <span className="text-green-600 text-sm font-semibold">
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
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === a._id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow">
                            <button
                              onClick={() => startEdit(a)}
                              className="w-full px-4 py-2 text-left hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeAnswer(a._id)}
                              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
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
                        className="w-full mt-4 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />
                      <button
                        onClick={() => saveEdit(a._id)}
                        className="mt-3 bg-blue-600 text-white px-5 py-1.5 rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <p className="mt-4 text-gray-700 leading-relaxed">
                      {a.text}
                    </p>
                  )}

                  {/* Voting */}
                  <div className="flex items-center gap-4 mt-5">
                    <button onClick={() => handleVote(a._id, 1)}>
                      <ChevronUp
                        size={22}
                        className={
                          userVote === 1
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-blue-600"
                        }
                      />
                    </button>

                    <span className="font-semibold text-gray-700">
                      {a.votes}
                    </span>

                    <button onClick={() => handleVote(a._id, -1)}>
                      <ChevronDown
                        size={22}
                        className={
                          userVote === -1
                            ? "text-orange-600"
                            : "text-gray-400 hover:text-orange-600"
                        }
                      />
                    </button>

                        {console.log(question.askedBy?._id, currentUser)}
                    {question.askedBy?._id === currentUser &&
                      !a.isBestAnswer && (
                        <button
                          onClick={() => handleMarkBest(a._id)}
                          className="ml-auto text-green-600 hover:underline"
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
          <div className="mt-10 bg-white border border-blue-100 rounded-2xl p-6">
            <textarea
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Write your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <button
              onClick={submitAnswer}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Post Answer
            </button>
          </div>
        )}
      </div>
    </>
  );
}
