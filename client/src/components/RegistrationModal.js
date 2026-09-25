import React, { useState, useEffect } from "react";
import { getEvent } from "../services/api";
import { X, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const RegistrationModal = ({ event, onClose, onRegister, isAlreadyRegistered }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Attendee");
  const [selectedVolunteerRole, setSelectedVolunteerRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await getEvent(event._id);
        setEventDetails(res.data.data);
      } catch (err) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [event._id]);

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      await onRegister(
        event._id,
        selectedRole,
        selectedRole === "Volunteer" ? selectedVolunteerRole : null
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading event details...</p>
            </div>
          ) : success ? (
            <div className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">
                Registration Successful!
              </h3>
              <p className="mt-2 text-gray-600">
                You've been registered for {event.title}
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 pr-8">
                  Register for Event
                </h3>
                <p className="text-gray-600 mt-1">{event.title}</p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {isAlreadyRegistered ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">
                    You're already registered for this event!
                  </p>
                </div>
              ) : (
                <>
                  {/* Role Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How would you like to participate?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole("Attendee")}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          selectedRole === "Attendee"
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          Attendee
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Attend and participate
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("Volunteer")}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          selectedRole === "Volunteer"
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          Volunteer
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Help organize the event
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Volunteer Role Selection */}
                  {selectedRole === "Volunteer" &&
                    eventDetails?.volunteerAssignments?.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select a volunteer role
                        </label>
                        <div className="space-y-2">
                          {eventDetails.volunteerAssignments.map(
                            (assignment) => {
                              const available =
                                assignment.slotsNeeded -
                                assignment.assignedUsers.length;
                              return (
                                <button
                                  key={assignment._id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedVolunteerRole(assignment._id)
                                  }
                                  disabled={available === 0}
                                  className={`w-full p-3 border-2 rounded-xl text-left transition-all ${
                                    selectedVolunteerRole === assignment._id
                                      ? "border-purple-600 bg-purple-50"
                                      : available === 0
                                      ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">
                                      {assignment.roleName}
                                    </span>
                                    <span
                                      className={`text-sm ${
                                        available > 0
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {available} slots left
                                    </span>
                                  </div>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                  {/* Event Info Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Available Slots</span>
                        <p className="font-medium text-gray-900">
                          {event.availableSlots}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline</span>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            event.registrationDeadline
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      (selectedRole === "Volunteer" && !selectedVolunteerRole)
                    }
                    className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Registering...</span>
                      </span>
                    ) : (
                      `Register as ${selectedRole}`
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
