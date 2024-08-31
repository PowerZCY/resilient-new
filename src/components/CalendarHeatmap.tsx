'use client';

import { useEffect, useState } from 'react';
import { Card } from '@tremor/react';
import { useSearchParams } from 'next/navigation';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface DataPoint {
  date: string;
  count: number;
}

interface EntryData {
  date: string;
  // 添加其他从 API 返回的字段
}

export default function ContributionHeatmap() {
  const [data, setData] = useState<DataPoint[]>([]);
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname');

  useEffect(() => {
    fetch(`/api/entries${nickname ? `?nickname=${encodeURIComponent(nickname)}` : ''}`)
      .then(res => res.json())
      .then(entries => {
        console.log('API Response:', entries); // 日志 API 响应
        const processedData = processDataForHeatmap(entries);
        setData(processedData);
      });
  }, [nickname]);

  const processDataForHeatmap = (entries: EntryData[]): DataPoint[] => {
    const countByDate = entries.reduce((acc, entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countByDate).map(([date, count]): DataPoint => ({
      date,
      count,
    }));
  };

  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return (
    <>
    <h2 className="text-2xl font-semibold mb-2">{nickname ? `${nickname}'s` : 'User'} Contributions</h2>
    <Card className="border border-[#509863] p-4 rounded-lg">
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
  </>
  );
}