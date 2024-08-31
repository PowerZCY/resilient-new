'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Entry {
  id: string;
  date: string;
  content: string;
}

export default function Timeline() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname');

  useEffect(() => {
    fetch(`/api/entries${nickname ? `?nickname=${encodeURIComponent(nickname)}` : ''}`)
      .then(res => res.json())
      .then(setEntries);
  }, [nickname]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">时光轴</h2>
      <div className="relative">
        {/* 垂直线 */}
        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200"></div>
        
        {entries.map((entry, index) => (
          <div key={entry.id} className="relative pl-8 pb-8">
            {/* 圆点 */}
            <div className="absolute left-0 top-2 w-4 h-4 bg-white border-2 border-[#509863] rounded-full"></div>
            
            {/* 日期 */}
            <div className="mb-2 text-sm font-semibold text-gray-500">
              {formatDate(entry.date)}
            </div>
            
            {/* 内容 */}
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-gray-700">{entry.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}