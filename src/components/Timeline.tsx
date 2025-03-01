'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logger } from '@/lib/logger';
import { motion } from 'framer-motion';

interface Entry {
  id: string;
  date: string;
  content: string;
}

interface ApiResponse {
  entries: Entry[];
  total: number;
}

export default function Timeline(): JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const nickname: string | null = searchParams.get('nickname');
  const limit: number = 20;
  const observerInstance = useRef<IntersectionObserver | null>(null);
  const debouncedFetch: React.MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedPages = useRef<Set<number>>(new Set([1]));
  const isLoadingRef = useRef<boolean>(false);
  const initialLoadDone = useRef<boolean>(false);
  const currentPageRef = useRef<number>(1);

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
    if (observerInstance.current) {
      observerInstance.current.disconnect();
      observerInstance.current = null;
    }
    
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

    const currentRef: HTMLDivElement | null = observerRef.current;
    if (currentRef) {
      console.log('开始观察底部元素');
      observerInstance.current.observe(currentRef);
    } else {
      console.log('底部元素不存在，无法观察');
    }

    return () => {
      if (observerInstance.current) {
        console.log('清理观察器');
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
    };
  }, [hasMore, nickname, initialLoadDone.current]);

  const formatDate = (dateString: string): string => {
    const date: Date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

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
        delay: i * 0.1,
        duration: 0.5,
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
        delay: custom * 0.05,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // 气泡浮动动画
  const floatingBubbleVariants = {
    initial: { y: 0 },
    animate: (custom: number) => ({
      y: [0, -3, 0, 3, 0],
      transition: {
        delay: custom * 0.1,
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut"
      }
    })
  };

  if (!nickname) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">时光轴</h2>
      <div className="relative">
        {entries.map((entry: Entry, index: number) => {
          const isActive = activeEntryId === entry.id;
          
          return (
            <motion.div
              key={entry.id}
              className="relative pl-8 pb-8"
              initial="hidden"
              animate="visible"
              custom={index}
              variants={timelineVariants}
              onHoverStart={() => setActiveEntryId(entry.id)}
              onHoverEnd={() => setActiveEntryId(null)}
            >
              {/* 主圆点 */}
              <motion.div
                className="absolute left-0 top-2 w-5 h-5 rounded-full z-10"
                initial="initial"
                animate={isActive ? "hover" : "initial"}
                variants={circleVariants}
                whileHover={{ scale: 1.3 }}
              ></motion.div>
              
              {/* 连接前一个条目的气泡链 */}
              {index > 0 && (
                <div className="absolute left-[10px] top-[-30px] h-[40px] flex flex-col justify-between items-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`bubble-up-${i}`}
                      className="w-[6px] h-[6px] rounded-full"
                      initial="initial"
                      animate={isActive ? ["animate", "animate"] : "initial"}
                      variants={{
                        initial: bubbleVariants.initial,
                        animate: bubbleVariants.animate(5 - i)
                      }}
                      custom={i}
                      style={{
                        opacity: isActive ? 1 : 0.5,
                        backgroundColor: isActive ? "#8B5CF6" : "#94a3b8",
                        boxShadow: isActive ? "0 0 4px rgba(139, 92, 246, 0.5)" : "none"
                      }}
                    >
                      {/* 气泡内部发光效果 */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: ["0 0 0px rgba(139, 92, 246, 0.3)", "0 0 8px rgba(139, 92, 246, 0.6)", "0 0 0px rgba(139, 92, 246, 0.3)"]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* 连接下一个条目的气泡链 */}
              {index < entries.length - 1 && (
                <div className="absolute left-[10px] top-[40px] h-[calc(100%-48px)] flex flex-col justify-between items-center">
                  {[...Array(Math.min(10, Math.floor((index === 0 ? 100 : 80) / 8)))].map((_, i) => (
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
                      {/* 气泡内部发光效果 */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: ["0 0 0px rgba(139, 92, 246, 0.3)", "0 0 8px rgba(139, 92, 246, 0.6)", "0 0 0px rgba(139, 92, 246, 0.3)"]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
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
                animate={isActive ? "hover" : "initial"}
                variants={dateVariants}
              >
                {formatDate(entry.date)}
              </motion.div>
              
              {/* 内容卡片 */}
              <motion.div
                className="p-4 rounded-lg shadow"
                initial="initial"
                animate={isActive ? "hover" : "initial"}
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
        })}
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