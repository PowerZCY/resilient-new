/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useInView } from 'react-intersection-observer';

interface Entry {
  id: string;
  date: string;
  content: string;
}

interface ApiResponse {
  entries: Entry[];
  total: number;
}

// 首先添加骨架组件
// 骨架组件优化
const TimelineSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="relative pl-8 pb-8">
          {/* 骨架圆点 - 增加大小和发光效果 */}
          <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-violet-200 dark:bg-violet-700 shadow-[0_0_12px_rgba(139,92,246,0.3)]"></div>

          {/* 骨架连接线 - 渐变效果 */}
          <div className="absolute left-[10px] top-[40px] w-[2px] h-[calc(100%-48px)] bg-gradient-to-b from-violet-200 via-violet-300 to-violet-200 dark:from-violet-700 dark:via-violet-600 dark:to-violet-700"></div>

          {/* 骨架日期 - 更窄的宽度 */}
          <div className="mb-2 h-4 w-32 bg-violet-100 dark:bg-violet-800 rounded-full"></div>

          {/* 骨架内容卡片 - 增加层次感 */}
          <div className="p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-violet-100 dark:border-violet-800">
            <div className="space-y-4">
              <div className="h-4 bg-violet-50 dark:bg-violet-900/50 rounded-full w-full"></div>
              <div className="h-4 bg-violet-50 dark:bg-violet-900/50 rounded-full w-4/5"></div>
              <div className="h-4 bg-violet-50 dark:bg-violet-900/50 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 格式化日期函数
const formatDate = (dateString: string): string => {
  const date: Date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 格式化内容函数
const formatContent = (content: string): JSX.Element => {
  return (
    <div className="whitespace-pre-wrap break-words text-gray-700">
      {content.split(/\r\n|\n|\r/).map((line: string, index: number) => (
        <span key={index}>
          {line}
          {index < content.split(/\r\n|\n|\r/).length - 1 && <br />}
        </span>
      ))}
    </div>
  );
};

// 动画变体定义
const timelineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      // 限制最大延迟为0.3秒，避免延迟累加问题
      delay: Math.min(i, 3) * 0.1,
      duration: 0.4, // 稍微缩短动画时间
      ease: "easeOut"
    }
  })
};

// 圆点动画变体
const circleVariants = {
  initial: {
    scale: 1,
    backgroundColor: "#509863",
    boxShadow: "0 0 0 4px rgba(80, 152, 99, 0.2)"
  },
  hover: {
    scale: 1.2,
    backgroundColor: "#8B5CF6",
    boxShadow: "0 0 0 8px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.5)",
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// 内容卡片动画变体
const cardVariants = {
  initial: {
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255, 255, 255, 1)"
  },
  hover: {
    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)",
    backgroundColor: "rgba(249, 250, 251, 1)",
    transition: {
      duration: 0.3
    }
  }
};

// 日期动画变体
const dateVariants = {
  initial: {
    color: "#6b7280"
  },
  hover: {
    color: "#8B5CF6",
    transition: {
      duration: 0.3
    }
  }
};

