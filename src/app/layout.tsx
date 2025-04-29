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
} from '@clerk/nextjs';
// zh-CN locale is imported as zhCN
import { zhCN } from '@clerk/localizations'
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

// https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts#L492
// https://clerk.com/docs/customization/localization

const customLocalization = {
  // Use the default zhCN localization
  ...zhCN,
  // Override specific fields here
  formFieldInputPlaceholder__emailAddress: '请输入邮箱地址',
  formFieldInputPlaceholder__emailAddress_username: '请输入邮箱或用户名',
  signIn: {
    start: {
      actionLink__join_waitlist: '加入候选列表',
      actionText__join_waitlist: '想要提前接入？',
      subtitle: '欢迎回来！请登录',
      title: '登录·{{applicationName}}·',
    }
  },
  waitlist: {
    start: {
      actionLink: '登录',
      actionText: '已经注册？',
      formButton: '加入候选列表',
      subtitle: '输入你的邮箱地址，我们会尽快通知你',
      title: '加入候选列表',
    },
    success: {
      message: '你将被重定向...',
      subtitle: '我们会尽快通知你',
      title: '感谢加入候选列表！',
    },
  }
}

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      localization={customLocalization}
      waitlistUrl="/waitlist"
      appearance={{
        variables: { 
          colorPrimary: "#6366F1",
        },
        elements: {
          formButtonPrimary:
            "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none hover:opacity-90 transition-opacity",
          socialButtonsBlockButton:
            "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
          socialButtonsBlockButtonText: "font-semibold",
          formButtonReset:
            "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
          membersPageInviteButton:
            "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none hover:opacity-90 transition-opacity",
          card: "bg-[#fafafa]",
        },
      }}
    >
      <html lang="en" className="h-full">
        <body className={`${inter.className} flex flex-col min-h-screen`}>
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
