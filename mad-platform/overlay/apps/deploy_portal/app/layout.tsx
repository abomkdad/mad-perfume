import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MAD Perfume",
    template: "%s",
  },
  description:
    "Customer preview, privacy policy, account deletion, and app support pages for MAD Perfume.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "MAD Perfume",
    description:
      "Customer preview, privacy policy, account deletion, and app support pages for MAD Perfume.",
    images: ["https://www.mad-parfumeur.com/assets/hero/logo2.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
