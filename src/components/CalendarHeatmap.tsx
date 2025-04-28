'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@tremor/react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useNickname } from '@/context/NicknameContext';

interface DataPoint {
  date: string;
  count: number;
}

interface EntryData {
  date: string;
  // 添加其他从 API 返回的字段
}

export default function ContributionHeatmap() {
  const { nickname, isNicknameInitialized } = useNickname();
  const [data, setData] = useState<DataPoint[]>([]);
  const dataCache = useRef<Record<string, DataPoint[]>>({});
  const isLoadingRef = useRef<boolean>(false);
  const [isComponentLoading, setIsComponentLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isNicknameInitialized || !nickname) {
      console.log(`CalendarHeatmap: Skip fetch, initialized: ${isNicknameInitialized}, nickname: ${nickname}`);
      if (isNicknameInitialized) {
        setIsComponentLoading(false);
        setData([]);
      }
      return;
    }

    console.log(`CalendarHeatmap: Fetching data for ${nickname}`);
    setIsComponentLoading(true);

    if (dataCache.current[nickname]) {
      setData(dataCache.current[nickname]);
      setIsComponentLoading(false);
      console.log('CalendarHeatmap: Using cached data for', nickname);
      return;
    }

    if (isLoadingRef.current) {
      console.log('CalendarHeatmap: Fetch already in progress for', nickname);
      return;
    }

    isLoadingRef.current = true;
    
    fetch(`/api/entries/heatmap?nickname=${encodeURIComponent(nickname)}`)
      .then(res => {
         if (!res.ok) throw new Error(`API Error: ${res.status}`);
         return res.json();
      })
      .then(entries => {
        const processedData = processDataForHeatmap(entries);
        dataCache.current[nickname] = processedData;
        setData(processedData);
        console.log('CalendarHeatmap: Data loaded for', nickname);
      })
      .catch(err => {
        console.error('Failed to fetch heatmap data:', err);
        setData([]);
      })
      .finally(() => {
        isLoadingRef.current = false;
        setIsComponentLoading(false);
      });
  }, [nickname, isNicknameInitialized]);

  const processDataForHeatmap = (entries: EntryData[]): DataPoint[] => {
    if (!Array.isArray(entries)) {
      console.warn('Entries is not an array:', entries);
      return [];
    }
    
    const countByDate = entries.reduce((acc, entry) => {
      if (!entry || !entry.date) return acc;
      
      try {
        const date = new Date(entry.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        acc[formattedDate] = (acc[formattedDate] || 0) + 1;
      } catch (error) {
        console.error('Error processing date:', error);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countByDate).map(([date, count]): DataPoint => ({
      date,
      count,
    }));
  };

  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  if (!isNicknameInitialized || isComponentLoading) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg opacity-0 group-hover:opacity-75 transition duration-500 blur-sm animate-pulse" />
        <Card className="relative border border-[#509863] p-4 rounded-lg bg-white dark:bg-slate-800">
          <div className="text-center text-gray-500">
            Loading...
          </div>
        </Card>
      </div>
    );
  }

  if (!nickname) {
    return (
      <div className="relative group">
        <Card className="relative border border-gray-300 p-4 rounded-lg bg-white dark:bg-slate-800">
          <div className="text-center text-gray-500">
            No user selected or data available.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">{nickname}&apos;s Contributions</h2>
      <div className="relative group">
        {/* 发光边框效果 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg opacity-0 group-hover:opacity-75 transition duration-500 blur-sm animate-glow" />
        
        {/* 主卡片内容 */}
        <Card className="relative border border-[#509863] p-4 rounded-lg bg-white dark:bg-slate-800">
          <CalendarHeatmap
            startDate={oneYearAgo}
            endDate={today}
            values={data}
            classForValue={(value) => {
              if (!value) {
                return 'color-empty'
              }
              return `color-scale-${Math.min(value.count, 4)}`
            }}
            titleForValue={(value) => value ? `${value.date}: ${value.count} 条记录` : '无记录'}
          />
          <style jsx global>{`
            .react-calendar-heatmap .color-scale-1 { fill: #9BE9A8; }
            .react-calendar-heatmap .color-scale-2 { fill: #40C463; }
            .react-calendar-heatmap .color-scale-3 { fill: #30A14E; }
            .react-calendar-heatmap .color-scale-4 { fill: #216E39; }
          `}</style>
        </Card>
      </div>
    </>
  );
}