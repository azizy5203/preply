import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

async function getStudentLessons(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { studentId: userId },
    include: {
      tutor: true,
      tutorProfile: {
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      },
      review: true,
    },
    orderBy: { dateTime: "desc" },
  });

  const upcoming = bookings.filter(
    (b) => b.dateTime >= new Date() && b.status === "CONFIRMED"
  );
  const past = bookings.filter(
    (b) => b.dateTime < new Date() || b.status === "COMPLETED"
  );

  return { upcoming, past };
}

export default async function StudentLessonsPage() {
  const session = await auth();
  const { upcoming, past } = await getStudentLessons(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Lessons</h1>
        <p className="text-gray-600 mt-2">
          View and manage your scheduled lessons
        </p>
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Upcoming Lessons
        </h2>

        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming lessons</p>
            <Link
              href="/tutors"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
              Book a Lesson
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex-shrink-0 overflow-hidden">
                    {booking.tutor.image ? (
                      <img
                        src={booking.tutor.image}
                        alt={booking.tutor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-lg">
                        {booking.tutor.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {booking.tutor.name}
                    </h3>
                    <p className="text-gray-600">
                      {booking.tutorProfile.subjects[0]?.subject.name} •{" "}
                      {booking.duration} minutes
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {formatDateTime(booking.dateTime)}
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium mb-3">
                      {booking.status}
                    </span>
                    <Link
                      href={`/lesson/${booking.id}`}
                      className="block text-sm text-purple-600 hover:text-purple-700 font-medium">
                      Join Lesson →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Lessons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Past Lessons</h2>

        {past.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No past lessons</p>
        ) : (
          <div className="space-y-4">
            {past.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                    {booking.tutor.image ? (
                      <img
                        src={booking.tutor.image}
                        alt={booking.tutor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-lg">
                        {booking.tutor.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {booking.tutor.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {booking.tutorProfile.subjects[0]?.subject.name} •{" "}
                      {booking.duration} minutes
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(booking.dateTime)}
                    </p>
                    {booking.review && (
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(booking.review.rating)].map((_, i) => (
                          <span
                            key={i}
                            className="text-yellow-400">
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-gray-500 ml-2">
                          You rated this lesson
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-2">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
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
