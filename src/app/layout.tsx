import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Preply Clone - Find Your Perfect Tutor",
  description: "Connect with expert tutors for personalized online lessons",
};

import { auth } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
          <Toaster
            position="top-right"
            richColors
          />
        </Providers>
      </body>
    </html>
  );
}
