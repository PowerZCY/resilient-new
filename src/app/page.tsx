'use client'; // 保持客户端组件标记

import { useState, useEffect } from 'react';
import NicknameFilter from '@/components/NicknameFilter';
import Timeline from '@/components/Timeline';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || 'Zia慢成';

  // 确保组件在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="h-8 w-8 text-blue-600" />
              </motion.div>
              <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                突破消极偏见😎
              </h1>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <p className="text-base font-medium text-[#509863] dark:text-emerald-400">
                每天都有好体验、好事儿、成就 ✔
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NicknameFilter />
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 第一行：热力图(左)和记录今日(右) */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* 左侧 - 热力图 (占据3/4宽度) */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <CalendarHeatmap />
            </div>
          </div>
          
          {/* 右侧 - 记录今日 (占据1/4宽度) */}
          <div className="lg:w-1/4 flex">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col w-full">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span>记录今日</span>
              </h2>
              
              <Link href={`/new?nickname=${encodeURIComponent(nickname)}`} className="mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>添加新记录</span>
                </motion.button>
              </Link>
              
              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p className="mb-2">记录美好时光</p>
                  <p>每一天的点滴都值得铭记</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 第二行：时间轴 */}
        <div className="pt-8">
          <Timeline />
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© 2025 记录生活. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}