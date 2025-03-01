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

  const fetchEntries = useCallback(
    async (pageNum: number): Promise<void> => {
      if (!nickname || loading || loadedPages.current.has(pageNum)) {
        console.log(`Skipping fetch for page=${pageNum}: no nickname, loading, or already loaded`);
        return;
      }

      console.log(`Fetching entries: page=${pageNum}, nickname=${nickname}`);
      setLoading(true);
      try {
        const res: Response = await fetch(
          `/api/entries?nickname=${encodeURIComponent(nickname || '')}&page=${pageNum}&limit=${limit}`
        );
        const data: ApiResponse = await res.json();

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
        setHasMore(pageNum * limit < total);
      } catch (error: unknown) {
        Logger.error('Error fetching entries:', error as Error);
      } finally {
        setLoading(false);
      }
    },
    [nickname, limit, loading]
  );

  useEffect(() => {
    if (nickname) {
      console.log('Nickname changed, reloading for nickname:', nickname);
      setEntries([]);
      setPage(1);
      setLoading(false);
      setHasMore(true);
      
      loadedPages.current = new Set();
      
      if (observerInstance.current) {
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
      
      fetchEntries(1);
    }
  }, [nickname]);

  useEffect(() => {
    if (!nickname || !hasMore || loading || observerInstance.current) {
      return;
    }

    console.log('Setting up observer for infinite scrolling');
    
    observerInstance.current = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const nextPage = page + 1;
          console.log('Observer triggered, loading page:', nextPage);
          
          if (debouncedFetch.current) {
            clearTimeout(debouncedFetch.current);
          }
          
          debouncedFetch.current = setTimeout(() => {
            if (!loadedPages.current.has(nextPage)) {
              setPage(nextPage);
              fetchEntries(nextPage);
            }
          }, 500);
        }
      },
      { threshold: 0.2, rootMargin: '500px' }
    );

    const currentRef: HTMLDivElement | null = observerRef.current;
    if (currentRef) {
      observerInstance.current.observe(currentRef);
    }

    return () => {
      if (observerInstance.current) {
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
      
      if (debouncedFetch.current) {
        clearTimeout(debouncedFetch.current);
        debouncedFetch.current = null;
      }
    };
  }, [hasMore, loading, page, nickname]);

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