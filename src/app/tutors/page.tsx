"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PublicHeader } from "@/components/PublicHeader";

interface TutorWithProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  tutorProfile: {
    hourlyRate: number;
    bio: string | null;
    languages: string[];
    nationality: string | null;
    subjects: Array<{
      subject: {
        id: string;
        name: string;
      };
    }>;
  } | null;
  averageRating: number;
  totalReviews: number;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<TutorWithProfile[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<TutorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    tutors,
    searchQuery,
    minPrice,
    maxPrice,
    selectedLanguage,
    selectedCountry,
    sortBy,
  ]);

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutors/search");
      if (response.ok) {
        const data = await response.json();
        // API returns { tutors: [...], total, page, totalPages }
        const tutorsArray = Array.isArray(data.tutors)
          ? data.tutors
          : Array.isArray(data)
          ? data
          : [];
        setTutors(tutorsArray);
        setFilteredTutors(tutorsArray);
        console.log("Loaded tutors:", tutorsArray.length);
      } else {
        console.error("Failed to fetch tutors");
        setTutors([]);
        setFilteredTutors([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutors:", error);
      setTutors([]);
      setFilteredTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique languages and countries
  const availableLanguages = Array.from(
    new Set(tutors.flatMap((t) => t.tutorProfile?.languages || []))
  ).sort();

  const availableCountries = Array.from(
    new Set(tutors.map((t) => t.tutorProfile?.nationality).filter(Boolean))
  ).sort();

  const applyFilters = () => {
    let filtered = [...tutors];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.tutorProfile?.subjects.some((ts) =>
            ts.subject.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Price filter
    if (minPrice) {
      filtered = filtered.filter(
        (tutor) => (tutor.tutorProfile?.hourlyRate || 0) >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      filtered = filtered.filter(
        (tutor) => (tutor.tutorProfile?.hourlyRate || 0) <= parseFloat(maxPrice)
      );
    }

    // Language filter
    if (selectedLanguage) {
      filtered = filtered.filter((tutor) =>
        tutor.tutorProfile?.languages?.includes(selectedLanguage)
      );
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(
        (tutor) => tutor.tutorProfile?.nationality === selectedCountry
      );
    }

    // Sort
    if (sortBy === "rating") {
      filtered.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === "price-low") {
      filtered.sort(
        (a, b) =>
          (a.tutorProfile?.hourlyRate || 0) - (b.tutorProfile?.hourlyRate || 0)
      );
    } else if (sortBy === "price-high") {
      filtered.sort(
        (a, b) =>
          (b.tutorProfile?.hourlyRate || 0) - (a.tutorProfile?.hourlyRate || 0)
      );
    } else if (sortBy === "reviews") {
      filtered.sort((a, b) => b.totalReviews - a.totalReviews);
    }

    setFilteredTutors(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading tutors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by subject, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per hour
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">All languages</option>
                    {availableLanguages.map((lang) => (
                      <option
                        key={lang}
                        value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">All countries</option>
                    {availableCountries.map((country) => (
                      <option
                        key={country}
                        value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="rating">Highest rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="reviews">Most reviews</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMinPrice("");
                    setMaxPrice("");
                    setSelectedLanguage("");
                    setSelectedCountry("");
                    setSortBy("rating");
                  }}
                  className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          {/* Tutors Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-600">
              {filteredTutors.length} tutor
              {filteredTutors.length !== 1 ? "s" : ""} found
            </div>

            {filteredTutors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No tutors found matching your criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <Link
                    key={tutor.id}
                    href={`/tutors/${tutor.id}`}
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
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition">
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
                        {tutor.tutorProfile?.subjects.slice(0, 2).map((ts) => (
                          <span
                            key={ts.subject.id}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                            {ts.subject.name}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tutor.tutorProfile?.bio ||
                          "Experienced tutor ready to help you learn"}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(tutor.tutorProfile?.hourlyRate || 25)}
                          /hr
                        </span>
                        <span className="text-sm text-purple-600 font-medium">
                          View Profile →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
