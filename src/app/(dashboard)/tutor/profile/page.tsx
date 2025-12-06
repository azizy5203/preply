"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Video } from "lucide-react";
import { uploadVideo } from "@/lib/supabase";

export default function TutorProfilePage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    bio: "",
    hourlyRate: 25,
    languages: [] as string[],
    nationality: "",
    teachingApproach: "",
    introVideoUrl: "",
    yearsOfExperience: 0,
  });

  const [languageInput, setLanguageInput] = useState("");

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be smaller than 50MB");
      return;
    }

    setUploading(true);
    try {
      const path = `${Date.now()}_${file.name}`;
      const url = await uploadVideo(file, path);
      setProfile({ ...profile, introVideoUrl: url });
      toast.success("Video uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const addLanguage = () => {
    if (
      languageInput.trim() &&
      !profile.languages.includes(languageInput.trim())
    ) {
      setProfile({
        ...profile,
        languages: [...profile.languages, languageInput.trim()],
      });
      setLanguageInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((l) => l !== lang),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tutors/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Update your tutor profile to attract more students
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Intro Video */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Video className="inline w-4 h-4 mr-2" />
            Introduction Video
          </label>
          {profile.introVideoUrl ? (
            <div className="space-y-3">
              <video
                src={profile.introVideoUrl}
                controls
                className="w-full max-w-md rounded-lg"
              />
              <button
                onClick={() => setProfile({ ...profile, introVideoUrl: "" })}
                className="text-sm text-red-600 hover:text-red-700">
                Remove video
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">
                Upload your introduction video
              </p>
              <label className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-purple-700">
                {uploading ? "Uploading..." : "Choose Video"}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Max size: 50MB</p>
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Me
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Tell students about yourself, your experience, and what makes you a great tutor..."
          />
        </div>

        {/* Teaching Approach */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teaching Approach
          </label>
          <textarea
            value={profile.teachingApproach}
            onChange={(e) =>
              setProfile({ ...profile, teachingApproach: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Describe your teaching methodology and style..."
          />
        </div>

        {/* Hourly Rate */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (USD)
            </label>
            <input
              type="number"
              value={profile.hourlyRate}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  hourlyRate: parseFloat(e.target.value),
                })
              }
              min="5"
              max="500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              value={profile.yearsOfExperience}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  yearsOfExperience: parseInt(e.target.value),
                })
              }
              min="0"
              max="50"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nationality
          </label>
          <input
            type="text"
            value={profile.nationality}
            onChange={(e) =>
              setProfile({ ...profile, nationality: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="e.g., United States"
          />
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages I Speak
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addLanguage())
              }
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Add a language"
            />
            <button
              onClick={addLanguage}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {lang}
                <button
                  onClick={() => removeLanguage(lang)}
                  className="hover:text-purple-900">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
