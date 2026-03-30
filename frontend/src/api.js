import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://habit-tracker-production-5168.up.railway.app";

export const getHabits = () => axios.get(`${API}/habits`).then((r) => r.data);
export const createHabit = (data) => axios.post(`${API}/habits`, data).then((r) => r.data);
export const deleteHabit = (id) => axios.delete(`${API}/habits/${id}`).then((r) => r.data);
export const completeHabit = (id) => axios.post(`${API}/habits/${id}/complete`).then((r) => r.data);
export const getHabitStats = (id) => axios.get(`${API}/habits/${id}/stats`).then((r) => r.data);
export const getGlobalStats = () => axios.get(`${API}/stats`).then((r) => r.data);
