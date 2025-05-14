'use client'; // 保持客户端组件标记

import { Suspense, useCallback, useEffect, useRef, useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { globalLucideIcons as icons } from '@/components/global-icon';
import { useNickname } from '@/context/NicknameContext'; // <-- Import useNickname

// Import shadcn/ui components
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns'; // Import date-fns format
import { zhCN } from 'date-fns/locale'; // Import Chinese locale

// --- 常量定义 ---
const MAX_ENTRIES = 20;
// 3D 轮播常量 (参考 batch-entry.js)
const ANGLE_STEP = 5; // 每张卡片距离中心的角度步长 (用于 RotateY)
const Z_STEP_PER_LEVEL = 80; // 每级卡片距离的深度偏移 (像素)
const Y_STEP_PER_LEVEL = 15; // 每级卡片距离的垂直偏移增加量 (像素)
const RADIUS_X = 550; // X轴分布半径 (调整以改变水平扩散程度)
const VISIBLE_CARDS_FOR_X = 10; // X轴扩散计算的可见卡片数量
const VISIBLE_ANGLE_FOR_X = Math.PI * 0.8; // X轴扩散的角度范围

// 定义单条记录的接口
interface EntryItem {
  id: string;
  date: string; // 格式: YYYY-MM-DD
  content: string;
}

// --- 辅助函数 ---
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- 子组件：EntryCard ---
interface EntryCardProps {
  entry: EntryItem;
  index: number;
  isActive: boolean;
  style: React.CSSProperties; // 接收来自父组件计算的样式
  onDateChange: (id: string, newDate: string) => void;
  onContentChange: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onClick: (index: number) => void;
}

// 使用 forwardRef 包装组件
const EntryCard = forwardRef<HTMLDivElement, EntryCardProps>(({ // 添加 ref 类型
  entry,
  index,
  isActive,
  style,
  onDateChange,
  onContentChange,
  onDelete,
  onClick
}, ref) => { // 接收 ref 参数
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(entry.id, e.target.value);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发卡片点击
    onDelete(entry.id);
  };

  const handleCardClick = () => {
    // 点击卡片总是使其激活
    onClick(index);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format date to 'yyyy-MM-dd' before updating state
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      onDateChange(entry.id, formattedDate);
      setIsDatePickerOpen(false); // Close popover on select
    }
  }

  // Parse the date string safely
  const currentDate = entry.date ? new Date(entry.date + 'T00:00:00') : undefined;

  return (
    <div
      ref={ref} // 将 ref 传递给根 div
      className={`bce:entry-card ${isActive ? 'active' : ''}`.trim()} // Updated className
      style={style} // 应用父组件传递的 transform, opacity, zIndex 等样式
      onClick={handleCardClick}
      aria-label={`体验 ${index + 1}`}
    >
      {/* Conditionally render overlay when inactive */}
      {!isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: '43px', // Cover everything except the footer (footer height is 43px)
            zIndex: 3, // Above content, below date header
            cursor: 'pointer',
            background: 'transparent',
          }}
          aria-hidden="true" // Hide from accessibility tree as it's purely interactive
        />
      )}

      {/* --- shadcn/ui Date Picker --- */}
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"} // Use outline or a custom variant
            disabled={!isActive}
            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
            className={`bce:date-picker-trigger ${!isActive ? 'disabled' : ''}`.trim()} // Updated className
            // Add custom styling to resemble the purple pill
            style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '6px 18px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                boxShadow: '0 3px 8px rgba(139, 92, 246, 0.3)',
                zIndex: 10,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--label-font)',
                border: 'none', // Remove default button border
                height: 'auto', // Adjust height
                opacity: isActive ? 1 : 0.7, // Slightly dim if inactive? Or use CSS
            }}
          >
            {/* <CalendarIcon className="mr-2 h-4 w-4" /> */} {/* Optional Icon */}
            {currentDate ? format(currentDate, "yyyy年M月d日") : <span>选择日期</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-none" align="center">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateSelect}
            initialFocus
            locale={zhCN} // Add Chinese locale
          />
        </PopoverContent>
      </Popover>

      <div className="bce:card-content"> {/* Updated className */}
        {/* Textarea: 仅在激活时启用 */}
        <textarea
          className="bce:content-textarea"
          data-testid="bce-content-textarea"
          rows={4}
          placeholder="输入好体验、好事儿或成就..."
          aria-label="内容输入"
          value={entry.content}
          onChange={handleTextareaChange}
          onClick={(e) => e.stopPropagation()} // 防止触发卡片点击
          disabled={!isActive} // 禁用非激活卡片的文本输入
        />
        <div className="bce:char-count">{entry.content.length} 个字符</div> {/* Updated className */}
      </div>
      <div className="bce:card-footer"> {/* Updated className */}
        {/* Conditionally apply 'valid' class based on content */}
        <span className={`bce:entry-index ${entry.content.trim() !== '' ? 'valid' : ''}`.trim()}> {/* Updated className */}
          体验 #{index + 1}
        </span>
        {/* Delete Button */}
        <button
          className={`bce:action-btn bce:delete-btn`} // Updated className
          title="删除此条目"
          onClick={handleDeleteClick}
        >
          <icons.Trash2 />
        </button>
      </div>
    </div>
  );
});

