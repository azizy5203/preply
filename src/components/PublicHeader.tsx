"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
}

export function PublicHeader() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setSession(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getDashboardUrl = () => {
    if (!session) return "/login";
    return session.user.role === "TUTOR" ? "/tutor" : "/student";
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hussamly
          </Link>

          <nav className="flex items-center gap-4">
            {!loading && (
              <>
                {session ? (
                  // Logged in state
                  <div className="flex items-center gap-4">
                    <Link
                      href={getDashboardUrl()}
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                      <div className="w-8 h-8 rounded-full bg-purple-100 overflow-hidden">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                            {session.user.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="hidden sm:inline font-medium">
                        {session.user.name}
                      </span>
                    </Link>
                    <Link
                      href={getDashboardUrl()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                      title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  // Not logged in state
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-purple-600 font-medium">
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium">
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
