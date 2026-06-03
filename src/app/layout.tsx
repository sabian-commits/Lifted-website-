import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifted · See · Grow · Multiply",
  description:
    "First Impressions Ministry platform for Lifted Church. People stay where they can grow.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lifted",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c6b4c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
