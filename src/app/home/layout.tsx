import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./home-landing.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Averox Time Track — Know Every Minute",
  description:
    "Employee productivity and time tracking for modern teams. Automatic activity tracking, productivity analytics, and actionable reports.",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${dmSans.variable} ${plusJakarta.variable}`}>
      {children}
    </div>
  );
}
