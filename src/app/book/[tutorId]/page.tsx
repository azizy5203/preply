"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

export default function BookTutorPage({
  params,
}: {
  params: Promise<{ tutorId: string }>;
}) {
  const { tutorId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(60);

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }

    setLoading(true);
    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          dateTime: dateTime.toISOString(),
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const booking = await response.json();
      setStep(2);

      // Auto-confirm payment (mock)
      const paymentResponse = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (paymentResponse.ok) {
        toast.success("Lesson booked successfully!");
        setTimeout(() => router.push("/student"), 2000);
      }
    } catch (error) {
      toast.error("Failed to book lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book a Lesson
          </h1>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-purple-600" : "text-gray-400"
              }`}>
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span>Select Time</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300" />
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-purple-600" : "text-gray-400"
              }`}>
              <div
                className={`w-8 h-8 rounded-full ${
                  step >= 2
                    ? "bg-purple-600 text-white"
                    : "bg-gray-300 text-gray-600"
                } flex items-center justify-center font-semibold`}>
                2
              </div>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Choose Your Lesson Time
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Lesson Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value={30}>30 minutes (Trial)</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-3 border-2 rounded-lg font-medium transition ${
                        selectedTime === time
                          ? "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-gray-200 hover:border-purple-300"
                      }`}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || loading}
              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your lesson has been booked successfully. Payment confirmed
              (Mock).
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This is a demo payment. In production,
                this would integrate with Stripe for real payments.
              </p>
            </div>
            <button
              onClick={() => router.push("/student")}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
