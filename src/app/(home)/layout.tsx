/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@/styles/globals.css";
import { NicknameProvider } from '@/context/NicknameContext';
import { auth } from '@clerk/nextjs/server';
import HomeLayoutClientBoundary from '@/app/(home)/HomeLayoutClientBoundary';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const isClerkLoaded = userId !== null;
  
  return (
    <NicknameProvider>
      <HomeLayoutClientBoundary isClerkLoaded={isClerkLoaded}>
        {children}
      </HomeLayoutClientBoundary>
    </NicknameProvider>
  );
}
