'use client'; // 保持客户端组件标记

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zhCN } from 'date-fns/locale';

interface EntryForm {
  date: Date | undefined;
  content: string;
}

// 定义一个客户端组件来处理 useSearchParams
function NewEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultNickname = 'Zia慢成';
  const [nickname, setNickname] = useState<string>(searchParams.get('nickname') || defaultNickname); // 从 URL 获取昵称
  const [entries, setEntries] = useState<EntryForm[]>([{ date: new Date(), content: '' }]); // 批量记录

  useEffect(() => {
    const urlNickname = searchParams.get('nickname');
    if (urlNickname && urlNickname !== nickname) {
      setNickname(urlNickname);
    }
  }, [searchParams]);

  const addEntry = () => {
    if (entries.length < 20) { // 限制最多 20 条
      setEntries([...entries, { date: new Date(), content: '' }]);
    }
  };

  const updateEntry = (index: number, field: keyof EntryForm, value: string | Date | undefined) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1 && window.confirm('确定删除此条目？')) { // 添加确认提示
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || entries.some(entry => !entry.date || !entry.content)) return;

    const formattedEntries = entries.map(entry => ({
      date: entry.date!.toISOString(), // 转换为 ISO 字符串，后端可以解析
      nickname,
      content: entry.content,
    }));

    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedEntries), // 批量提交
    });

    if (response.ok) {
      // 跳转回首页时带上用户在 NewEntry 选定的昵称
      router.push(`/?nickname=${encodeURIComponent(nickname)}`);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-center my-8">记下今天的好体验、好事儿、成就</h1>
      <form onSubmit={handleSubmit} className="w-2/3 mx-auto space-y-6 mt-16">
        <div className="mb-6">
          <label htmlFor="nickname" className="block mb-2 text-sm font-medium">昵称</label>
          <Select value={nickname} onValueChange={(value) => setNickname(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择昵称" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Zia慢成">Zia慢成</SelectItem>
              <SelectItem value="帝八哥">帝八哥</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {entries.map((entry, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-md bg-white flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/12">
                <label className="block mb-2 text-sm font-medium text-red-500">Row.{index + 1}</label>
              </div>
              <div className="w-1/4">
                <label className="block mb-2 text-sm font-medium">日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !entry.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {entry.date ? format(entry.date, "PPP", { locale: zhCN }) : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={entry.date}
                      onSelect={(date) => updateEntry(index, 'date', date)}
                      initialFocus
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">内容</label>
                <textarea
                  value={entry.content}
                  onChange={(e) => updateEntry(index, 'content', e.target.value)}
                  required
                  className="w-full p-2 rounded-md border h-20"
                  placeholder="输入好体验、好事儿或成就"
                />
              </div>
              <Button
                type="button"
                onClick={() => removeEntry(index)}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center ml-2"
                aria-label="删除条目"
              >
                -
              </Button>
            </div>
            {index === entries.length - 1 && (
              <Button
                type="button"
                onClick={addEntry}
                className="mt-2 bg-[#509863] hover:bg-[#509863]/90 text-white w-8 h-8 rounded-full flex items-center justify-center"
                disabled={entries.length >= 20}
              >
                +
              </Button>
            )}
          </div>
        ))}

        <div className="text-center">
          <Button type="submit" className="bg-[#509863] hover:bg-[#509863]/90 text-white px-6 py-2">
            批量提交
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewEntry() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewEntryContent />
    </Suspense>
  );
}