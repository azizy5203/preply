import Link from "next/link";
import { Star, Calendar, Clock, MessageSquare, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

async function getTutor(id: string) {
  const tutor = await prisma.user.findUnique({
    where: { id, role: "TUTOR" },
    include: {
      tutorProfile: {
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
          availability: true,
        },
      },
      reviewsReceived: {
        include: {
          student: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!tutor) return null;

  const ratings = tutor.reviewsReceived.map((r) => r.rating);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

  return {
    ...tutor,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tutor = await getTutor(id);

  if (!tutor) {
    notFound();
  }

  const profile = tutor.tutorProfile!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hussamly
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href="/tutors"
                className="text-gray-700 hover:text-purple-600">
                ← Back
              </Link>
              <Link
                href="/login"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Sign In to Book
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0 overflow-hidden">
                  {tutor.image ? (
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-purple-600">
                      {tutor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {tutor.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {tutor.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({tutor.reviewsReceived.length} reviews)
                      </span>
                    </div>
                    {profile.nationality && (
                      <span className="text-gray-500">
                        📍 {profile.nationality}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.subjects.map((ts) => (
                      <span
                        key={ts.subject.id}
                        className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                        {ts.subject.name}
                      </span>
                    ))}
                  </div>

                  {profile.languages.length > 0 && (
                    <p className="text-gray-600">
                      <span className="font-medium">Languages:</span>{" "}
                      {profile.languages.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Video Section */}
            {profile.introVideoUrl && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Introduction Video
                </h2>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full">
                    <source
                      src={profile.introVideoUrl}
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>
            )}

            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {profile.bio || "No bio available yet."}
              </p>
            </div>

            {/* Teaching Approach */}
            {profile.teachingApproach && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Teaching Approach
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {profile.teachingApproach}
                </p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Student Reviews ({tutor.reviewsReceived.length})
              </h2>

              <div className="space-y-4">
                {tutor.reviewsReceived.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0 overflow-hidden">
                        {review.student.image ? (
                          <img
                            src={review.student.image}
                            alt={review.student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-600 font-semibold">
                            {review.student.name[0]}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {review.student.name}
                          </h4>
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {formatCurrency(profile.hourlyRate)}
                  </div>
                  <div className="text-gray-600">per hour</div>
                </div>

                <Link
                  href="/login"
                  className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition mb-3">
                  Book Trial Lesson
                </Link>

                <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>

                <button className="w-full mt-3 text-gray-600 hover:text-purple-600 transition flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Save to favorites
                </button>
              </div>

              {/* Availability */}
              {profile.availability.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Availability
                  </h3>
                  <div className="space-y-2 text-sm">
                    {profile.availability.slice(0, 5).map((slot) => {
                      const days = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                      ];

                      // Format time from HH:mm:ss to 12-hour format
                      const formatTime = (time: string) => {
                        const [hours, minutes] = time.split(":");
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const displayHour =
                          hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        return `${displayHour}:${minutes} ${ampm}`;
                      };

                      return (
                        <div
                          key={slot.id}
                          className="flex justify-between text-gray-700">
                          <span className="font-medium">
                            {days[slot.dayOfWeek]}
                          </span>
                          <span>
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
