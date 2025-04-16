'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { NavigationMenu } from '@/components/NavigationMenu';
import { appConfig } from '@/lib/appConfig';
import Link from 'next/link';

export function LimitHeader() {
  return (
    <header className="bg-gray-50 dark:bg-gray-950 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 改为三栏布局，每栏固定宽度比例 */}
        <div className="grid grid-cols-12 items-center h-16">
          {/* 左侧 Logo 和标题 - 占3列 */}
          <div className="col-span-3">
            <Link href="/" className="flex items-center cursor-pointer group">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 group-hover:scale-110 transition-transform h-7 flex items-center"
              >
                <Sparkles className="h-7 w-7 text-blue-600" />
              </motion.div>
              <h1 className="ml-2.5 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 whitespace-nowrap group-hover:from-blue-500 group-hover:to-violet-500 transition-all m-0">
                突破消极偏见♾️
              </h1>
            </Link>
          </div>

          {/* 中间标语 - 占6列，确保居中 */}
          <div className="col-span-6 hidden md:flex items-center justify-center">
            <p className="text-lg md:text-xl font-bold whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-[#509863] to-teal-500 animate-gradient-x">
              每天都有好体验、好事儿、成就 ✔
            </p>
          </div>

          {/* 右侧导航菜单 - 占3列 */}
          <div className="col-span-3 hidden md:flex justify-end">
            <NavigationMenu items={appConfig.menu} />
          </div>
        </div>
      </div>
    </header>
  );
}