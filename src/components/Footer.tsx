'use client';

import MicrosoftClarity from "@/components/MicrosoftClarity";
import Link from 'next/link';
import { globalLucideIcons as icons } from '@/components/global-icon';

export function Footer() {
  return (
    <footer className="border-t-purple-700/80 border-t-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="mt-2 space-x-4">
            <Link href="/" className="hover:underline inline-flex items-center">
              <icons.HousePlus className="size-4" /> 回到首页
            </Link>
            <Link href="/legal/terms" className="hover:underline inline-flex items-center">
              <icons.ReceiptText className="size-4" /> 服务条款
            </Link>
            <Link href="/legal/privacy" className="hover:underline inline-flex items-center">
              <icons.ShieldUser className="size-4" /> 隐私政策
            </Link>
          </div>
          <p className="mt-4">Copyright &copy; {new Date().getFullYear()} 巽川·怀因 All rights reserved.</p>
        </div>
      </div>
      <MicrosoftClarity />
    </footer>
  );
}