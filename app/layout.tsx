import { Oxanium } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: {
    default: "rollinghunt",
    template: "%s | rollinghunt",
  },
  description: "Rolling Dice Club launch schedule",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${oxanium.variable} bg-paper text-ink antialiased`}>{children}</body>
    </html>
  );
}
