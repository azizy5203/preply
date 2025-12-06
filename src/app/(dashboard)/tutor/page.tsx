import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DollarSign, Calendar, Users } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

async function getTutorData(userId: string) {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutorProfile) return null;

  const [totalEarnings, upcomingBookings, completedBookings] =
    await Promise.all([
      prisma.payment.aggregate({
        where: {
          booking: {
            tutorId: userId,
            status: "COMPLETED",
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          tutorId: userId,
          dateTime: { gte: new Date() },
          status: "CONFIRMED",
        },
        include: {
          student: true,
        },
        orderBy: { dateTime: "asc" },
        take: 5,
      }),
      prisma.booking.count({
        where: {
          tutorId: userId,
          status: "COMPLETED",
        },
      }),
    ]);

  return {
    tutorProfile,
    totalEarnings: totalEarnings._sum.amount || 0,
    upcomingBookings,
    completedBookings,
  };
}

export default async function TutorDashboard() {
  const session = await auth();
  const data = await getTutorData(session!.user.id);

  if (!data) {
    return <div>Error loading tutor data</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your lessons and grow your teaching business
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Lessons</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.upcomingBookings.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Lessons</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.completedBookings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Upcoming Lessons
        </h2>

        {data.upcomingBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming lessons scheduled
          </div>
        ) : (
          <div className="space-y-4">
            {data.upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {booking.student.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.duration} min lesson
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDateTime(booking.dateTime)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <a
                    href={`/lesson/${booking.id}`}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium inline-block">
                    Join Lesson →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <a
          href="/tutor/profile"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Update Your Profile</h3>
          <p className="text-white/90">
            Keep your profile fresh and attractive to students
          </p>
        </a>

        <a
          href="/tutor/availability"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Set Your Availability</h3>
          <p className="text-white/90">
            Manage when students can book lessons with you
          </p>
        </a>
      </div>
    </div>
  );
}
