'use client';

import React from 'react';
import { HomeLayout, type HomeLayoutProps } from 'fumadocs-ui/layouts/home';
import { baseOptions, injectGithubLink } from '@/app/layout.config';
import { useNickname } from '@/context/NicknameContext';
import ClerkOrganization from '@/components/ClerkOrganization';
import NicknameFilter from '@/components/NicknameFilter';
import { appConfig } from '@/lib/appConfig';
import { Footer } from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

// 此函数现在在此客户端组件内部或可被其调用
function getHomeLayoutProps(
  isClerkLoaded: boolean,
  nicknameFromContext: string,
  isNicknameReady: boolean
): HomeLayoutProps {
  const defaultNickname = appConfig.clerk.user[0].name;
  // 如果 nickname 已初始化，则使用它；否则，使用默认昵称构建链接
  // 这确保了即使在从异步源完全解析 nickname 之前，链接也能正确形成
  const effectiveNickname = isNicknameReady ? nicknameFromContext : defaultNickname;


  // 在这里添加人工延迟
  // console.log('Starting 5-second delay for testing loading animation...');
  // await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒延迟
  // console.log('Delay finished. Rendering page.');

  return {
    ...baseOptions(`/?nickname=${effectiveNickname}`),
    links: [
      ...injectGithubLink(),
      {
        type: 'custom',
        secondary: true,
        // NicknameFilter 假设在其内部也使用了 useNickname
        children: <NicknameFilter />
      },
      {
        type: 'custom',
        secondary: true,
        children: <ClerkOrganization isLoaded={isClerkLoaded} />
      }
    ]
  };
}

export default function HomeLayoutClientBoundary({
  children,
  isClerkLoaded, // 从服务器组件传递的 prop
}: Readonly<{
  children: React.ReactNode;
  isClerkLoaded: boolean;
}>) {
  const { nickname, isNicknameInitialized } = useNickname();

  // 当 isNicknameInitialized 为 false 时，可以考虑渲染加载状态或简化布局
  // 以避免 UI 闪烁或在 nickname 未正确初始化时生成不正确的链接。
  // 目前，getHomeLayoutProps 会处理回退情况。
  // if (!isNicknameInitialized) {
  //   console.log("HomeLayoutClientBoundary: Nickname not yet initialized. Using default for options.");
  // }

  const homeLayoutProps = getHomeLayoutProps(isClerkLoaded, nickname, isNicknameInitialized);

  return (
    <HomeLayout
      {...homeLayoutProps}
      searchToggle={{
        enabled: false,
      }}
      className="dark:bg-neutral-950 dark:[--color-fd-background:var(--color-neutral-950)] pt-25"
    >
      {children}
      <Footer />
      <BackToTop />
    </HomeLayout>
  );
} 