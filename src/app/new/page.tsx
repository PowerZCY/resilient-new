'use client'; // 保持客户端组件标记

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Send, X } from 'lucide-react';
import Link from 'next/link';

export default function NewEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';
  const [content, setContent] = useState('');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 确保组件在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname,
          content,
          date: new Date(date).toISOString(),
        }),
      });
      
      if (response.ok) {
        router.push(`/?nickname=${encodeURIComponent(nickname)}`);
      } else {
        console.error('Failed to submit entry');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      setIsSubmitting(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={`/?nickname=${encodeURIComponent(nickname)}`}>
                <motion.div
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="font-medium">返回</span>
                </motion.div>
              </Link>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                突破消极偏见😎
              </div>
              <div className="hidden md:block text-sm text-[#509863] dark:text-emerald-400 mt-1">
                每天都有好体验、好事儿、成就 ✔
              </div>
            </div>
            <div className="w-20"></div> {/* 占位，保持标题居中 */}
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center mb-6">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h1 className="text-xl font-medium">记下今天的好体验、好事儿、成就</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                日期
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                内容
              </label>
              <div className="relative">
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入好体验、好事儿或成就..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                {content && (
                  <button
                    type="button"
                    onClick={() => setContent('')}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="text-xs text-right mt-1 text-slate-500 dark:text-slate-400">
                {content.length} 个字符
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Link href={`/?nickname=${encodeURIComponent(nickname)}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="px-5 py-2 mr-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  取消
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className={`px-5 py-2 rounded-lg text-white flex items-center ${
                  isSubmitting || !content.trim()
                    ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-md'
                } transition-all`}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? '提交中...' : '提交记录'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}