'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserButton } from "@clerk/nextjs";
import { useNickname } from '@/context/NicknameContext';

export default function NicknameFilter(): JSX.Element {
  const { nickname, setAndPushNickname, availableUsers } = useNickname();

  const handleFilter = useCallback(
    (value: string): void => {
      console.log('User manually selected nickname:', value);
      setAndPushNickname(value);
    },
    [setAndPushNickname]
  );

  return (
    <div className="flex items-center">
      <div className="relative flex items-center rounded-full p-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-sm opacity-50"></div>
        
        <div className="relative z-10 mr-1 flex items-center">
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
              }
            }}
          />
        </div>
        
        {availableUsers.map((user) => {
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