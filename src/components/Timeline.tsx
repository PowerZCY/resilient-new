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
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set());
  const observerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const nickname: string | null = searchParams.get('nickname');
  const limit: number = 20;
  const observerInitialized: React.MutableRefObject<boolean> = useRef<boolean>(false);
  const debouncedFetch: React.MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEntries = useCallback(
    async (pageNum: number): Promise<void> => {
      if (!nickname || loading || fetchedPages.has(pageNum)) {
        console.log(`Skipping fetch for page=${pageNum}: already fetched or loading`);
        return;
      }

      console.log(`Fetching entries: page=${pageNum}, nickname=${nickname}`);
      setLoading(true);
      try {
        const res: Response = await fetch(
          `/api/entries?nickname=${encodeURIComponent(nickname || '')}&page=${pageNum}&limit=${limit}`
        );
        const data: ApiResponse = await res.json();

        console.log('API response:', {
          page: pageNum,
          entries: data.entries.map((e: Entry) => e.id),
          total: data.total,
        });

        const newEntries: Entry[] = data.entries || [];
        const total: number = data.total || 0;

        // 去重：基于 id 合并新旧数据
        setEntries((prev: Entry[]): Entry[] => {
          const combined: Entry[] = [...prev, ...newEntries];
          const uniqueEntries: Entry[] = [
            ...new Map(combined.map((entry: Entry) => [entry.id, entry] as const)).values(),
          ];
          console.log('Merged entries IDs:', uniqueEntries.map((e: Entry) => e.id));
          return uniqueEntries;
        });
        setFetchedPages((prev: Set<number>): Set<number> => new Set(prev).add(pageNum));
        setHasMore(pageNum * limit < total);
      } catch (error: unknown) {
        Logger.error('Error fetching entries:', error as Error);
      } finally {
        setLoading(false);
      }
    },
    [nickname, limit]
  );

  // 每次 nickname 变化时重新加载第一页数据，并重置所有状态
  useEffect(() => {
    if (nickname) {
      console.log('Nickname changed, reloading for nickname:', nickname);
      setEntries([]); // 重置数据
      setPage(1); // 重置页面
      setLoading(false); // 重置加载状态
      setHasMore(true); // 重置是否有更多数据
      setFetchedPages(new Set()); // 重置已请求页面
      fetchEntries(1); // 加载新昵称的第一页数据
    }
  }, [nickname, fetchEntries]);

  // 设置 Intersection Observer 监听滚动
  useEffect(() => {
    if (!nickname || !hasMore || loading || observerInitialized.current) {
      console.log('Observer setup skipped or already initialized:', {
        hasMore,
        loading,
        nickname,
        observerInitialized: observerInitialized.current,
      });
      return;
    }

    console.log('Setting up observer for page:', page);
    observerInitialized.current = true;

    const observer: IntersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        if (entries[0].isIntersecting && !loading) {
          console.log('Observer triggered, loading page:', page + 1);
          if (debouncedFetch.current) {
            clearTimeout(debouncedFetch.current);
          }
          debouncedFetch.current = setTimeout(() => {
            setPage((prevPage: number): number => {
              const nextPage: number = prevPage + 1;
              fetchEntries(nextPage);
              return nextPage;
            });
          }, 500);
        }
      },
      { threshold: 0.2, rootMargin: '500px' }
    );

    const currentRef: HTMLDivElement | null = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observerInitialized.current = false;
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      if (debouncedFetch.current) {
        clearTimeout(debouncedFetch.current);
      }
    };
  }, [hasMore, nickname, fetchEntries]);

  const formatDate = (dateString: string): string => {
    const date: Date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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
              <p className="text-gray-700">{entry.content}</p>
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