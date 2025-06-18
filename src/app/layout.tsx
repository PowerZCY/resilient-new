/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RootProvider } from 'fumadocs-ui/provider';
import { Banner } from 'fumadocs-ui/components/banner';
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/styles/globals.css";
import NProgressBar from '@/components/NProgressBar';
import { appConfig } from '@/lib/appConfig';
import { ClerkProviderClient } from '@/components/ClerkProviderClient';
import { cn } from '@/lib/utils';

const montserrat = Montserrat({
  weight: ['400'], // 400 是 Regular
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "WindRun·Huaiin",
  description: "Xunchuan Cao, Huaiin Zheng",
  icons: [
    { rel: "icon", type: 'image/png', sizes: "16x16", url: "/favicon-16x16.png" },
    { rel: "icon", type: 'image/png', sizes: "32x32", url: "/favicon-32x32.png" },
    { rel: "icon", type: 'image/ico', url: "/favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/favicon-180x180.png" },
    { rel: "android-chrome", sizes: "512x512", url: "/favicon-512x512.png" },
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(montserrat.className, 'flex flex-col min-h-screen')}>
        <RootProvider> {/* RootProvider from fumadocs-ui provides theme context */}
          <ClerkProviderClient>
            <NProgressBar />
            <div className="fixed top-0 left-0 w-full z-50">
              <Banner variant="rainbow" changeLayout={false}>
                <p className="text-xl"> {appConfig.style.siteSlogan} </p>
              </Banner>
            </div>
            {children}
          </ClerkProviderClient>
        </RootProvider>
      </body>
    </html>
  );
}
