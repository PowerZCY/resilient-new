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

  // Effect for initial user matching and URL sync (runs once after loaded)
  useEffect(() => {
    if (!isLoaded || !isInitialLoad.current) return; // Only run once after loaded

    const urlNickname = searchParams.get('nickname');

    // If URL already has a nickname, respect it. State is already set by useState initializer.
    if (urlNickname) {
       console.log("Initial load: Respecting URL nickname:", urlNickname);
       setNickname(urlNickname); // Ensure state matches URL if different from default
       isInitialLoad.current = false; // Mark initial sync as done
       return;
    }

    // If no URL nickname, try matching logged-in user
    let determinedNickname = defaultNickname;
    if (isSignedIn && user) {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      const matchedUser = users.find(u => u.email === userEmail);
      if (matchedUser) {
        determinedNickname = matchedUser.name;
        console.log("Initial load: Matched logged-in user:", determinedNickname);
      } else {
         console.log("Initial load: Logged-in user not matched, using default:", determinedNickname);
      }
    } else {
       console.log("Initial load: User not logged in, using default:", determinedNickname);
    }

    // Update state and URL if determined nickname differs from initial default state
    if (determinedNickname !== nickname) {
       setNickname(determinedNickname);
    }
    // Update URL to reflect the determined nickname (even if it's the default)
    console.log("Initial load: Syncing URL to:", determinedNickname);
    router.replace(`/?nickname=${encodeURIComponent(determinedNickname)}`, { scroll: false });


    isInitialLoad.current = false; // Mark initial sync as done

  }, [isLoaded, isSignedIn, user, searchParams, router, nickname]); // Add nickname to deps for initial state check


  // Function to update nickname state AND push to URL
  const setAndPushNickname = useCallback((newNickname: string) => {
    if (newNickname === nickname) return; // Avoid unnecessary updates

    setNickname(newNickname); // Update state
    router.push(`/?nickname=${encodeURIComponent(newNickname)}`, { scroll: false }); // Update URL
  }, [nickname, router]);


  const value = {
    nickname,
    setAndPushNickname,
    availableUsers: users // Provide users array via context
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
