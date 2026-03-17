// ============================================================
// SECTION: Root Layout — منصة محك
// الوصف: الـ layout الجذري — RTL + خطوط عربية + CSS Variables
// ============================================================

import type { Metadata } from 'next'
import { Tajawal, Cairo } from 'next/font/google'
import './globals.css'

// ── Sub-section: تحميل الخطوط من Google Fonts ────────────────

const tajawal = Tajawal({
  variable: '--font-tajawal',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
})

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

// ── Sub-section: Metadata ─────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'محك',
    template: '%s | محك',
  },
  description: 'منصة محك — إدارة الأكاديميات الرياضية والتعليمية',
}

// ============================================================
// SECTION: RootLayout Component
// ============================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${cairo.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
