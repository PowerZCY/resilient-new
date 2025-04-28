'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserButton } from "@clerk/nextjs";

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

  // Clerk Logo Icon
  // const ClerkLogoIcon = () => {
  //   return (
  //     <svg
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M12.001 15.75C14.072 15.75 15.7509 14.0711 15.7509 12C15.7509 9.92893 14.072 8.25 12.001 8.25C9.9299 8.25 8.25098 9.92893 8.25098 12C8.25098 14.0711 9.9299 15.75 12.001 15.75Z"
  //         fill="#131316"
  //       />
  //       <path
  //         d="M18.7586 20.8788C19.0777 21.1978 19.0457 21.726 18.6708 21.9772C16.7634 23.2548 14.4693 23.9998 12.0012 23.9998C9.533 23.9998 7.23887 23.2548 5.33148 21.9772C4.95661 21.726 4.92457 21.1978 5.24363 20.8788L7.98407 18.1382C8.23176 17.8906 8.61599 17.8514 8.92775 18.0112C9.84956 18.4834 10.8942 18.7498 12.0012 18.7498C13.1081 18.7498 14.1528 18.4834 15.0746 18.0112C15.3864 17.8514 15.7705 17.8906 16.0182 18.1382L18.7586 20.8788Z"
  //         fill="#131316"
  //       />
  //       <path
  //         d="M18.6696 2.02275C19.0445 2.27385 19.0765 2.80207 18.7575 3.12112L16.0171 5.86159C15.7693 6.10926 15.3851 6.14838 15.0733 5.98868C14.1515 5.51644 13.1069 5.25 11.9999 5.25C8.27204 5.25 5.24997 8.27208 5.24997 12C5.24997 13.1069 5.51641 14.1516 5.98865 15.0735C6.14836 15.3852 6.10924 15.7693 5.86156 16.0171L3.12111 18.7576C2.80205 19.0765 2.27384 19.0445 2.02273 18.6697C0.745143 16.7623 0 14.4681 0 12C0 5.37258 5.37256 0 11.9999 0C14.4681 0 16.7623 0.745147 18.6696 2.02275Z"
  //         fill="#131316"
  //         fillOpacity="0.5"
  //       />
  //     </svg>
  //   )
  // }

  // Nextjs Logo Icon
  // const UserIcon = () => {
  //   return (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       fill="none"
  //       viewBox="0 0 24 24"
  //     >
  //       <g clipPath="url(#clip0_29_46694)">
  //         <mask
  //           id="mask0_29_46694"
  //           style={{ maskType: "alpha" }}
  //           width="24"
  //           height="24"
  //           x="0"
  //           y="0"
  //           maskUnits="userSpaceOnUse"
  //         >
  //           <path
  //             fill="#000"
  //             d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
  //           ></path>
  //         </mask>
  //         <g mask="url(#mask0_29_46694)">
  //           <path
  //             fill="#000"
  //             d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
  //           ></path>
  //           <path
  //             fill="url(#paint0_linear_29_46694)"
  //             d="M19.935 21.003L9.219 7.2H7.2v9.596h1.615V9.251l9.852 12.728c.444-.297.868-.624 1.268-.976z"
  //           ></path>
  //           <path
  //             fill="url(#paint1_linear_29_46694)"
  //             d="M16.934 7.2h-1.6v9.6h1.6V7.2z"
  //           ></path>
  //         </g>
  //       </g>
  //       <defs>
  //         <linearGradient
  //           id="paint0_linear_29_46694"
  //           x1="14.534"
  //           x2="19.267"
  //           y1="15.533"
  //           y2="21.4"
  //           gradientUnits="userSpaceOnUse"
  //         >
  //           <stop stopColor="#fff"></stop>
  //           <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
  //         </linearGradient>
  //         <linearGradient
  //           id="paint1_linear_29_46694"
  //           x1="16.134"
  //           x2="16.107"
  //           y1="7.2"
  //           y2="14.25"
  //           gradientUnits="userSpaceOnUse"
  //         >
  //           <stop stopColor="#fff"></stop>
  //           <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
  //         </linearGradient>
  //         <clipPath id="clip0_29_46694">
  //           <path fill="#fff" d="M0 0H24V24H0z"></path>
  //         </clipPath>
  //       </defs>
  //     </svg>
  //   )
  // }

  return (
    <div className="flex items-center">
      <div className="relative flex items-center rounded-full p-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-sm opacity-50"></div>
        
        {/* 用户图标 - 替换为 UserButton */}
        {/* https://nextjs-auth-starter-template-kit.vercel.app/ */}
        <div className="relative z-10 mr-1 flex items-center">
          <UserButton 
            afterSignOutUrl='/'
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                }
              }}
          >
            <UserButton.MenuItems>
              <UserButton.Action label="manageAccount" />
              {/* <UserButton.Link 
                labelIcon={<ClerkLogoIcon />}
                label="Manage organization"
                href="/organization-switcher">
              </UserButton.Link> */}
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
        
        {users.map((user) => {
          const isActive = nickname === user.name;
          
          return (
            <motion.button
              key={user.name}
              onClick={() => handleFilter(user.name)}
              className={`relative z-10 px-10 py-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center min-w-[120px] ${
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