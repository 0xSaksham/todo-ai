import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import localFont from "@next/font/local";

const Noto_Sans_Georgian = localFont({
  src: [
    {
      path: "../public/fonts/NotoSansGeorgian-Regular.ttf",
      weight: "400",
    },
    {
      path: "../public/fonts/NotoSansGeorgian-Bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-noto-sans-georgian",
});

const defaultFont = Noto_Sans_Georgian;

const ORIGIN_URL =
  process.env.NODE === "production"
    ? "https://todovex.ai"
    : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Todo-AI",
  description:
    "Todo-AI seamlessly organizes your tasks and predicts what's nextusing AI.",
  icons: {
    icon: "/icon.ico",
  },
  metadataBase: new URL(ORIGIN_URL),
  alternates: {
    canonical: ORIGIN_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={defaultFont.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
