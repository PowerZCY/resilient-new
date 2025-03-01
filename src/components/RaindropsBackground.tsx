'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Raindrop {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
  blur: number;
  swing: number;
}

export default function RaindropsBackground() {
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isInitialized = useRef<boolean>(false);
  const lastTime = useRef<number>(0);

  // 生成雨滴
  const generateRaindrops = (count: number, width: number, height: number) => {
    const drops: Raindrop[] = [];
    for (let i = 0; i < count; i++) {
      drops.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height * -1, // 从屏幕上方开始
        size: Math.random() * 3 + 1.5, // 1.5-4.5px，增加了雨滴大小
        speed: Math.random() * 1.5 + 0.5, // 0.5-2px，增加了速度
        opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8，大幅增加了透明度
        delay: Math.random() * 5, // 0-5秒延迟，减少了延迟
        blur: Math.random() * 1.5, // 0-1.5px模糊，减少了模糊效果以增强可见性
        swing: Math.random() * 2 - 1 // -1到1之间的摇摆幅度
      });
    }
    return drops;
  };

  // 更新雨滴位置
  const updateRaindrops = (timestamp: number) => {
    if (!containerRef.current) return;
    
    const { width, height } = dimensions;
    const deltaTime = timestamp - (lastTime.current || timestamp);
    lastTime.current = timestamp;
    
    // 确保deltaTime合理，防止过大的跳跃
    const normalizedDelta = Math.min(deltaTime, 100) / 16.67;
    
    setRaindrops(prev => 
      prev.map(drop => {
        // 更新位置，使用deltaTime使动画更平滑
        const newY = drop.y + drop.speed * normalizedDelta;
        
        // 添加轻微的水平摇摆
        const swingOffset = Math.sin(timestamp / 1000 + drop.id) * drop.swing;
        
        // 如果雨滴超出屏幕底部，重置到顶部
        if (newY > height) {
          return {
            ...drop,
            y: -drop.size * 4, // 重置到屏幕上方
            x: Math.random() * width, // 随机水平位置
            speed: Math.random() * 1.5 + 0.5, // 重新随机速度
            opacity: Math.random() * 0.5 + 0.3, // 重新随机透明度，增强了可见性
            swing: Math.random() * 2 - 1 // 重新随机摇摆幅度
          };
        }
        
        return {
          ...drop,
          y: newY,
          x: drop.x + swingOffset * 0.1 // 添加轻微的水平摇摆
        };
      })
    );
    
    animationRef.current = requestAnimationFrame(updateRaindrops);
  };

  // 初始化和调整大小
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        if (!isInitialized.current) {
          // 初次设置雨滴 - 增加数量以确保效果可见
          const initialRaindrops = generateRaindrops(120, width, height);
          setRaindrops(initialRaindrops);
          isInitialized.current = true;
        }
      }
    };

    // 初始化
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 开始动画
  useEffect(() => {
    if (raindrops.length > 0 && !animationRef.current) {
      animationRef.current = requestAnimationFrame(updateRaindrops);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [raindrops]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute rounded-full"
          style={{
            left: `${drop.x}px`,
            top: `${drop.y}px`,
            width: `${drop.size}px`,
            height: `${drop.size * 5}px`, // 拉长形成水滴形状
            opacity: drop.opacity,
            filter: `blur(${drop.blur}px)`,
            background: `linear-gradient(to bottom, rgba(100, 181, 246, 0.9), rgba(33, 150, 243, 0.7))`, // 更鲜艳的蓝色
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', // 水滴形状
            boxShadow: `0 0 2px rgba(255, 255, 255, 0.5)`, // 添加轻微发光效果
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: drop.opacity,
            transition: { 
              delay: drop.delay,
              duration: 1.5, // 减少了动画时间
              ease: "easeOut"
            }
          }}
        />
      ))}
    </div>
  );
} 