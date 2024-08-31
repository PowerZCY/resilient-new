'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NicknameFilter() {
  const [nickname, setNickname] = useState('Zia慢成');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentNickname = searchParams.get('nickname');
    if (currentNickname) {
      setNickname(currentNickname);
    } else {
      router.push('/?nickname=Zia慢成');
    }
  }, [searchParams, router]);

  const handleFilter = (value: string) => {
    setNickname(value);
    router.push(`/?nickname=${encodeURIComponent(value)}`);
  };

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