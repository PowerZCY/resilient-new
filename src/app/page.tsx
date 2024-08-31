import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import NicknameFilter from '@/components/NicknameFilter';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import Timeline from '@/components/Timeline';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-semibold text-center my-8 mt-20">突破消极偏见😎</h1>
      <p className="text-center mb-2">每天都有好体验、好事儿、成就 ✔</p>
      
      <div className="flex justify-center mb-4">
        <div className="mr-auto ml-[80%]">
          <Link href="/new">
          <Button variant="outline" size="icon" className="border-[#509863] border-2 text-[#509863] hover:bg-[#509863] hover:text-white">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
</Button>
          </Link>
        </div>
      </div>
      
      <div className="w-1/2 mx-auto space-y-8">
        <NicknameFilter />
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarHeatmap />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <Timeline />
        </Suspense>
      </div>
    </div>
  );
}
