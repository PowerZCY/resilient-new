/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client'; // 保持客户端组件标记

import AnimatedCard from '@/components/AnimatedCard';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import { Header } from '@/components/Header';
import { NicknameProvider } from '@/context/NicknameContext';
import { motion } from 'framer-motion';
import { Calendar, PlusCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

// 动态导入Timeline组件，禁用SSR以避免水合不匹配
const Timeline = dynamic(() => import('@/components/Timeline'), {
  ssr: false,
  loading: () => (
    <div className="text-center text-gray-500">加载时间轴中...</div>
  )
});

// 创建一个包含 useSearchParams 的客户端组件
function HomeContent() {
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || 'Zia慢成';
  const [timelineError] = useState<Error | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
            <AnimatedCard>
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span>今日发条</span>
              </h2>

              <Link href={`/new?nickname=${encodeURIComponent(nickname)}`} className="mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  <span>上报体验</span>
                </motion.button>
              </Link>

              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p className="mb-2">记录美好时光</p>
                  <p>作别西去的自我，把头埋低，向东生长</p>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* 第二行：时间轴 */}
        <div className="pt-8">
          {timelineError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h2 className="text-lg font-medium text-red-800">加载时间轴时出现问题</h2>
              <p className="text-red-600">请尝试刷新页面</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                刷新页面
              </button>
            </div>
          ) : (
            <ErrorBoundary fallback={
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h2 className="text-lg font-medium text-red-800">时间轴渲染出错</h2>
                <p className="text-red-600">请尝试刷新页面</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  刷新页面
                </button>
              </div>
            }>
              <Timeline />
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}

// 错误边界组件
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Timeline error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// 主页组件，使用 Suspense 包装 HomeContent
export default function Home() {
  const [mounted, setMounted] = useState(false);

  // 确保组件在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <NicknameProvider>
        <Header />
        <HomeContent />
      </NicknameProvider>
    </Suspense>
  );
}