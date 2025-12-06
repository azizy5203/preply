"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BookingActionsProps {
  bookingId: string;
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (status: "CONFIRMED" | "CANCELLED") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update booking");

      toast.success(
        status === "CONFIRMED" ? "Booking confirmed" : "Booking rejected"
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        disabled={loading}
        onClick={() => handleAction("CANCELLED")}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4 mr-1" />
        )}
        Reject
      </Button>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        disabled={loading}
        onClick={() => handleAction("CONFIRMED")}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-1" />
        )}
        Accept
      </Button>
    </div>
  );
}
