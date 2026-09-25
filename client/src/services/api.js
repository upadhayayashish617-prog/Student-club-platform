import axios from "axios";

// Use REACT_APP_API_URL env var in production, fallback to localhost for dev
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage as fallback (if cookie is blocked)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const logout = () => API.post("/auth/logout");

// ---- Events ----
export const getEvents = (params) => API.get("/events", { params });
export const getEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const getOrganizerEvents = () => API.get("/events/organizer/mine");

// ---- Registrations ----
export const registerForEvent = (eventId) =>
  API.post("/registrations", { eventId });
export const volunteerForEvent = (data) =>
  API.post("/registrations/volunteer", data);
export const cancelRegistration = (eventId) =>
  API.delete(`/registrations/${eventId}`);
export const getMyRegistrations = () => API.get("/registrations/my");
export const getEventRegistrations = (eventId) =>
  API.get(`/registrations/event/${eventId}`);
export const checkIn = (data) => API.post("/registrations/checkin", data);
export const getEventStats = (eventId) =>
  API.get(`/registrations/stats/${eventId}`);

export default API;
