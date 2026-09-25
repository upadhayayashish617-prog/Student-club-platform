import React from "react";
import { Calendar, MapPin, Users, Clock, Tag } from "lucide-react";

const EventCard = ({ event, isRegistered, onRegister }) => {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Workshop: "bg-blue-100 text-blue-700",
      Seminar: "bg-green-100 text-green-700",
      Social: "bg-pink-100 text-pink-700",
      Volunteer: "bg-purple-100 text-purple-700",
      Sports: "bg-orange-100 text-orange-700",
      Other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.Other;
  };

  const isDeadlinePassed =
    new Date() > new Date(event.registrationDeadline);
  const isFull = event.availableSlots === 0;
  const canRegister =
    event.status === "Open" && !isDeadlinePassed && !isFull && !isRegistered;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Color bar at top */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryColor(
              event.category
            )}`}
          >
            <Tag className="h-3 w-3 inline mr-1" />
            {event.category}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              event.status === "Open"
                ? "bg-green-100 text-green-700"
                : event.status === "Full"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {event.status}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {event.availableSlots} / {event.capacity} slots available
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              Deadline:{" "}
              {new Date(event.registrationDeadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                event.availableSlots === 0
                  ? "bg-red-500"
                  : event.availableSlots < event.capacity * 0.3
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${
                  ((event.capacity - event.availableSlots) / event.capacity) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {isRegistered ? (
          <div className="w-full py-2.5 px-4 bg-green-50 text-green-700 font-medium rounded-lg text-center text-sm border border-green-200">
            Already Registered
          </div>
        ) : canRegister ? (
          <button
            onClick={onRegister}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors text-sm"
          >
            Register Now
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 bg-gray-100 text-gray-500 font-medium rounded-lg text-center text-sm">
            {isFull
              ? "Event Full"
              : isDeadlinePassed
              ? "Deadline Passed"
              : "Registration Closed"}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
