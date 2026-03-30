import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://habit-tracker-production-5168.up.railway.app";

function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("userId", id);
  }
  return id;
}

export const getHabits = (signal) =>
  axios.get(`${API}/habits`, { params: { userId: getUserId() }, signal }).then((r) => r.data);

export const createHabit = (data) =>
  axios.post(`${API}/habits`, { ...data, userId: getUserId() }).then((r) => r.data);

export const deleteHabit = (id) =>
  axios.delete(`${API}/habits/${id}`, { data: { userId: getUserId() } }).then((r) => r.data);

export const completeHabit = (id) =>
  axios.post(`${API}/habits/${id}/complete`, { userId: getUserId() }).then((r) => r.data);

export const getHabitStats = (id) =>
  axios.get(`${API}/habits/${id}/stats`, { params: { userId: getUserId() } }).then((r) => r.data);

export const getGlobalStats = (signal) =>
  axios.get(`${API}/stats`, { params: { userId: getUserId() }, signal }).then((r) => r.data);
