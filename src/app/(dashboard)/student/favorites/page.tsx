import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { studentId: userId },
    include: {
      tutor: {
        include: {
          tutorProfile: {
            include: {
              subjects: {
                include: {
                  subject: true,
                },
              },
            },
          },
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  return favorites.map((fav) => {
    const ratings = fav.tutor.reviewsReceived.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    return {
      ...fav,
      tutor: {
        ...fav.tutor,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratings.length,
      },
    };
  });
}

export default async function StudentFavoritesPage() {
  const session = await auth();
  const favorites = await getFavorites(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Favorite Tutors</h1>
        <p className="text-gray-600 mt-2">
          Quick access to your favorite tutors
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding tutors to your favorites to easily find them later
          </p>
          <Link
            href="/tutors"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
            Browse Tutors
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const tutor = favorite.tutor;
            const profile = tutor.tutorProfile!;

            return (
              <div
                key={favorite.tutorId}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                  {tutor.image ? (
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-purple-600">
                      {tutor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {tutor.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {tutor.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({tutor.totalReviews} reviews)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.subjects.slice(0, 2).map((ts) => (
                      <span
                        key={ts.subject.id}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                        {ts.subject.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {profile.bio || "Experienced tutor ready to help you learn"}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(profile.hourlyRate)}/hr
                    </span>
                    <Link
                      href={`/tutors/${tutor.id}`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
