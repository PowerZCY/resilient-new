'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { NavigationMenu } from '@/components/NavigationMenu';
import NicknameFilter from '@/components/NicknameFilter';
import { appConfig } from '@/lib/appConfig';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧 Logo 和标题 - 添加点击回到首页功能 */}
          <Link href="/" className="flex items-center cursor-pointer group">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 group-hover:scale-110 transition-transform"
            >
              <Sparkles className="h-7 w-7 text-blue-600" />
            </motion.div>
            <h1 className="ml-2.5 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 whitespace-nowrap group-hover:from-blue-500 group-hover:to-violet-500 transition-all">
              突破消极偏见♾️
            </h1>
          </Link>

          {/* 左侧导航菜单 */}
          <div className="hidden md:flex md:ml-8">
            <NavigationMenu items={appConfig.menu} />
          </div>

          {/* 中间标语 */}
          <div className="hidden md:flex flex-1 items-center justify-center mx-2 lg:mx-4 overflow-hidden">
            <p className="text-sm lg:text-lg xl:text-xl font-bold whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-[#509863] to-teal-500 animate-gradient-x truncate">
              每天都有好体验、好事儿、成就 ✔
            </p>
          </div>

          {/* 右侧用户筛选器 */}
          <div className="flex items-center">
            <NicknameFilter />
          </div>
        </div>
      </div>
    </header>
  );
}