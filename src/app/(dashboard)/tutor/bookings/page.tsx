import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { BookingActions } from "@/components/tutor/BookingActions";

async function getTutorBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { tutorId: userId },
    include: {
      student: true,
      payment: true,
    },
    orderBy: { dateTime: "desc" },
  });

  const upcoming = bookings.filter(
    (b) => b.dateTime >= new Date() && b.status !== "CANCELLED"
  );
  const past = bookings.filter(
    (b) => b.dateTime < new Date() || b.status === "COMPLETED"
  );

  return { upcoming, past };
}

export default async function TutorBookingsPage() {
  const session = await auth();
  const { upcoming, past } = await getTutorBookings(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Manage your lesson schedule</p>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Upcoming Lessons
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No upcoming lessons scheduled
          </p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                    {booking.student.image ? (
                      <img
                        src={booking.student.image}
                        alt={booking.student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {booking.student.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {booking.student.name}
                    </h3>
                    <p className="text-gray-600">
                      {booking.duration} minute lesson
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {formatDateTime(booking.dateTime)}
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        <strong>Student notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                      {booking.status}
                    </span>

                    {booking.status === "PENDING" && (
                      <BookingActions bookingId={booking.id} />
                    )}

                    {booking.payment && (
                      <p className="text-xs text-gray-500 mt-2">
                        Payment: {booking.payment.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Past Lessons</h2>

        {past.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No past lessons</p>
        ) : (
          <div className="space-y-4">
            {past.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 opacity-75">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                    {booking.student.image ? (
                      <img
                        src={booking.student.image}
                        alt={booking.student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                        {booking.student.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {booking.student.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {booking.duration} minutes
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(booking.dateTime)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1">
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
