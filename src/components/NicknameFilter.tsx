'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from "@clerk/nextjs";
import { useNickname } from '@/context/NicknameContext';
import { type JSX } from 'react';
import { globalLucideIcons as icons } from '@/components/global-icon';

export default function NicknameFilter(): JSX.Element {
  const { nickname, setAndPushNickname, availableUsers } = useNickname();
  const { isLoaded, isSignedIn } = useUser();

  const handleFilter = useCallback(
    (value: string): void => {
      console.log('User manually selected nickname:', value);
      setAndPushNickname(value);
    },
    [setAndPushNickname]
  );

  return (
    <div className="ms-1.5 flex items-center h-10">
      <div className="relative flex items-center rounded-full px-2 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg h-10">
        <div className="absolute inset-0 border bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-xs opacity-50"></div>
        <div className="relative z-10 mr-2 flex items-center w-8 h-8 overflow-hidden">
          {isLoaded && isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 border",
                }
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Action label="manageAccount" />
                {<UserButton.Link 
                  labelIcon={<icons.ReceiptText className="size-4 fill-none stroke-[var(--clerk-icon-stroke-color)]" />}
                  label="服务条款"
                  href="/legal/terms">
                </UserButton.Link>}
                {<UserButton.Link 
                  labelIcon={<icons.ShieldUser className="size-4 fill-none stroke-[var(--clerk-icon-stroke-color)]" />}
                  label="隐私政策"
                  href="/legal/privacy">
                </UserButton.Link>}
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <div className="w-full h-full rounded-full border bg-gray-200 animate-pulse"></div>
          )}
        </div>
        
        {availableUsers.map((user) => {
          const isActive = nickname === user.name;
          
          return (
            <motion.button
              key={user.name}
              onClick={() => handleFilter(user.name)}
              className={`relative z-10 px-3 h-8 w-24 rounded-full transition-all duration-200 flex items-center justify-center box-border ${
                isActive 
                  ? 'bg-white text-purple-900 shadow-md' 
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div 
                  className="w-3 h-3 rounded-full mr-1 shrink-0"
                  style={{ backgroundColor: user.color }}
                  layoutId="activeUserDot"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span>{user.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}