/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { baseOptions } from '@/app/layout.config';
import { Footer } from "@/components/Footer";
import "@/styles/globals.css";
import { HomeLayout, type HomeLayoutProps } from 'fumadocs-ui/layouts/home';


function homeOptions(): HomeLayoutProps{
  return {
    ...baseOptions('#'),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HomeLayout
        {...homeOptions()}
        searchToggle={{
          enabled: true,
        }}
      className="dark:bg-neutral-950 dark:[--color-fd-background:var(--color-neutral-950)] pt-25"
      >
        {children}
        <Footer />
      </HomeLayout>
  );
}
