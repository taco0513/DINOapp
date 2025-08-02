import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NavbarNew as Navbar } from "@/components/layout/NavbarNew";
import { AuthProviders } from "@/lib/auth/providers";
import { TravelDataProvider } from "@/contexts/TravelDataContext";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DINO v2.0 - 디지털 여행 도우미",
  description: "스마트한 여행 계획을 위한 올인원 플랫폼. 비자 요구사항, 샹겐 체류 추적, 여행 가이드를 한 곳에서.",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProviders>
          <TravelDataProvider>
            <ServiceWorkerRegistration />
            <Navbar />
            <Breadcrumb />
            <OfflineIndicator />
            {children}
            <InstallPrompt />
          </TravelDataProvider>
        </AuthProviders>
      </body>
    </html>
  );
}
