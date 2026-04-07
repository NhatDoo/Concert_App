"use client";

import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "../src/stores/Provider";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";
import { usePathname } from "next/navigation";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith('/vendor') || pathname?.startsWith('/staff');

  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className={`${outfit.className} min-h-full flex flex-col bg-slate-50 text-gray-900`}>
        <Providers>
          {!isDashboardRoute && <Header />}
          <main className="flex-grow">
            {children}
          </main>
          {!isDashboardRoute && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
