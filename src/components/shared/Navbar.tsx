"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Bell, Menu, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Interface for Notification
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const getDashboardUrl = () => {
    if (!session) return "/login";
    return session.user.role === "TUTOR" ? "/tutor" : "/student";
  };

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-purple-600",
        pathname === href ? "text-purple-600 font-semibold" : "text-gray-600"
      )}>
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hussamly
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="/tutors">Find Tutors</NavLink>
              <NavLink href="/become-tutor">Become a Tutor</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : session ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative">
                      <Bell className="h-5 w-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <span className="font-semibold text-sm">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                          <Check className="h-3 w-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={cn(
                              "flex flex-col items-start gap-1 p-3 cursor-pointer",
                              !notification.isRead && "bg-purple-50"
                            )}>
                            <p
                              className={cn(
                                "text-sm font-semibold", // Added font-semibold for title
                                !notification.isRead && "text-purple-700"
                              )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-400 block mt-1">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}
                            </span>
                            {notification.link && (
                              <Link
                                href={notification.link}
                                className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors w-full"
                                onClick={() => setIsMobileMenuOpen(false)}>
                                {notification.link.includes("lesson")
                                  ? "Join Meeting"
                                  : "View Details"}
                              </Link>
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t text-center">
                        <Link
                          href="/notifications"
                          className="text-xs text-purple-600 hover:underline">
                          See all notifications
                        </Link>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 outline-none">
                      <div className="h-8 w-8 rounded-full bg-purple-100 overflow-hidden border border-purple-200">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-purple-600 font-semibold text-xs">
                            {session.user.name?.[0] || "U"}
                          </div>
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardUrl()}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-purple-600">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white border-t p-4 space-y-4 md:hidden">
          <Link
            href="/tutors"
            className="block text-base font-medium text-gray-700 py-3 border-b border-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}>
            Find Tutors
          </Link>
          <Link
            href="/become-tutor"
            className="block text-base font-medium text-gray-700 py-3 border-b border-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}>
            Become a Tutor
          </Link>
          {!session && (
            <div className="pt-4 space-y-3">
              <Link
                href="/login"
                className="block w-full text-center py-3 border border-gray-300 rounded-lg text-gray-700 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}>
                Log in
              </Link>
              <Link
                href="/register"
                className="block w-full text-center py-3 bg-purple-600 text-white rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
