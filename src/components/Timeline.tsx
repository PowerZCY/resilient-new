'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logger } from '@/lib/logger';

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

  if (!nickname) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">时光轴</h2>
      <div className="relative">
        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200"></div>
        {entries.map((entry: Entry) => (
          <div key={entry.id} className="relative pl-8 pb-8">
            <div className="absolute left-0 top-2 w-4 h-4 bg-white border-2 border-[#509863] rounded-full"></div>
            <div className="mb-2 text-sm font-semibold text-gray-500">
              {formatDate(entry.date)}
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              {formatContent(entry.content)}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={observerRef} className="h-10">
          {loading && <p className="text-center text-gray-500">Loading...</p>}
        </div>
      )}
      {!hasMore && entries.length > 0 && (
        <p className="text-center text-gray-500">Ooops! No more data!</p>
      )}
    </div>
  );
}