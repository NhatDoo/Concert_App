"use client";

import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "../src/stores/Provider";
import { Header } from "../src/components/layout/Header";
import { Footer } from "../src/components/layout/Footer";
import { usePathname } from "next/navigation";

const roboto = Roboto({
  variable: "--font-roboto",
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
      lang="vi"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className={`${roboto.className} min-h-full flex flex-col bg-[#f5f2eb] text-[#24231f]`}>
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
