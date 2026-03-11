import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

import { ActiveBatchProvider } from "@/hooks/use-active-batch";

import "./globals.css";

export const metadata: Metadata = {
  title: "Razorbook Reach Intake",
  description: "Mobile-first intake workflow for Razorbook Reach volunteers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ActiveBatchProvider>{children}</ActiveBatchProvider>
      </body>
    </html>
  );
}
