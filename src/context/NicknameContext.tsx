'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { appConfig, UserData } from '@/lib/appConfig'; // Assuming appConfig is accessible here

// Define users based on appConfig
const users: UserData[] = appConfig.clerk.user;
const defaultNickname = appConfig.clerk.user[0].name; // Or your preferred default

interface NicknameContextType {
  nickname: string;
  setAndPushNickname: (newNickname: string) => void;
  availableUsers: UserData[]; // Make users available if needed elsewhere
  isNicknameInitialized: boolean; // <--- 添加初始化状态
}

const NicknameContext = createContext<NicknameContextType | undefined>(undefined);

export const NicknameProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded, isSignedIn } = useUser();
  const isInitialLoad = useRef(true); // Track initial load

  // Initialize state: URL param > default
  const [nickname, setNickname] = useState<string>(() => {
    return searchParams.get('nickname') || defaultNickname;
  });
  const [isNicknameInitialized, setIsNicknameInitialized] = useState(false); // <--- 初始化状态 state

  // Effect for initial user matching and URL sync (runs once after loaded)
  useEffect(() => {
    if (!isLoaded || !isInitialLoad.current) {
      if (isLoaded && !isInitialLoad.current) {
         setIsNicknameInitialized(true);
      }
      return;
    }

    // console.log("NicknameContext Initial Load Effect Triggered");

    const urlNickname = searchParams.get('nickname');
    let determinedNickname = nickname; // Start with current state (URL or default)
    let needsUrlUpdate = false;

    if (urlNickname) {
      // console.log("Initial load: Respecting URL nickname:", urlNickname);
      if (urlNickname !== nickname) {
         setNickname(urlNickname);
         determinedNickname = urlNickname; // Update determined for consistency
      }
    } else if (isSignedIn && user) {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      // console.log("Initial load: User email:", userEmail);
      // console.log("Initial load: Users:", users);
      const matchedUser = userEmail ? users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase()) : undefined;
      if (matchedUser && matchedUser.name !== nickname) {
         determinedNickname = matchedUser.name;
         // console.log("Initial load: Matched logged-in user:", determinedNickname);
         setNickname(determinedNickname); // Update state
         needsUrlUpdate = true; // Need to add nickname to URL
      } else if (matchedUser) {
          // console.log("Initial load: Matched user same as initial, no state change needed.");
          determinedNickname = matchedUser.name; // Keep determined consistent
          needsUrlUpdate = true; // Still need to sync URL if it was missing
      } else {
         // console.log("Initial load: Logged-in user not matched, using current state:", determinedNickname);
         if (determinedNickname === defaultNickname) {
            needsUrlUpdate = true;
         }
      }
    } else {
       // console.log("Initial load: User not logged in, using current state:", determinedNickname);
       if (determinedNickname === defaultNickname) {
         needsUrlUpdate = true;
       }
    }

    if (needsUrlUpdate) {
       // console.log("Initial load: Syncing URL to:", determinedNickname);
       router.replace(`/?nickname=${encodeURIComponent(determinedNickname)}`, { scroll: false });
    }

    isInitialLoad.current = false; // Mark initial processing as done
    setIsNicknameInitialized(true); // <--- 标记初始化完成

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user, searchParams, router]); // Remove nickname from deps to prevent loops


  // Function to update nickname state AND push to URL
  const setAndPushNickname = useCallback((newNickname: string) => {
    if (newNickname === nickname) return;

    setNickname(newNickname);
    if (!isNicknameInitialized) setIsNicknameInitialized(true);
    router.push(`/?nickname=${encodeURIComponent(newNickname)}`, { scroll: false });
  }, [nickname, router, isNicknameInitialized]);


  const value = {
    nickname,
    setAndPushNickname,
    availableUsers: users,
    isNicknameInitialized // <--- 提供初始化状态
   };

  return (
    <NicknameContext.Provider value={value}>
      {children}
    </NicknameContext.Provider>
  );
};

// Custom hook to use the NicknameContext
export const useNickname = (): NicknameContextType => {
  const context = useContext(NicknameContext);
  if (context === undefined) {
    throw new Error('useNickname must be used within a NicknameProvider');
  }
  return context;
};
