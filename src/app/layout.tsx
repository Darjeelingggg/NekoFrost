import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "NekoFrost - Crispy Chicken, Yuzu Drinks & Fries",
  description: "Website resmi pemesanan NekoFrost. Pesan Boneless Chicken, Minuman Yuzu Nipis Madu, dan Crispy French Fries.",
  icons: {
    icon: [
      { url: "/images/logo.png" },
      { url: "/icon.png" },
    ],
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F1EDE1] text-[#1E2D44] antialiased selection:bg-[#2B5EA9] selection:text-white"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
