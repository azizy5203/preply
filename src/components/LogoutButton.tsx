"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
      <LogOut className="w-5 h-5" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
