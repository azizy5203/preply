import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Heart, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";

async function getStudentData(userId: string) {
  const [upcomingBookings, favoritesCount, paymentsCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        studentId: userId,
        dateTime: { gte: new Date() },
        status: "CONFIRMED",
      },
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
      },
      orderBy: { dateTime: "asc" },
      take: 5,
    }),
    prisma.favorite.count({ where: { studentId: userId } }),
    prisma.payment.count({
      where: {
        booking: {
          studentId: userId,
        },
      },
    }),
  ]);

  return { upcomingBookings, favoritesCount, paymentsCount };
}

export default async function StudentDashboard() {
  const session = await auth();
  const data = await getStudentData(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session!.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your lessons and continue learning
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
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
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Favorite Tutors</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.favoritesCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.paymentsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Lessons</h2>
          <Link
            href="/student/lessons"
            className="text-purple-600 hover:text-purple-700 font-medium">
            View all →
          </Link>
        </div>

        {data.upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming lessons</p>
            <Link
              href="/tutors"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Find a Tutor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition">
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
                  <h3 className="font-semibold text-gray-900">
                    {booking.tutor.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.tutorProfile.subjects[0]?.subject.name} -{" "}
                    {booking.duration} min
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDateTime(booking.dateTime)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <Link
                    href={`/lesson/${booking.id}`}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium inline-block">
                    Join Lesson →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/tutors"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Find More Tutors</h3>
          <p className="text-white/90">
            Explore our community of expert tutors
          </p>
        </Link>

        <Link
          href="/messages"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Message Your Tutors</h3>
          <p className="text-white/90">
            Stay connected with your learning journey
          </p>
        </Link>
      </div>
    </div>
  );
}
