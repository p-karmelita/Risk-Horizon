import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import type { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "Risk Horizon",
  description:
    "Risk Horizon helps companies detect supplier and market disruption early by scanning live public web data and turning it into clear, source-backed risk insights."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
