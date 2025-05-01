'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from "@clerk/nextjs";
import { useNickname } from '@/context/NicknameContext';
import ClerkLogoIcon from '@/components/icons/ClerkLogoIcon';
import UserIcon from '@/components/icons/UserIcon';
import { type JSX } from 'react';

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
    <div className="flex items-center">
      <div className="relative flex items-center rounded-full px-5 py-1.5 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="absolute inset-0 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-xs opacity-50"></div>
        
        <div className="relative z-10 mr-5 flex items-center">
          {isLoaded && isSignedIn ? (
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
                {<UserButton.Link 
                  labelIcon={<ClerkLogoIcon />}
                  label="服务条款"
                  href="/legal/terms">
                </UserButton.Link>}
                {<UserButton.Link 
                  labelIcon={<UserIcon />}
                  label="隐私政策"
                  href="/legal/privacy">
                </UserButton.Link>}
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          )}
        </div>
        
        {availableUsers.map((user) => {
          const isActive = nickname === user.name;
          
          return (
            <motion.button
              key={user.name}
              onClick={() => handleFilter(user.name)}
              className={`relative z-10 px-4 h-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center min-w-[120px] box-border ${
                isActive 
                  ? 'bg-white text-purple-900 shadow-md' 
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div 
                  className="w-3 h-3 rounded-full mr-2 shrink-0"
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