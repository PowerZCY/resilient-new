/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from '@clerk/nextjs';
// zh-CN locale is imported as zhCN
import { zhCN } from '@clerk/localizations'
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WindRun·Huaiin",
  description: "Xunchuan Cao, Huaiin Zheng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="en" className="h-full">
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
            {/* <SignedOut>
              <div className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-full shadow cursor-pointer">
                <SignInButton mode="modal" />
              </div>
              <div className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-full shadow cursor-pointer">
                <SignUpButton mode="modal" />
              </div>
            </SignedOut> */}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </body>
      </html>
    </ClerkProvider>
  );
}
