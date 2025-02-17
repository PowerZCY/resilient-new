'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NicknameFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultNickname = 'Zia慢成';
  const isFirstRender = useRef(true);
  
  // 使用 useState 的函数形式来确保初始值只计算一次
  const [nickname, setNickname] = useState(() => {
    return searchParams.get('nickname') || defaultNickname;
  });

  // 只在首次渲染时执行一次 URL 更新
  useEffect(() => {
    if (isFirstRender.current && !searchParams.get('nickname')) {
      isFirstRender.current = false;
      router.replace(`/?nickname=${defaultNickname}`, {
        scroll: false
      });
    }
  }, [searchParams, router]);

  // 使用 useCallback 缓存 handleFilter 函数
  const handleFilter = useCallback((value: string) => {
    setNickname(value);
    router.push(`/?nickname=${encodeURIComponent(value)}`, {
      scroll: false
    });
  }, [router]);

  return (
    <Select value={nickname} onValueChange={handleFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="选择昵称" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Zia慢成">Zia慢成</SelectItem>
        <SelectItem value="帝八哥">帝八哥</SelectItem>
      </SelectContent>
    </Select>
  );
}