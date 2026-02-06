import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FabriSys | Smart Manufacturing",
  description: "Advanced clothing manufacturing management system",
};

import { ThemeProvider } from "@/components/theme-provider"

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Sidebar, MobileSidebarTrigger } from '@/components/sidebar';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { UserNav } from '@/components/user-nav';
import { LanguageToggle } from '@/components/language-toggle';
import { Toaster } from "@/components/ui/toaster"

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen bg-background">
              {/* Desktop Sidebar (hidden on mobile) */}
              <Sidebar className="hidden md:flex" />
              <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center md:justify-end justify-between border-b px-6 bg-card/50 backdrop-blur-sm z-50">
                  {/* Mobile Trigger (hidden on desktop) */}
                  <MobileSidebarTrigger />

                  <div className="flex items-center gap-4 ms-auto">
                    <LanguageToggle />
                    <ModeToggle />
                    <UserNav />
                  </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
