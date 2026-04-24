import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ethiopia Remote Talent - Find Remote Jobs in Ethiopia",
    template: "%s | Ethiopia Remote Talent",
  },
  description:
    "Connect with top Ethiopian talent and find remote opportunities. The premier job board for Ethiopian professionals seeking remote and local positions.",
  keywords: [
    "Ethiopia jobs",
    "remote work Ethiopia",
    "Ethiopian talent",
    "African remote jobs",
    "hire Ethiopian developers",
    "Ethiopian freelancers",
  ],
  authors: [{ name: "Ethiopia Remote Talent" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Ethiopia Remote Talent",
    title: "Ethiopia Remote Talent - Find Remote Jobs in Ethiopia",
    description:
      "Connect with top Ethiopian talent and find remote opportunities.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopia Remote Talent",
    description:
      "Connect with top Ethiopian talent and find remote opportunities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#166534",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} bg-background`}>
        <body className="min-h-screen font-sans antialiased">
          {children}
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
