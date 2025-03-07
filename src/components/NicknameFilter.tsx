'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

// 定义用户数据，包括名称和对应的颜色
const users = [
  { name: 'Zia慢成', color: '#4f46e5' }, // 靛蓝色
  { name: '帝八哥', color: '#ec4899' },  // 粉色
];

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
  }, [router, defaultNickname, searchParams]);

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

  // 获取当前选中用户的颜色
  const activeUserColor = users.find(user => user.name === nickname)?.color || users[0].color;

  return (
    <div className="flex items-center">
      <div className="relative flex rounded-full p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-sm opacity-50"></div>
        
        {/* 用户图标 */}
        <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 mr-1">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <User className="h-5 w-5" style={{ color: activeUserColor }} />
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{ 
                  boxShadow: [
                    `0 0 0 rgba(${activeUserColor}, 0)`,
                    `0 0 8px rgba(${activeUserColor}, 0.5)`,
                    `0 0 0 rgba(${activeUserColor}, 0)`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
        
        {users.map((user) => {
          const isActive = nickname === user.name;
          
          return (
            <motion.button
              key={user.name}
              onClick={() => handleFilter(user.name)}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center min-w-[120px] ${
                isActive 
                  ? 'bg-white text-purple-900 shadow-md' 
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: user.color }}
                  layoutId="activeUserDot"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className={isActive ? "" : ""}>{user.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}