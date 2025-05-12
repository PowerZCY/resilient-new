/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RootProvider } from 'fumadocs-ui/provider';
import { HomeLayout, type HomeLayoutProps } from 'fumadocs-ui/layouts/home';
import { Banner } from 'fumadocs-ui/components/banner';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
} from '@clerk/nextjs';
// zh-CN locale is imported as zhCN
import { zhCN } from '@clerk/localizations'
import "@/styles/globals.css";
import BackToTop from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { baseOptions } from './layout.config';
import { homeNavLinks } from './layout.config';
import { NicknameProvider } from '@/context/NicknameContext';
import { auth } from '@clerk/nextjs/server';
import ClerkOrganization from '@/components/ClerkOrganization';
import NProgressBar from '../nProgressBar';

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

function homeOptions(isLoaded: boolean): HomeLayoutProps{
  return {
    ...baseOptions(),
    links: [
      ...homeNavLinks(),
      {
        type: 'custom',
        secondary: false,
        children: <ClerkOrganization isLoaded={isLoaded} />
      }
      ]
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const isLoaded = userId !== null;
  // 在这里添加人工延迟
  // console.log('Starting 5-second delay for testing loading animation...');
  // await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒延迟
  // console.log('Delay finished. Rendering page.');
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
            "bg-linear-to-r from-indigo-500 to-purple-600 text-white border-none hover:opacity-90 transition-opacity",
          socialButtonsBlockButton:
            "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
          socialButtonsBlockButtonText: "font-semibold",
          formButtonReset:
            "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
          membersPageInviteButton:
            "bg-linear-to-r from-indigo-500 to-purple-600 text-white border-none hover:opacity-90 transition-opacity",
          card: "bg-[#fafafa]",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <NProgressBar />
          <NicknameProvider>
            <RootProvider >
              
              <div className="fixed top-0 left-0 w-full z-50">
                <Banner variant="rainbow" changeLayout={false}>
                  <p className="text-xl">每天都有好体验、好事儿、成就 ✔</p>
                </Banner>
              </div>

              <HomeLayout
                {...homeOptions(isLoaded)}
                searchToggle={{
                  enabled: false,
                }}
                className="dark:bg-neutral-950 dark:[--color-fd-background:var(--color-neutral-950)] pt-25"
              >
                {children}
                <Footer />
                <BackToTop />
              </HomeLayout>
            </RootProvider>
          </NicknameProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
