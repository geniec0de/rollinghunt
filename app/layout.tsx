import { Oxanium } from "next/font/google";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${oxanium.variable} bg-paper text-ink antialiased`}>{children}</body>
    </html>
  );
}
