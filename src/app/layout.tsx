import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "محك — منصة الأكاديميات التعليمية",
  description: "منصة SaaS لإدارة الأكاديميات التعليمية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${geist.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
