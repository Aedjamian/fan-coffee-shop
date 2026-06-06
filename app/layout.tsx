import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "F.A.N Coffee Shop | Home of Kevin's Homefries",
  description:
    "Coffee, breakfast, and Kevin's famous homefries at 3207 Lawson Blvd, Oceanside, NY. Call 516-536-1444.",
  openGraph: {
    title: "F.A.N Coffee Shop",
    description: "Home of Kevin's Homefries",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.variable}>{children}</body>
    </html>
  );
}
