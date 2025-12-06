"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TutorAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/tutor/availability");
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  };

  const addSlot = (day: number) => {
    setAvailability([
      ...availability,
      { dayOfWeek: day, startTime: "09:00", endTime: "17:00" },
    ]);
  };

  const removeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (
    index: number,
    field: keyof AvailabilitySlot,
    value: any
  ) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tutor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      if (response.ok) {
        toast.success("Availability updated successfully!");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Set Your Availability
        </h1>
        <p className="text-gray-600 mt-2">
          Define when students can book lessons with you
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Weekly Schedule
          </h2>
        </div>

        {/* Days */}
        <div className="space-y-4">
          {DAYS.map((day, dayIndex) => {
            const daySlots = availability.filter(
              (s) => s.dayOfWeek === dayIndex
            );

            return (
              <div
                key={dayIndex}
                className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{day}</h3>
                  <button
                    onClick={() => addSlot(dayIndex)}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Add Time Slot
                  </button>
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">Not available</p>
                ) : (
                  <div className="space-y-2">
                    {availability.map((slot, slotIndex) => {
                      if (slot.dayOfWeek !== dayIndex) return null;

                      return (
                        <div
                          key={slotIndex}
                          className="flex items-center gap-3">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(slotIndex, "startTime", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlot(slotIndex, "endTime", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => removeSlot(slotIndex)}
                            className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setAvailability([])}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
            Clear All
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Students will only be able to book lessons
          during your available time slots. Make sure to keep your availability
          up to date!
        </p>
      </div>
    </div>
  );
}