// 气泡动画变体
const bubbleVariants = {
  initial: {
    scale: 0,
    opacity: 0
  },
  animate: (custom: number) => ({
    scale: [0, 1.2, 1],
    opacity: [0, 0.7, 1],
    transition: {
      // 限制最大延迟
      delay: Math.min(custom, 3) * 0.05,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

// 气泡浮动动画 - 修改为有限次数的动画，不再使用Infinity
const floatingBubbleVariants = {
  initial: { y: 0 },
  animate: (custom: number) => ({
    y: [0, -3, 0, 3, 0],
    transition: {
      // 限制最大延迟
      delay: Math.min(custom, 3) * 0.1,
      duration: 2,
      // 将无限循环改为有限次数，最多重复3次
      repeat: 3,
      repeatType: "mirror" as const,
      ease: "easeInOut"
    }
  })
};

// 进度指示器组件
const ProgressIndicator = React.memo(({ 
  loadedCount, 
  totalCount,
  activeEntryIndex // 添加当前选中条目的索引参数
}: { 
  loadedCount: number, 
  totalCount: number,
  activeEntryIndex: number | null // 当前选中条目的索引，如果没有选中则为null
}) => {
  // 计算加载百分比
  const percentage = Math.min(100, Math.round((loadedCount / totalCount) * 100)) || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50"
    >
      <div className="relative flex items-center justify-center">
        {/* 外圆 */}
        <motion.div 
          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 0 rgba(139, 92, 246, 0.2)",
              "0 0 20px rgba(139, 92, 246, 0.4)",
              "0 0 0 rgba(139, 92, 246, 0.2)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        >
          {/* 内圆 - 进度指示 */}
          <motion.div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-medium"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-lg font-bold">{loadedCount}/{totalCount}</div>
              <div className="text-sm opacity-90">{percentage}%</div>
              
              {/* 当前选中条目指示器 */}
              {activeEntryIndex !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full"
                >
                  <span className="font-bold text-yellow-300">#{activeEntryIndex + 1}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        {/* 提示文本 - 悬停时显示 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-md text-sm whitespace-nowrap"
        >
          <div>已加载 {loadedCount} / 共 {totalCount} 条</div>
          {activeEntryIndex !== null && (
            <div className="mt-1 text-yellow-500 dark:text-yellow-400">
              当前查看: 第 {activeEntryIndex + 1} 条
            </div>
          )}
        </motion.div>
        
        {/* 当前位置指示线 - 只在有选中条目时显示 */}
        {activeEntryIndex !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: `${Math.min(100, (activeEntryIndex + 1) / totalCount * 100)}%` 
            }}
            transition={{ duration: 0.5 }}
            className="absolute left-[-30px] bottom-0 w-1 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-full"
            style={{ 
              transformOrigin: 'bottom',
              boxShadow: '0 0 8px rgba(234, 179, 8, 0.5)'
            }}
          />
        )}
      </div>
    </motion.div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// 使用React.memo创建记忆化的TimelineItem组件
const TimelineItem = React.memo(({ 
  entry, 
  index, 
  isActive, 
  totalEntries,
  onHoverStart, 
  onHoverEnd 
}: { 
  entry: Entry, 
  index: number, 
  isActive: boolean, 
  totalEntries: number,
  onHoverStart: () => void, 
  onHoverEnd: () => void 
}) => {
  // 使用useInView检测条目是否在视口中
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '100px 0px'
  });

  // 计算相对索引，用于动画延迟
  const relativeIndex = index % 10;
  
  // 简化渲染 - 只有在视口中的条目才应用完整动画
  const shouldAnimate = inView;
  
  return (
    <motion.div
      ref={ref}
      className="relative pl-8 pb-8"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={relativeIndex}
      variants={timelineVariants}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {/* 主圆点 */}
      <motion.div
        className="absolute left-0 top-2 w-5 h-5 rounded-full z-10"
        initial="initial"
        animate={isActive && inView ? "hover" : "initial"}
        variants={circleVariants}
        whileHover={{ scale: 1.3 }}
      ></motion.div>

      {/* 连接前一个条目的气泡链 - 简化渲染逻辑 */}
      {index > 0 && shouldAnimate && (
        <div className="absolute left-[10px] top-[-30px] h-[40px] flex flex-col justify-between items-center">
          {/* 限制气泡数量为最多3个 */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`bubble-up-${i}`}
              className="w-[6px] h-[6px] rounded-full"
              initial="initial"
              animate={isActive ? "animate" : "initial"}
              variants={{
                initial: bubbleVariants.initial,
                animate: bubbleVariants.animate(3 - i)
              }}
              style={{
                opacity: isActive ? 1 : 0.5,
                backgroundColor: isActive ? "#8B5CF6" : "#94a3b8",
                boxShadow: isActive ? "0 0 4px rgba(139, 92, 246, 0.5)" : "none"
              }}
            >
              {/* 气泡内部发光效果 - 只在激活状态显示 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: ["0 0 0px rgba(139, 92, 246, 0.3)", "0 0 8px rgba(139, 92, 246, 0.6)", "0 0 0px rgba(139, 92, 246, 0.3)"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: 2,
                    repeatType: "mirror",
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 连接下一个条目的气泡链 - 简化渲染逻辑 */}
      {index < totalEntries - 1 && shouldAnimate && (
        <div className="absolute left-[10px] top-[40px] h-[calc(100%-48px)] flex flex-col justify-between items-center">
          {/* 限制气泡数量为固定的5个 */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`bubble-down-${i}`}
              className="w-[6px] h-[6px] rounded-full"
              initial="initial"
              animate={isActive ? ["animate", "floating"] : "initial"}
              variants={{
                initial: bubbleVariants.initial,
                animate: bubbleVariants.animate(i),
                floating: floatingBubbleVariants.animate(i)
              }}
              style={{
                opacity: isActive ? 1 : 0.5,
                backgroundColor: isActive ? "#8B5CF6" : "#94a3b8",
                boxShadow: isActive ? "0 0 4px rgba(139, 92, 246, 0.5)" : "none"
              }}
            >
              {/* 气泡内部发光效果 - 只在激活状态显示 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: ["0 0 0px rgba(139, 92, 246, 0.3)", "0 0 8px rgba(139, 92, 246, 0.6)", "0 0 0px rgba(139, 92, 246, 0.3)"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: 2,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 日期 */}
      <motion.div
        className="mb-2 text-sm font-semibold text-gray-500"
        initial="initial"
        animate={isActive && inView ? "hover" : "initial"}
        variants={dateVariants}
      >
        {formatDate(entry.date)}
      </motion.div>

      {/* 内容卡片 */}
      <motion.div
        className="p-4 rounded-lg shadow"
        initial="initial"
        animate={isActive && inView ? "hover" : "initial"}
        variants={cardVariants}
        whileHover={{
          y: -5,
          transition: { duration: 0.3 }
        }}
      >
        {formatContent(entry.content)}
      </motion.div>
    </motion.div>
  );
});

// 确保组件名称在React DevTools中显示
TimelineItem.displayName = 'TimelineItem';

// 创建一个虚拟化的时间轴容器组件
const VirtualizedTimeline = React.memo(({ 
  entries, 
  activeEntryId, 
  setActiveEntryId,
  clearActiveEntry
}: { 
  entries: Entry[], 
  activeEntryId: string | null, 
  setActiveEntryId: (id: string, index: number) => void,
  clearActiveEntry: () => void
}) => {
  // 使用分段渲染的方式实现虚拟化
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 监听滚动事件，更新可见范围
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // 估算每个条目的平均高度
      const estimatedItemHeight = 250; // 像素
      
      // 计算可见范围内的条目索引
      const visibleItemsCount = Math.ceil(viewportHeight / estimatedItemHeight) + 4; // 额外缓冲
      const startIndex = Math.max(0, Math.floor(scrollTop / estimatedItemHeight) - 2); // 提前2个
      const endIndex = Math.min(entries.length, startIndex + visibleItemsCount);
      
      setVisibleRange({ start: startIndex, end: endIndex });
    };
    
    // 初始计算
    handleScroll();
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [entries.length]);
  
  // 渲染占位符，保持滚动高度
  const totalHeight = entries.length * 250; // 估算总高度
  const visibleItems = entries.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div ref={containerRef} style={{ position: 'relative', height: totalHeight }}>
      <div style={{ position: 'absolute', top: visibleRange.start * 250, width: '100%' }}>
        {visibleItems.map((entry, localIndex) => {
          const globalIndex = visibleRange.start + localIndex;
          return (
            <TimelineItem
              key={entry.id}
              entry={entry}
              index={globalIndex}
              isActive={activeEntryId === entry.id}
              totalEntries={entries.length}
              onHoverStart={() => setActiveEntryId(entry.id, globalIndex)}
              onHoverEnd={clearActiveEntry}
            />
          );
        })}
      </div>
    </div>
  );
});

VirtualizedTimeline.displayName = 'VirtualizedTimeline';

export default function Timeline(): JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeEntryIndex, setActiveEntryIndex] = useState<number | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const nickname: string | null = searchParams.get('nickname');
  const limit: number = 20;
  const observerInstance = useRef<IntersectionObserver | null>(null);
  const loadedPages = useRef<Set<number>>(new Set([1]));
  const isLoadingRef = useRef<boolean>(false);
  const initialLoadDone = useRef<boolean>(false);
  const currentPageRef = useRef<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  const fetchEntries = useCallback(
    async (pageNum: number): Promise<void> => {
      if (!nickname || isLoadingRef.current || loadedPages.current.has(pageNum)) {
        console.log(`跳过请求: page=${pageNum}, nickname=${nickname}, 原因: ${!nickname ? '无昵称' : isLoadingRef.current ? '正在加载中' : '页面已加载'}`);
        return;
      }

      console.log(`获取数据: page=${pageNum}, nickname=${nickname}`);
      isLoadingRef.current = true;
      setLoading(true);

      try {
        const res: Response = await fetch(
          `/api/entries?nickname=${encodeURIComponent(nickname)}&page=${pageNum}&limit=${limit}`
        );

        if (!res.ok) {
          throw new Error(`请求失败: ${res.status}`);
        }

        const data: ApiResponse = await res.json();
        console.log(`获取到数据: page=${pageNum}, 条目数=${data.entries.length}, 总数=${data.total}`);

        const newEntries: Entry[] = data.entries || [];
        const total: number = data.total || 0;
        
        // 更新总条数
        setTotalCount(total);
        
        // 显示进度指示器
        setShowProgress(true);

        setEntries((prev: Entry[]): Entry[] => {
          const combined: Entry[] = [...prev, ...newEntries];
          const uniqueEntries: Entry[] = [
            ...new Map(combined.map((entry: Entry) => [entry.id, entry] as const)).values(),
          ];
          return uniqueEntries;
        });

        loadedPages.current.add(pageNum);
        const hasMoreData = pageNum * limit < total;
        setHasMore(hasMoreData);

        if (pageNum === 1) {
          initialLoadDone.current = true;
        }

        if (!hasMoreData && observerInstance.current) {
          console.log('没有更多数据，断开观察器');
          observerInstance.current.disconnect();
        }
      } catch (error: unknown) {
        console.error('获取数据出错:', error);
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [nickname, limit]
  );

  useEffect(() => {
    console.log('昵称变化，重新加载:', nickname);

    setEntries([]);
    setPage(1);
    currentPageRef.current = 1;
    setLoading(false);
    setHasMore(true);
    initialLoadDone.current = false;

    loadedPages.current.clear();
    isLoadingRef.current = false;

    if (observerInstance.current) {
      observerInstance.current.disconnect();
      observerInstance.current = null;
    }

    fetchEntries(1);
  }, [nickname, fetchEntries]);

  useEffect(() => {
    currentPageRef.current = page;

    if (page > 1 && !loadedPages.current.has(page)) {
      console.log(`页码变化，加载新页面: ${page}`);
      fetchEntries(page);
    }
  }, [page, fetchEntries]);

  useEffect(() => {
    // 保持清理逻辑
    if (observerInstance.current) {
      observerInstance.current.disconnect();
      observerInstance.current = null;
    }

    // 使用函数来封装观察器的设置逻辑
    const setupObserver = () => {
      if (!nickname || !hasMore || !initialLoadDone.current) {
        return;
      }

      console.log('设置无限滚动观察器, 当前页码:', currentPageRef.current);

      observerInstance.current = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]): void => {
          if (entries[0].isIntersecting && !isLoadingRef.current && hasMore) {
            const nextPage = currentPageRef.current + 1;
            console.log('触发观察器，准备加载页面:', nextPage);

            if (!loadedPages.current.has(nextPage)) {
              console.log('开始加载下一页:', nextPage);
              setPage(nextPage);
            } else {
              console.log('页面已加载，跳过:', nextPage);
            }
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      );

      const currentRef = observerRef.current;
      if (currentRef) {
        console.log('开始观察底部元素');
        observerInstance.current.observe(currentRef);
      }
    };

    // 设置观察器
    setupObserver();

    // 清理函数
    return () => {
      if (observerInstance.current) {
        console.log('清理观察器');
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, nickname, initialLoadDone.current]);

  const handleEntryHoverStart = useCallback((id: string, index: number) => {
    setActiveEntryId(id);
    setActiveEntryIndex(index);
  }, []);

  const handleEntryHoverEnd = useCallback(() => {
    setActiveEntryId(null);
    setActiveEntryIndex(null);
  }, []);

  if (!nickname) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">时光轴</h2>
      <div className="relative">
        {/* 初始加载时显示骨架屏 */}
        {entries.length === 0 && loading && (
          <>
            <TimelineSkeleton />
            <motion.p
              className="text-center text-gray-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              正在加载记忆...
            </motion.p>
          </>
        )}

        {/* 使用虚拟化的时间轴组件 */}
        {entries.length > 0 && (
          <VirtualizedTimeline 
            entries={entries} 
            activeEntryId={activeEntryId} 
            setActiveEntryId={handleEntryHoverStart}
            clearActiveEntry={handleEntryHoverEnd}
          />
        )}
        
        {/* 进度指示器 - 传递activeEntryIndex */}
        <AnimatePresence>
          {showProgress && totalCount > 0 && (
            <ProgressIndicator 
              loadedCount={entries.length} 
              totalCount={totalCount}
              activeEntryIndex={activeEntryIndex}
            />
          )}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div ref={observerRef} className="h-10">
          {loading && (
            <motion.p
              className="text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              正在加载更多记忆...
            </motion.p>
          )}
        </div>
      )}

      {!hasMore && entries.length > 0 && (
        <motion.p
          className="text-center text-gray-500 italic mt-8 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          时光长河的尽头，是美好回忆的起点...
        </motion.p>
      )}
    </div>
  );
}