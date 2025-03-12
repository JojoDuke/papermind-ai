import Providers from "@/components/providers/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Papermind AI - Your Intelligent Document Assistant",
  description: "Transform your PDFs into interactive knowledge with AI-powered conversations and insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={cn("font-sans antialiased", jakarta.variable)}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <NextSSRPlugin
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
