'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NicknameFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultNickname = 'Zia慢成';
  const isFirstRender = useRef(true);

  // 确保初始化时处理 null 或 undefined
  const [nickname, setNickname] = useState(() => {
    const param = searchParams.get('nickname');
    return param ? param : defaultNickname;
  });

  // 仅在首次渲染且无 nickname 参数时更新 URL
  useEffect(() => {
    const currentNickname = searchParams.get('nickname');
    if (isFirstRender.current && !currentNickname) {
      isFirstRender.current = false;
      // console.log('Initializing URL with default nickname:', defaultNickname);
      router.replace(`/?nickname=${encodeURIComponent(defaultNickname)}`, {
        scroll: false,
      });
    }
  }, [router]); // 确保只依赖 router，避免 searchParams 的变化触发

  // 处理用户选择
  const handleFilter = useCallback(
    (value: string) => {
      setNickname(value);
      // console.log('User selected nickname:', value);
      router.push(`/?nickname=${encodeURIComponent(value)}`, {
        scroll: false,
      });
    },
    [router]
  );

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