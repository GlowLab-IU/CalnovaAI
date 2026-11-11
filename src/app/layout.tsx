import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huyền Cơ Các — Tinh Hoa Mệnh Lý & Nhân Tướng Học AI",
  description: "Hệ sinh thái chiêm nghiệm Diện Tướng, Thủ Tướng, Tinh Bàn Tử Vi 12 Cung và Quẻ Bài Cổ Truyền ứng dụng Trí Tuệ Nhân Tạo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${cormorantGaramond.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PWAInstallBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // In development, unregister any active service worker to avoid webpack caching conflicts (ERR_FAILED)
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for (let registration of registrations) {
                        registration.unregister();
                        console.log('ServiceWorker unregistered in development:', registration.scope);
                      }
                    });
                  } else {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      console.log('ServiceWorker registered with scope:', reg.scope);
                    }).catch(function(err) {
                      console.error('ServiceWorker registration failed:', err);
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