// 添加 displayName (推荐)
EntryCard.displayName = 'EntryCard';


// --- 主内容组件 ---
function NewEntryContent() {
  const { nickname } = useNickname(); // <-- Get nickname from Context
  const router = useRouter();

  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [cardStyles, setCardStyles] = useState<React.CSSProperties[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const entriesContainerRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]); // 用于存储卡片 DOM 元素的引用
  const isInitialLayoutApplied = useRef(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout | number | null>(null); // 用于存储 focus timeout id

  // --- 核心函数 ---

  const updateEntryDate = (id: string, newDate: string) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, date: newDate } : entry
      )
    );
  };

  const updateEntryContent = (id: string, newContent: string) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, content: newContent } : entry
      )
    );
  };

  // --- 轮播布局计算和应用 ---
  const applyCarouselLayout = useCallback((targetIndex: number) => {
    if (!entriesContainerRef.current || cardElementsRef.current.length === 0) return;

    const containerWidth = entriesContainerRef.current.offsetWidth;
    const containerHeight = entriesContainerRef.current.offsetHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const groupSize = entries.length;
    const newCardStyles: React.CSSProperties[] = [];

    let centerCardX = centerX; // 默认容器中心
    let centerCardY = centerY;
    let centerCardHeight = 360; // 默认卡片高度

    cardElementsRef.current.forEach((cardElement, index) => {
        if (!cardElement) {
            newCardStyles[index] = {}; // 保留占位符
            return;
        }

        const logicalRelativePos = index - targetIndex;
        let visualRelativePos = logicalRelativePos;
        if (groupSize > 1) {
            const halfSize = groupSize / 2;
            if (logicalRelativePos > halfSize) {
                visualRelativePos = logicalRelativePos - groupSize;
            } else if (logicalRelativePos <= -halfSize) {
                visualRelativePos = logicalRelativePos + groupSize;
            }
        }

        const relativePos = visualRelativePos;
        const isCenterCard = (relativePos === 0);

        const angleDeg = relativePos * ANGLE_STEP;
        const rotateYRad = angleDeg * (Math.PI / 180);

        const angleDivisorX = VISIBLE_CARDS_FOR_X;
        const angleForX = relativePos * (VISIBLE_ANGLE_FOR_X / angleDivisorX);
        const x = Math.sin(angleForX) * RADIUS_X;

        const z = -Math.abs(relativePos) * Z_STEP_PER_LEVEL;
        const y = Math.abs(relativePos) * Y_STEP_PER_LEVEL;

        const transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateYRad}rad)`;

        if (isCenterCard) {
            centerCardX = centerX + x; // 卡片是相对于容器中心的，所以要加上 x
            centerCardY = centerY + y; // 加上 y
            centerCardHeight = cardElement.offsetHeight || 360; // 获取实际高度
        }

        const zIndex = 100 - Math.abs(relativePos);
        const isVisible = Math.abs(relativePos) <= VISIBLE_CARDS_FOR_X / 2;
        const opacity = isVisible ? Math.max(0.4, 1 - Math.abs(relativePos) * 0.12) : 0;

        newCardStyles[index] = {
            transform: transform,
            opacity: opacity,
            zIndex: zIndex,
            pointerEvents: 'auto',
            // transition 应用在 CSS 中
        };
    });

    setCardStyles(newCardStyles);

    // --- 定位 Active Indicator ---
    const verticalGap = 125; // 卡片下方的间隙
    const indicatorX = centerCardX; // 水平对齐中心卡片
    const indicatorY = centerCardY + centerCardHeight / 2 + verticalGap; // 定位在中心卡片下方

    setIndicatorStyle({
      left: `${indicatorX}px`,
      top: `${indicatorY}px`,
      opacity: entries.length >= MAX_ENTRIES ? 0 : 1, // 超出最大数量时隐藏
      pointerEvents: entries.length >= MAX_ENTRIES ? 'none' : 'auto',
    });

  }, [entries.length]); // 依赖项：仅在卡片数量变化时重新计算？不，目标索引变化也需要

  // --- useEffect 用于布局计算 和 聚焦 ---
  useEffect(() => {
    // 初始加载或 entries/activeCardIndex 变化时，重新计算布局
    const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
            applyCarouselLayout(activeCardIndex);

            // --- NEW: 尝试聚焦新激活卡片的 textarea ---
            // 使用另一个 setTimeout 确保 DOM 更新和 textarea 启用
            const focusTimeoutId = setTimeout(() => {
              const activeCardElement = cardElementsRef.current[activeCardIndex];
              if (activeCardElement) {
                // Use data-testid for selection instead of escaped class name
                const textarea = activeCardElement.querySelector<HTMLTextAreaElement>('[data-testid="bce-content-textarea"]');
                textarea?.focus();
              }
            }, 50); // 稍微延迟以等待 CSS 过渡和 DOM 更新
            // 保存 focus timeout id 以便清理
            focusTimeoutRef.current = focusTimeoutId;
        });
    }, 0); // 延迟以确保 DOM 更新

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
      if (focusTimeoutRef.current !== null) {
        clearTimeout(focusTimeoutRef.current);
      }
    };

  }, [entries, activeCardIndex, applyCarouselLayout]); // 保持依赖项

  // --- useEffect 用于处理窗口大小变化 ---
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => applyCarouselLayout(activeCardIndex));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeCardIndex, applyCarouselLayout]);

  // --- useEffect 用于添加初始卡片 ---
   useEffect(() => {
      if (!isInitialLayoutApplied.current && entries.length === 0) {
          handleAddNewEntryClick();
          isInitialLayoutApplied.current = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [entries.length]); // 依赖于 entries.length 来确保只运行一次

  // --- 添加和删除逻辑 ---
  const handleAddNewEntryClick = () => {
    if (entries.length >= MAX_ENTRIES) return;

    let newDate = new Date();
    if (entries.length > 0 && entries[entries.length - 1].date) {
        try {
            const lastEntryDate = new Date(entries[entries.length - 1].date + 'T00:00:00');
            newDate = new Date(lastEntryDate);
            newDate.setDate(newDate.getDate() + 1);
        } catch(e) {
             console.error("Error calculating next date:", e);
        }
    }

    const newEntry: EntryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: formatDateForInput(newDate),
      content: ''
    };

    const newArrayIndex = entries.length;
    // 清空旧引用，因为卡片数量变化了
    cardElementsRef.current = new Array(newArrayIndex + 1).fill(null);

    setEntries(prevEntries => [...prevEntries, newEntry]);
    setActiveCardIndex(newArrayIndex); // 聚焦新卡片
    // applyCarouselLayout 将在 useEffect 中因 entries 变化而触发
  };

  const removeEntry = (id: string) => {
    const indexToRemove = entries.findIndex(entry => entry.id === id);
    if (indexToRemove === -1) return;

    const newEntries = entries.filter(entry => entry.id !== id);
    // 清空旧引用
    cardElementsRef.current = new Array(newEntries.length).fill(null);

    setEntries(newEntries);

    // 调整 active index
    if (activeCardIndex > indexToRemove) {
        setActiveCardIndex(prev => prev - 1);
    } else if (activeCardIndex === indexToRemove && activeCardIndex >= newEntries.length) {
        setActiveCardIndex(Math.max(0, newEntries.length - 1));
    } else if (activeCardIndex >= newEntries.length) {
        setActiveCardIndex(Math.max(0, newEntries.length - 1));
    }
     // 如果删除的是当前活动的卡片，并且后面还有卡片，则保持索引不变（因为后面的卡片会移上来）
     // 如果删除的是最后一个卡片，上面的逻辑会处理
     // 如果删除的是活动卡片之前的卡片，上面的逻辑会处理
     // applyCarouselLayout 将在 useEffect 中因 entries 变化而触发
  };

  const handleCardClick = (index: number) => {
    console.log('Card clicked, setting active index to:', index); // 添加日志
    setActiveCardIndex(index);
    // applyCarouselLayout 将在 useEffect 中因 activeCardIndex 变化而触发
  };

  // --- 提交逻辑 ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 检查 nickname 是否存在
    if (!nickname) {
        alert('无法确定用户，请刷新页面或重新登录。');
        setIsSubmitting(false); // Reset submitting state
        return;
    }

    setIsSubmitting(true);
    const validEntries = entries.filter(entry => entry.content.trim() !== '');

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          validEntries.map(entry => ({
            nickname, // <-- Use nickname from context
            content: entry.content,
            date: new Date(entry.date + 'T00:00:00').toISOString(),
          }))
        ),
      });

      if (response.ok) {
        // Redirect using the context nickname
        router.push(`/?nickname=${encodeURIComponent(nickname)}`);
      } else {
        console.error('Failed to submit entries');
        alert('提交失败，请稍后重试');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting entries:', error);
      alert('提交过程中发生错误');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bce:page-container"> {/* Updated className */}
      {/* 居中头部 */}
      <div className="bce:centered-content"> {/* Updated className */}
        <div className="bce:main-header"> {/* Updated className */}
          <div className="bce:header-left"> {/* Updated className */}
              <icons.Calendar className="icon h-6 w-6" /> {/* Tailwind class, not from batch-entry */}
              <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
              上报好体验、好事儿、成就
              </span>
            <div className="bce:entry-count">{entries.length}/{MAX_ENTRIES} 组</div> {/* Updated className */}
          </div>
          <div className="bce:header-right"> {/* Updated className */}
            <button
              id="submit-btn" // ID remains unchanged
              className="bce:submit-btn" // Updated className
              onClick={handleSubmit}
              disabled={isSubmitting || entries.length === 0 || !entries.every(entry => entry.content.trim() !== '') || !nickname} // Add nickname check to disabled state
            >
              <div className="bce:submit-btn-inner"> {/* Updated className */}
                {isSubmitting ? (
                    <>
                      {/* Assuming loader-icon is defined in batch-entry.module.css */}
                      <icons.Loader2 className={`icon bce:loader-icon h-4 w-4`} /> {/* Combine Tailwind and Module */}
                      <span>提交中...</span>
                    </>
                ) : (
                  <>
                    <span className="bce:dot bce:dot-left"></span> {/* Updated className */}
                    <icons.Send className="icon h-4 w-4" /> {/* Tailwind class */}
                    <span>提交</span>
                    <span className="bce:dot bce:dot-right"></span> {/* Updated className */}
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 轮播区域 */}
      <div className="bce:carousel-wrapper"> {/* Updated className */}
        <div ref={entriesContainerRef} id="entries-container" className="bce:entries-container"> {/* Updated className */}
          {entries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              // 为 ref 回调添加类型
              ref={el => { cardElementsRef.current[index] = el as HTMLDivElement | null; }}
              entry={entry}
              index={index}
              isActive={index === activeCardIndex}
              style={cardStyles[index] || {}} // 应用计算出的样式
              onDateChange={updateEntryDate}
              onContentChange={updateEntryContent}
              onDelete={removeEntry}
              onClick={handleCardClick}
            />
          ))}

          {/* 活动指示器 / 添加按钮 (移到 container 内部) */}
          <div
            id="active-indicator" // ID remains unchanged
            className={`bce:active-indicator ${entries.length >= MAX_ENTRIES ? 'hidden' : ''}`.trim()} // Updated className
            style={indicatorStyle} // 应用计算出的样式
            title="添加记录 / 当前选中"
            onClick={handleAddNewEntryClick}
          >
            <div className="bce:indicator-circle"> {/* Updated className */}
              <div className="bce:indicator-inner"> {/* Updated className */}
                <div className="bce:indicator-action"> {/* Updated className */}
                  <icons.Plus />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- 页面主组件 ---
export default function NewEntryPage() {
  const [mounted, setMounted] = useState(false);

  // 确保组件只在客户端渲染，因为用到了 window 和 DOM 操作
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 可以显示一个骨架屏或加载指示器
    return <div className="min-h-screen flex items-center justify-center">加载交互界面...</div>;
  }

  return (
    // Suspense 用于处理 Next.js 的 useSearchParams
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <NewEntryContent />
    </Suspense>
  );
}