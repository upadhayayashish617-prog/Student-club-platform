import React, { useState, useEffect } from "react";
import {
  getOrganizerEvents,
  createEvent,
  deleteEvent,
  getEventRegistrations,
  checkIn,
  getEventStats,
} from "../services/api";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  ChevronLeft,
  UserCheck,
  Ticket,
} from "lucide-react";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [checkInToken, setCheckInToken] = useState("");
  const [checkInMessage, setCheckInMessage] = useState(null);
  const [activeView, setActiveView] = useState("events"); // events | attendance

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getOrganizerEvents();
      setEvents(res.data.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await createEvent(eventData);
      setShowCreateForm(false);
      fetchEvents();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(eventId);
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const openAttendance = async (event) => {
    setSelectedEvent(event);
    setActiveView("attendance");
    setCheckInToken("");
    setCheckInMessage(null);

    try {
      const [regRes, statsRes] = await Promise.all([
        getEventRegistrations(event._id),
        getEventStats(event._id),
      ]);
      setRegistrations(regRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error("Failed to load attendance data:", err);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInToken.trim()) return;
    setCheckInMessage(null);

    try {
      const res = await checkIn({ ticketToken: checkInToken.trim() });
      setCheckInMessage({
        type: "success",
        text: `Checked in: ${res.data.data.user?.name || "User"}`,
      });
      setCheckInToken("");

      // Refresh registrations and stats
      const [regRes, statsRes] = await Promise.all([
        getEventRegistrations(selectedEvent._id),
        getEventStats(selectedEvent._id),
      ]);
      setRegistrations(regRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setCheckInMessage({
        type: "error",
        text: err.response?.data?.message || "Check-in failed",
      });
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeView === "events" ? "My Events" : "Attendance Tracking"}
          </h1>
          <p className="text-gray-600 mt-1">
            {activeView === "events"
              ? "Create and manage your club events"
              : `Managing: ${selectedEvent?.title}`}
          </p>
        </div>
        <div className="flex space-x-3">
          {activeView === "attendance" && (
            <button
              onClick={() => {
                setActiveView("events");
                setSelectedEvent(null);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Events</span>
            </button>
          )}
          {activeView === "events" && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Events List View */}
      {activeView === "events" && (
        <>
          {showCreateForm && (
            <CreateEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        event.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : event.status === "Full"
                          ? "bg-red-100 text-red-700"
                          : event.status === "Draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {event.status}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {event.availableSlots} / {event.capacity} available
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openAttendance(event)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Manage Attendance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && !showCreateForm && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first event to get started
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          )}
        </>
      )}

      {/* Attendance View */}
      {activeView === "attendance" && selectedEvent && (
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatCard
                icon={<Ticket className="h-5 w-5" />}
                label="Total Registered"
                value={stats.totalRegistered}
                color="indigo"
              />
              <StatCard
                icon={<CheckCircle className="h-5 w-5" />}
                label="Checked In"
                value={stats.totalCheckedIn}
                color="green"
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Remaining Capacity"
                value={stats.remainingCapacity}
                color="yellow"
              />
              <StatCard
                icon={<BarChart3 className="h-5 w-5" />}
                label="Check-in Rate"
                value={
                  stats.totalRegistered > 0
                    ? `${Math.round(
                        (stats.totalCheckedIn / stats.totalRegistered) * 100
                      )}%`
                    : "0%"
                }
                color="purple"
              />
            </div>
          )}

          {/* Check-in Input */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Check-in Student
            </h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={checkInToken}
                onChange={(e) => setCheckInToken(e.target.value)}
                placeholder="Enter or scan ticket token..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono"
                onKeyPress={(e) => e.key === "Enter" && handleCheckIn()}
              />
              <button
                onClick={handleCheckIn}
                disabled={!checkInToken.trim()}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Check In
              </button>
            </div>
            {checkInMessage && (
              <div
                className={`mt-3 flex items-center space-x-2 p-3 rounded-lg ${
                  checkInMessage.type === "success"
                    ? "text-green-700 bg-green-50"
                    : "text-red-700 bg-red-50"
                }`}
              >
                {checkInMessage.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{checkInMessage.text}</span>
              </div>
            )}
          </div>

          {/* Registrations List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Registered Participants ({registrations.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {registrations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No registrations yet
                </div>
              ) : (
                registrations.map((reg) => (
                  <div
                    key={reg._id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {reg.user?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reg.user?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reg.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          reg.role === "Volunteer"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {reg.role}
                      </span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {reg.ticketToken?.slice(0, 8)}...
                      </span>
                      {reg.checkInStatus ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Checked In
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await checkIn({
                                registrationId: reg._id,
                              });
                              // Refresh data
                              const [regRes, statsRes] = await Promise.all([
                                getEventRegistrations(selectedEvent._id),
                                getEventStats(selectedEvent._id),
                              ]);
                              setRegistrations(regRes.data.data);
                              setStats(statsRes.data.data);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Create Event Form Component
const CreateEventForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    capacity: "",
    registrationDeadline: "",
    category: "Other",
    volunteerRoles: [],
  });
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleSlots, setNewRoleSlots] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addVolunteerRole = () => {
    if (!newRoleName.trim() || !newRoleSlots) return;
    setFormData({
      ...formData,
      volunteerRoles: [
        ...formData.volunteerRoles,
        { roleName: newRoleName.trim(), slotsNeeded: parseInt(newRoleSlots) },
      ],
    });
    setNewRoleName("");
    setNewRoleSlots("");
  };

  const removeVolunteerRole = (index) => {
    setFormData({
      ...formData,
      volunteerRoles: formData.volunteerRoles.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        capacity: parseInt(formData.capacity),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create New Event
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Annual Tech Workshop"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Social">Social</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            placeholder="Describe your event..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date & Time *
            </label>
            <input
              type="datetime-local"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Deadline *
            </label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              required
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <input
              type="text"
              name="venue"
              required
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Main Auditorium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              required
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="100"
            />
          </div>
        </div>

        {/* Volunteer Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volunteer Roles (optional)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role name"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
            <input
              type="number"
              min="1"
              value={newRoleSlots}
              onChange={(e) => setNewRoleSlots(e.target.value)}
              placeholder="Slots"
              className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
            <button
              type="button"
              onClick={addVolunteerRole}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          {formData.volunteerRoles.length > 0 && (
            <div className="space-y-2">
              {formData.volunteerRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm text-purple-700">
                    {role.roleName} — {role.slotsNeeded} slots
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVolunteerRole(idx)}
                    className="text-purple-400 hover:text-purple-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizerDashboard;
