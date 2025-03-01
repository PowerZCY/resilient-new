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

export default function NicknameFilter(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultNickname = 'Zia慢成';
  const isFirstRender = useRef<boolean>(true);
  const isUpdatingUrl = useRef<boolean>(false);

  // 确保初始化时处理 null 或 undefined
  const [nickname, setNickname] = useState<string>(() => {
    const param = searchParams.get('nickname');
    return param ? param : defaultNickname;
  });

  // 仅在首次渲染且无 nickname 参数时更新 URL
  useEffect(() => {
    const currentNickname = searchParams.get('nickname');
    if (isFirstRender.current && !currentNickname && !isUpdatingUrl.current) {
      isFirstRender.current = false;
      isUpdatingUrl.current = true;
      console.log('Initializing URL with default nickname:', defaultNickname);
      router.replace(`/?nickname=${encodeURIComponent(defaultNickname)}`, {
        scroll: false,
      });
      // 使用setTimeout确保URL更新状态重置
      setTimeout(() => {
        isUpdatingUrl.current = false;
      }, 100);
    }
  }, [router, defaultNickname]);

  // 处理用户选择
  const handleFilter = useCallback(
    (value: string): void => {
      // 如果选择的昵称与当前昵称相同，则跳过更新
      if (value === nickname) {
        console.log('相同昵称，跳过更新:', value);
        return;
      }
      
      if (isUpdatingUrl.current) {
        console.log('URL正在更新中，跳过请求');
        return;
      }
      
      setNickname(value);
      console.log('User selected nickname:', value);
      isUpdatingUrl.current = true;
      router.push(`/?nickname=${encodeURIComponent(value)}`, {
        scroll: false,
      });
      // 使用setTimeout确保URL更新状态重置
      setTimeout(() => {
        isUpdatingUrl.current = false;
      }, 100);
    },
    [router, nickname]
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