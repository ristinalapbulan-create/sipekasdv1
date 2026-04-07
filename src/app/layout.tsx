import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "SIMPEKA SD";
const APP_DESCRIPTION = "Sistem Informasi Monitoring Pelaporan Kegiatan Sekolah Dasar — Disdikbud Kabupaten Tabalong";
const APP_URL = "https://simpeka-5b2c4.web.app";

export const viewport: Viewport = {
  themeColor: "#2D6A4F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} | Monitoring Pelaporan Sekolah Dasar Tabalong`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["simpeka", "disdikbud", "tabalong", "sekolah dasar", "monitoring", "pelaporan", "PEKA"],
  authors: [{ name: "Bidang Pembinaan SD - Disdikbud Tabalong" }],
  generator: "Next.js",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
    startupImage: ["/icon-512.png"],
  },
  formatDetection: { telephone: false },
  // Open Graph
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} | Monitoring Pelaporan Sekolah Dasar Tabalong`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SIMPEKA SD - Disdikbud Tabalong",
        type: "image/png",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | Monitoring Pelaporan SD Tabalong`,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },
  // Icons
  icons: {
    icon: [
      { url: "/icon-96.png",  sizes: "96x96",   type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
    ],
    shortcut: "/icon-96.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <head>
        {/* PWA meta tambahan */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="msapplication-TileColor" content="#2D6A4F" />
        <meta name="msapplication-TileImage" content="/icon-144.png" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <PWAInstallPrompt />

        {/* Security */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
              document.addEventListener('keydown', function(e) {
                if (e.key === 'F12') { e.preventDefault(); }
                if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); }
                if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) { e.preventDefault(); }
              });
            `,
          }}
        />

        {/* PWA Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[PWA] SW registered:', reg.scope); })
                    .catch(function(err) { console.warn('[PWA] SW failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
