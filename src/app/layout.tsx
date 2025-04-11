import Providers from "@/components/providers/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CreditsProvider } from "@/contexts/CreditsContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Papermind AI - Your Intelligent Document Assistant",
  description: "Transform your documents into interactive knowledge with AI-powered conversations and insights",
  openGraph: {
    title: "Papermind AI - Your Intelligent Document Assistant",
    description: "Transform your documents into interactive knowledge with AI-powered conversations and insights",
    images: [{
      url: "https://i.ibb.co/PstPy700/Screenshot-2025-04-10-232519.png",
      width: 1200,
      height: 630,
      alt: "Papermind AI Preview"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Papermind AI - Your Intelligent Document Assistant",
    description: "Transform your documents into interactive knowledge with AI-powered conversations and insights",
    images: ["https://i.ibb.co/PstPy700/Screenshot-2025-04-10-232519.png"],
  },
  icons: {
    icon: [
      {
        url: "/icons/favicon.ico",
        sizes: "48x48",
      },
      {
        url: "/icons/papermind-logo-icon.png",
        type: "image/png",
        sizes: "48x48",
      },
      {
        url: "/icons/papermind-logo-icon.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/icons/papermind-logo-icon.png",
        type: "image/png",
        sizes: "144x144",
      }
    ],
    apple: [
      {
        url: "/icons/papermind-logo-icon.png",
        type: "image/png",
      }
    ],
    shortcut: [
      {
        url: "/icons/papermind-logo-icon.png",
        type: "image/png",
        sizes: "196x196",
      }
    ],
  },
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#5D3FD3",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Papermind AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("light", jakarta.variable)}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <CreditsProvider>
            {children}
            <Toaster />
          </CreditsProvider>
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
