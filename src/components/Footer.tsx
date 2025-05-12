'use client';

import { useEffect } from 'react';
import MicrosoftClarity from "@/components/MicrosoftClarity";
import Link from 'next/link';

// 定义 SVG 图标组件
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline-block align-text-bottom text-sky-500 dark:text-sky-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 inline-block align-text-bottom text-green-500 dark:text-green-400">
    <path fillRule="evenodd" d="M4.25 2A1.75 1.75 0 0 0 2.5 3.75v12.5A1.75 1.75 0 0 0 4.25 18h11.5A1.75 1.75 0 0 0 17.5 16.25V3.75A1.75 1.75 0 0 0 15.75 2H4.25ZM5.5 7.75a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm.75 2.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline-block align-text-bottom text-red-400 dark:text-red-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-slate-200 dark:border-slate-700 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <div className="mt-2 space-x-4">
            <Link href="/" className="hover:underline inline-flex items-center">
              <HomeIcon /> 回到首页
            </Link>
            <Link href="/legal/terms" className="hover:underline inline-flex items-center">
              <DocumentIcon /> 服务条款
            </Link>
            <Link href="/legal/privacy" className="hover:underline inline-flex items-center">
              <LockIcon /> 隐私政策
            </Link>
          </div>
          <p className="mt-4">Copyright &copy; {new Date().getFullYear()} 巽川·怀因 All rights reserved.</p>
        </div>
      </div>
      <MicrosoftClarity />
    </footer>
  );
}