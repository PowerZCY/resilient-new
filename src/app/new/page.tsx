'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from '@/components/ui/input';
import { zhCN } from 'date-fns/locale';

export default function NewEntry() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !nickname || !content) return;

    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, nickname, content }),
    });

    if (response.ok) {
      router.push('/');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-center my-8">记下今天的好体验、好事儿、成就</h1>
      <form onSubmit={handleSubmit} className="w-1/3 mx-auto space-y-4 mt-16">
        <div>
          <label htmlFor="date" className="block mb-2">日期</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: zhCN }) : <span>选择日期</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label htmlFor="nickname" className="block mb-2">昵称</label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-2">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full p-2 rounded-md border"
            rows={4}
          />
        </div>
        <Button type="submit" className="bg-[#509863] hover:bg-[#509863]/90 text-white">提交</Button>
      </form>
    </div>
  );
}