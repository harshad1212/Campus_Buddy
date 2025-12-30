import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api/forum",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getQuestions = () => API.get("/questions");
export const getQuestion = (id) => API.get(`/question/${id}`);
export const askQuestion = (data) => API.post("/question", data);
export const postAnswer = (id, text) =>
  API.post(`/answer/${id}`, { text });
export const voteAnswer = (qId, aId, vote) =>
  API.post(`/vote/${qId}/${aId}`, { vote });
export const markBestAnswer = (qId, aId) =>
  API.post(`/best-answer/${qId}/${aId}`);
export const editAnswer = (questionId, answerId, text) =>
  API.put(`/answer/${questionId}/${answerId}`, { text });

export const deleteAnswer = (questionId, answerId) =>
  API.delete(`/answer/${questionId}/${answerId}`);

