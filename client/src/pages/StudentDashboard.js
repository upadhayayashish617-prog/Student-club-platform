import React, { useState, useEffect } from "react";
import { getEvents, registerForEvent, volunteerForEvent, getMyRegistrations } from "../services/api";
import EventCard from "../components/EventCard";
import RegistrationModal from "../components/RegistrationModal";
import { Search, Filter, Calendar, Loader2 } from "lucide-react";

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("discover");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, registrationsRes] = await Promise.all([
        getEvents({ status: "Open" }),
        getMyRegistrations(),
      ]);
      setEvents(eventsRes.data.data);
      setMyRegistrations(registrationsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const registeredEventIds = myRegistrations.map((r) => r.event?._id || r.event);

  const handleRegister = async (eventId, role, volunteerAssignmentId) => {
    try {
      if (role === "Volunteer" && volunteerAssignmentId) {
        await volunteerForEvent({
          eventId,
          volunteerAssignmentId,
        });
      } else {
        await registerForEvent(eventId);
      }
      setSelectedEvent(null);
      fetchData(); // Refresh data
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
        <p className="text-gray-600 mt-1">
          Find and register for upcoming club events
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("discover")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "discover"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Discover</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("my-events")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "my-events"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>My Events ({myRegistrations.length})</span>
          </div>
        </button>
      </div>

      {activeTab === "discover" && (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="">All Categories</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Social">Social</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={registeredEventIds.includes(event._id)}
                onRegister={() => setSelectedEvent(event)}
              />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No events found</p>
            </div>
          )}
        </>
      )}

      {activeTab === "my-events" && (
        <div className="space-y-4">
          {myRegistrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                You haven't registered for any events yet
              </p>
              <button
                onClick={() => setActiveTab("discover")}
                className="mt-4 text-indigo-600 font-medium hover:underline"
              >
                Browse events
              </button>
            </div>
          ) : (
            myRegistrations.map((reg) => (
              <div
                key={reg._id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reg.event?.title || "Event"}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {reg.event?.date
                        ? new Date(reg.event.date).toLocaleDateString()
                        : "Date TBD"}{" "}
                      • {reg.event?.venue || "Venue TBD"}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reg.role === "Volunteer"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {reg.role}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reg.checkInStatus
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {reg.checkInStatus ? "Checked In" : "Not Checked In"}
                      </span>
                    </div>
                  </div>
                  {reg.ticketToken && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Check-in Token</p>
                      <p className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        {reg.ticketToken.slice(0, 8)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          isAlreadyRegistered={registeredEventIds.includes(selectedEvent._id)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
