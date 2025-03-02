'use client'; // 保持客户端组件标记

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
// 在顶部导入中添加 Home 图标
import { Home, Calendar, Send, X, Plus, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import NicknameFilter from '@/components/NicknameFilter';

// 定义单条记录的接口
interface EntryItem {
  id: string; // 前端临时ID，用于标识
  date: string;
  content: string;
}

// 创建一个包含 useSearchParams 的客户端组件
function NewEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';
  const [entries, setEntries] = useState<EntryItem[]>([
    { id: Date.now().toString(), date: formatDateForInput(new Date()), content: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 添加新的一组数据
  const addNewEntry = () => {
    if (entries.length >= 20) {
      alert('最多只能添加20组数据');
      return;
    }

    setEntries([
      ...entries,
      { id: Date.now().toString(), date: formatDateForInput(new Date()), content: '' }
    ]);
  };

  // 删除一组数据
  const removeEntry = (id: string) => {
    if (entries.length <= 1) {
      return; // 如果只有一组数据，不允许删除
    }

    setEntries(entries.filter(entry => entry.id !== id));
  };

  // 更新某一组数据的日期
  const updateEntryDate = (id: string, newDate: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, date: newDate } : entry
    ));
  };

  // 更新某一组数据的内容
  const updateEntryContent = (id: string, newContent: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, content: newContent } : entry
    ));
  };

  // 检查是否有效的提交
  const isValidSubmit = () => {
    return entries.some(entry => entry.content.trim() !== '');
  };

  // 提交所有数据
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidSubmit()) {
      alert('请至少填写一条记录的内容');
      return;
    }

    setIsSubmitting(true);

    // 过滤掉空内容的条目
    const validEntries = entries.filter(entry => entry.content.trim() !== '');

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          validEntries.map(entry => ({
            nickname,
            content: entry.content,
            date: new Date(entry.date).toISOString(),
          }))
        ),
      });

      if (response.ok) {
        router.push(`/?nickname=${encodeURIComponent(nickname)}`);
      } else {
        console.error('Failed to submit entries');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting entries:', error);
      setIsSubmitting(false);
    }
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
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 mr-4"
                >
                  <Home className="h-6 w-6" />
                </motion.div>
              </Link>
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="h-8 w-8 text-blue-600" />
              </motion.div>
              <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                突破消极偏见♾️
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-[3px] border-violet-500/30 dark:border-violet-400/30 animate-border-pulse"
        >
          {/* 原有内容保持不变 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <h1 className="text-xl font-medium">上报好体验、好事儿、成就</h1>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {entries.length}/20 组
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-slate-700 dark:text-slate-300">
                    体验 #{index + 1}
                  </div>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label htmlFor={`date-${entry.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      日期
                    </label>
                    <input
                      type="date"
                      id={`date-${entry.id}`}
                      value={entry.date}
                      onChange={(e) => updateEntryDate(entry.id, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor={`content-${entry.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      内容
                    </label>
                    <div className="relative">
                      <textarea
                        id={`content-${entry.id}`}
                        value={entry.content}
                        onChange={(e) => updateEntryContent(entry.id, e.target.value)}
                        placeholder="输入好体验、好事儿或成就..."
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                      {entry.content && (
                        <button
                          type="button"
                          onClick={() => updateEntryContent(entry.id, '')}
                          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-right mt-1 text-slate-500 dark:text-slate-400">
                      {entry.content.length} 个字符
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* 添加新记录按钮 */}
            {entries.length < 20 && (
              <motion.button
                type="button"
                onClick={addNewEntry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span>添加新体验</span>
              </motion.button>
            )}

            {/* 提交按钮 */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <motion.button
                type="submit"
                disabled={isSubmitting || !isValidSubmit()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center shadow-sm transition-all ${isSubmitting || !isValidSubmit()
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-md'
                  }`}
              >
                {isSubmitting ? (
                  <span>提交中...</span>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    <span>提交</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

// 主页组件，使用 Suspense 包装 NewEntryContent
export default function NewEntryPage() {
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
      <NewEntryContent />
    </Suspense>
  );
}