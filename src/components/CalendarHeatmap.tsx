'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@tremor/react';
import { useSearchParams } from 'next/navigation';
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
  const { nickname } = useNickname();
  const [data, setData] = useState<DataPoint[]>([]);
  const searchParams = useSearchParams();
  const dataCache = useRef<Record<string, DataPoint[]>>({});
  const isLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    if (nickname) {
      console.log(`CalendarHeatmap: Fetching data for ${nickname}`);
      // 如果已经有缓存数据，直接使用
      if (dataCache.current[nickname]) {
        // console.log('使用缓存的热力图数据:', nickname);
        setData(dataCache.current[nickname]);
        return;
      }
      
      // 防止重复请求
      if (isLoadingRef.current) {
        // console.log('热力图数据正在加载中，跳过请求:', nickname);
        return;
      }
      
      // console.log('获取热力图数据:', nickname);
      isLoadingRef.current = true;
      
      fetch(`/api/entries/heatmap?nickname=${encodeURIComponent(nickname)}`)
        .then(res => res.json())
        .then(entries => {
          const processedData = processDataForHeatmap(entries);
          // 缓存数据
          dataCache.current[nickname] = processedData;
          setData(processedData);
          // console.log('热力图数据已加载:', nickname);
        })
        .catch(err => {
          console.error('Failed to fetch heatmap data:', err);
          setData([]);
        })
        .finally(() => {
          isLoadingRef.current = false;
        });
    }
  }, [nickname]);

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

  // 如果没有 nickname，显示加载状态或空状态
  if (!nickname) {
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