import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Home,
  Calendar,
  MessageSquare,
  CreditCard,
  Heart,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isStudent = session.user.role === "STUDENT";
  const isTutor = session.user.role === "TUTOR";

  const studentNav = [
    { href: "/student", label: "Dashboard", icon: Home },
    { href: "/student/lessons", label: "My Lessons", icon: Calendar },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/student/payments", label: "Payments", icon: CreditCard },
    { href: "/student/favorites", label: "Favorites", icon: Heart },
  ];

  const tutorNav = [
    { href: "/tutor", label: "Dashboard", icon: Home },
    { href: "/tutor/bookings", label: "Bookings", icon: Calendar },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/tutor/availability", label: "Availability", icon: Calendar },
    { href: "/tutor/profile", label: "Profile", icon: Home },
  ];

  const navigation = isStudent ? studentNav : isTutor ? tutorNav : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
