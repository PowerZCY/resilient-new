/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Keep for modal/progress indicator animations
import { Heart, Star } from 'lucide-react'; // Import icons
import '../styles/timeline-card.css'; // Import the new CSS
import { useNickname } from '@/context/NicknameContext'; // <-- Import useNickname

interface Entry {
  id: string;
  date: string;
  content: string;
  page: number;
  isPlaceholder?: boolean;
  globalIndex?: number;
}

interface ApiResponse {
  entries: { id: string; date: string; content: string }[];
  total: number;
}

// --- Constants from prototype ---
const RADIUS = 550; // 环绕半径
const VISIBLE_CARDS = 10; // 可见卡片数量 (调整此值影响角度)
const VISIBLE_ANGLE = Math.PI * 0.8; // 可见角度范围 (调整此值影响卡片间距)
const LINES_TO_SHOW = 6; // For content truncation CSS variable `--lines-to-show`
const LINE_HEIGHT = 1.6; // For content truncation calculation
const PAGE_SIZE = 10; // Define page size consistent with prototype

// --- Helper Functions ---

// Format date (keep existing, maybe adjust format if needed)
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if invalid
    }
    // Use prototype format "YYYY年M月D日"
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Return original on error
  }
};

// Check if content needs fade effect (based on line count)
const checkNeedFade = (content: string): boolean => {
  const lines = content.split(/\r\n|\n|\r/).length;
  // Simple check, might need refinement based on actual rendering height
  // Or better, rely purely on CSS overflow and gradient if possible
  // For now, let's estimate based on line count vs LINES_TO_SHOW
  return lines > LINES_TO_SHOW;
};

// --- Smart Pagination Component ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loadingPage: number | null;
  maxVisibleButtons?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loadingPage,
  maxVisibleButtons = 11, // Default to 11 visible buttons
}) => {
  const renderPageButtons = () => {
    if (totalPages <= 0) return null;

    const buttons: (number | string)[] = [];
    const halfVisible = Math.floor((maxVisibleButtons - 2) / 2); // Subtract 1 and totalPages, then halve

    if (totalPages <= maxVisibleButtons) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show first page
      buttons.push(1);

      // Ellipsis after first page?
      let startPage = Math.max(2, currentPage - halfVisible);
      let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      // Adjust range if currentPage is near the beginning
      if (currentPage - halfVisible <= 2) {
          endPage = Math.min(totalPages - 1, maxVisibleButtons - 2); // Show 1, then max-2 buttons
      }
      // Adjust range if currentPage is near the end
      if (currentPage + halfVisible >= totalPages - 1) {
          startPage = Math.max(2, totalPages - (maxVisibleButtons - 3)); // Show totalPages, then max-3 before it
      }

       // Add start ellipsis if needed
       if (startPage > 2) {
           buttons.push('...');
       }

      // Add middle page numbers
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }

       // Add end ellipsis if needed
       if (endPage < totalPages - 1) {
           buttons.push('...');
       }

      // Show last page
      buttons.push(totalPages);
    }

    return buttons.map((page, index) => {
      const isEllipsis = typeof page === 'string';
      const pageNum = page as number; // Cast for use, check isEllipsis first
      const isLoading = loadingPage === pageNum;
  
  return (
        <button
          key={isEllipsis ? `ellipsis-${index}` : `page-${page}`}
          className={`nav-btn ${currentPage === pageNum && !isEllipsis ? 'active' : ''} ${isEllipsis ? 'ellipsis' : ''}`}
          onClick={() => !isEllipsis && onPageChange(pageNum)}
          disabled={isEllipsis || isLoading}
          style={isEllipsis ? { cursor: 'default', opacity: 0.5, border: 'none' } : {}}
        >
          {isLoading ? (
             // Simple loading indicator
             <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          ) : ( page )}
        </button>
  );
});
  };

  return <>{renderPageButtons()}</>;
};

// --- Main Timeline Component ---
export default function Timeline(): JSX.Element {
  // --- State ---
  const [entries, setEntries] = useState<Entry[]>([]); // All loaded entries
  const [loading, setLoading] = useState<boolean>(false); // Loading state for API calls
  const [totalCount, setTotalCount] = useState<number>(0); // Total entries from API
  const [activePage, setActivePage] = useState<number>(1); // Currently displayed page/group in carousel
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0); // Index of the focused card *within the active page*
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal state
  const [modalContent, setModalContent] = useState<{ date: string; content: string } | null>(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState<boolean>(false);
  const [loadingPage, setLoadingPage] = useState<number | null>(null); // Track page being loaded via button click

  // --- Refs ---
  const loadedPages = useRef<Set<number>>(new Set()); // Keep track of loaded pages
  const isLoadingRef = useRef<boolean>(false); // Prevent concurrent fetches
  const initialLoadDone = useRef<boolean>(false); // Track initial load completion
  const carouselGroupRefs = useRef<(HTMLDivElement | null)[]>([]); // Refs for each page group
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({}); // Refs for individual cards (keyed by entry.id)
  const progressIndicatorRef = useRef<HTMLDivElement | null>(null); // Ref for progress indicator
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // For progress drag offset
  const dragOverlayRef = useRef<HTMLDivElement | null>(null); // Ref for drag overlay
  const isPageNavigatingRef = useRef<boolean>(false); // Ref to track if navigation triggered the effect

  // --- Hooks ---
  const { nickname, isNicknameInitialized } = useNickname(); // <-- Get nickname and initialized status
  const limit: number = PAGE_SIZE; // Use PAGE_SIZE constant

  // --- Data Fetching (Adapted from original) ---
  const fetchEntries = useCallback(
    async (pageNum: number): Promise<void> => {
      // Guard against fetching if context isn't ready, nickname is missing, already loading, or page is loaded
      if (!isNicknameInitialized || !nickname || isLoadingRef.current || loadedPages.current.has(pageNum)) {
        console.log(`Timeline: Skipping fetch: page=${pageNum}, initialized=${isNicknameInitialized}, nickname=${nickname}, loading=${isLoadingRef.current}, loaded=${loadedPages.current.has(pageNum)}`);
        // If context is initialized but no nickname, ensure loading state is false
        if (isNicknameInitialized && !nickname) {
           setLoading(false); // Stop loading if there's no user to fetch for
           setTotalCount(0);
           setEntries([]); // Clear entries
           loadedPages.current.clear();
           initialLoadDone.current = true; // Mark as done even if no data
        }
        // Ensure initial setup happens even if page 1 is already "loaded" but not marked done
        else if (pageNum === 1 && loadedPages.current.has(pageNum) && !initialLoadDone.current) {
           initialLoadDone.current = true;
           setActivePage(1);
           setActiveCardIndex(0);
        }
        return;
      }

      console.log(`Timeline: Fetching data: page=${pageNum}, nickname=${nickname}`);
      isLoadingRef.current = true;
      setLoading(true); // Keep original loading state for skeleton/indicator

      try {
        const res = await fetch(
          `/api/entries?nickname=${encodeURIComponent(nickname)}&page=${pageNum}&limit=${limit}`
        );

        if (!res.ok) {
          throw new Error(`API request failed: ${res.status}`);
        }

        const data: ApiResponse = await res.json();
        const total: number = data.total || 0;
        // Ensure totalCount is always set after a successful API call metadata retrieval,
        // even if entry fetching part is skipped later.
        setTotalCount(total);
        console.log(`Data received: page=${pageNum}, count=${data.entries.length}, total=${total}`);

        // Now check if we actually need to process entries (if page wasn't loaded before)
        if (loadedPages.current.has(pageNum)) {
            console.log(`Page ${pageNum} already loaded, skipping entry processing but ensuring totalCount is set.`);
            isLoadingRef.current = false; // Ensure loading state is reset
            setLoading(false);
            if (pageNum === 1) initialLoadDone.current = true; // Ensure initial load flag is set
            return; // Skip the rest if page data already exists
        }

        // --- Process new entries only if page is new ---
        const newEntries: Entry[] = (data.entries || []).map(entry => ({
          ...entry,
          page: pageNum, // Tag entries with their page number
        }));

        setEntries((prev) => {
          const combined = [...prev, ...newEntries];
          // Use a Map to ensure uniqueness based on ID
          const uniqueMap = new Map(combined.map(e => [e.id, e]));
          // Calculate globalIndex after deduplication
          const uniqueEntries = Array.from(uniqueMap.values()).map((entry, index) => ({
            ...entry,
            globalIndex: index + 1, // Assign 1-based global index
          }));
          return uniqueEntries;
        });

        loadedPages.current.add(pageNum);

        if (pageNum === 1) {
          initialLoadDone.current = true;
          setActivePage(1); // Ensure first page is active after fetch
           // Calculate middle index - CHANGE: Set index to 0 for the first card
           const targetIndex = 0; // Activate the first card
           setActiveCardIndex(targetIndex);
           console.log(`Initial load done. Active page: 1, Active card index: ${targetIndex}`);
        }

      } catch (error: unknown) {
        console.error('Error fetching entries:', error);
        // Optionally handle fetch errors (e.g., show error message)
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nickname, limit, entries.length, isNicknameInitialized] // Add isNicknameInitialized and fetchEntries
  );

  // --- Initial Load & Nickname Change ---
  useEffect(() => {
    console.log('Nickname changed or initial mount:', nickname);
    // Reset state on nickname change
    setEntries([]);
    setActivePage(1);
    setActiveCardIndex(0);
    setLoading(false); // Set loading false initially
    initialLoadDone.current = false;
    loadedPages.current.clear();
    isLoadingRef.current = false;
    cardRefs.current = {}; // Clear card refs

    // If context is initialized but nickname is missing (e.g., user not matched)
    if (!nickname) {
        console.log('Timeline: NicknameContext initialized, but no nickname available.');
        setLoading(false); // Not loading data
        // State reset already happened above
        return;
    }

    // Context initialized and nickname exists, proceed with fetch
    console.log('Timeline: NicknameContext initialized, fetching data for', nickname);
    isPageNavigatingRef.current = true;
    setLoading(true);
    fetchEntries(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, isNicknameInitialized]);

  // --- Placeholder Padding Function ---
  const padWithPlaceholders = (entriesInGroup: Entry[], pageNum: number, targetSize: number): Entry[] => {
    const placeholdersNeeded = targetSize - entriesInGroup.length;
    if (placeholdersNeeded <= 0) {
      return entriesInGroup;
    }
    const placeholders: Entry[] = Array.from({ length: placeholdersNeeded }, (_, i) => ({
      id: `placeholder-${pageNum}-${entriesInGroup.length + i}`,
      date: "Z年C月Y日", // Placeholder date
      content: "Coming Soon...", // Placeholder content
      page: pageNum,
      isPlaceholder: true,
    }));
    return [...entriesInGroup, ...placeholders];
  };

  // --- Grouped Entries for Carousel ---
  const groupedEntries = useMemo(() => {
    const groups: Record<number, Entry[]> = {};
    entries.forEach(entry => {
      if (!groups[entry.page]) {
        groups[entry.page] = [];
      }
      groups[entry.page].push(entry);
    });

    // Ensure all loaded pages are present, even if empty initially before padding
    const allLoadedPageNumbers = Array.from(loadedPages.current);
    allLoadedPageNumbers.forEach(pageNum => {
        if (!groups[pageNum]) {
            groups[pageNum] = []; // Ensure group exists even if API returned no entries for it yet
        }
    }); // Correctly close forEach

    // Sort groups by page number and pad with placeholders
    return Object.entries(groups)
                 .sort(([pageNumA], [pageNumB]) => parseInt(pageNumA) - parseInt(pageNumB))
                 .map(([pageNumStr, entriesInGroup]) => {
                     const pageNum = parseInt(pageNumStr);
                     // Pad each group to PAGE_SIZE
                     const paddedEntries = padWithPlaceholders(entriesInGroup, pageNum, PAGE_SIZE); // Use PAGE_SIZE
                     return {
                         page: pageNum,
                         entries: paddedEntries // Use padded entries
                     };
                 });
  }, [entries]);

  // --- 3D Carousel Logic ---
  useEffect(() => {
    console.log(`Carousel Effect: ActivePage=${activePage}, ActiveCardIndex=${activeCardIndex}`);
    const activeGroupData = groupedEntries.find(g => g.page === activePage);
    if (!activeGroupData || activeGroupData.entries.length === 0) {
        console.log("Carousel Effect: No active group data or empty group.");
        return; // No group or no cards in the active group
    }

    const cardsInGroup = activeGroupData.entries;
    const currentTargetIndex = activeCardIndex; // The card that should be in the center (should be 0 after page nav)

    // --- Apply Transforms with Delay ---
    const animationFrameId = requestAnimationFrame(() => {
      const playEntryAnimation = isPageNavigatingRef.current;
      console.log(`Carousel Effect (apply): Play entry animation: ${playEntryAnimation}`);

      cardsInGroup.forEach((entry, index) => {
        const cardElement = cardRefs.current[entry.id];
        if (!cardElement) {
          console.warn(`Carousel Effect: Card element not found for ID: ${entry.id} during transform application.`);
        return;
      }

        // Calculate final target state (position, opacity, z-index)
        let relativePos = index - currentTargetIndex;
        const groupSize = cardsInGroup.length;
        if (groupSize > 1) { 
            if (relativePos > groupSize / 2) relativePos -= groupSize;
            if (relativePos < -groupSize / 2) relativePos += groupSize;
        }
        const angleDivisor = Math.min(VISIBLE_CARDS, groupSize) || 1;
        const angle = relativePos * (VISIBLE_ANGLE / angleDivisor);
        const finalX = Math.sin(angle) * RADIUS;
        const finalY = -40 + Math.abs(relativePos) * 15; // Adjusted Y to prevent overlap based on distance
        const finalZ = Math.cos(angle) * RADIUS * 0.6;
        const finalRotateY = -angle * 0.8;
        const finalTransform = `translate3d(${finalX}px, ${finalY}px, ${finalZ}px) rotateY(${finalRotateY}rad)`;
        const finalZIndex = 100 - Math.abs(relativePos) * 10;
        const finalOpacity = Math.max(0.1, 1 - Math.min(Math.abs(relativePos), 5) * 0.18); // Adjusted opacity fade-off

        // Apply styles based on whether navigation triggered this
        if (playEntryAnimation) {
            // *** PAGE NAVIGATION ANIMATION ***
            cardElement.style.transition = 'none'; // Reset transitions first

            if (index === currentTargetIndex) {
                // ** Middle Card Entry Animation **
                // Initial state (from bottom-center, scaled down, rotated)
                cardElement.style.opacity = '0';
                // Translate relative to its final position for a smoother effect
                cardElement.style.transform = `translate3d(${finalX}px, ${finalY + 150}px, ${finalZ - 300}px) scale(0.3) rotateY(45deg)`;
                cardElement.style.zIndex = '200'; // Highest z-index during animation
            } else {
                // ** Other Cards Initial State (for wave) **
                // Initial state (slightly below final, scaled down)
                cardElement.style.opacity = '0';
                // Translate relative to its final position
                cardElement.style.transform = `translate3d(${finalX}px, ${finalY + 50}px, ${finalZ - 80}px) scale(0.7) rotateY(${finalRotateY}rad)`;
                cardElement.style.zIndex = finalZIndex.toString(); // Use calculated final zIndex
            }

            // Force reflow to apply initial state before transition
            void cardElement.offsetHeight;

            // Apply transitions to final state
            if (index === currentTargetIndex) {
                // Middle Card Transition (longer duration, bouncy easing)
                cardElement.style.transition = `transform 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.6s ease-out`;
                cardElement.style.opacity = finalOpacity.toString();
                cardElement.style.transform = finalTransform;
                // Let zIndex transition quickly back to normal after transform animation starts
                 cardElement.style.zIndex = finalZIndex.toString();
            } else {
                // Other Cards Transition (wave effect with delay)
                // Delay starts after middle card animation begins (e.g., 0.3s)
                const delay = Math.abs(relativePos) * 0.12 + 0.3; // Increased delay difference
                cardElement.style.transition = `transform 0.6s ${delay}s ease-out, opacity 0.5s ${delay}s ease-out`;
                cardElement.style.opacity = finalOpacity.toString();
                cardElement.style.transform = finalTransform;
                // zIndex is already set
            }
             cardElement.style.pointerEvents = Math.abs(relativePos) > Math.floor(VISIBLE_CARDS / 2) ? 'none' : 'auto';

        } else {
          // *** FOCUS SHIFT ANIMATION (Existing Logic) ***
          cardElement.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
          cardElement.style.opacity = finalOpacity.toString();
          cardElement.style.transform = finalTransform;
          cardElement.style.zIndex = finalZIndex.toString();
          cardElement.style.pointerEvents = Math.abs(relativePos) > Math.floor(VISIBLE_CARDS / 2) ? 'none' : 'auto';
        }

        // Update active class (applies regardless of animation)
        if (index === currentTargetIndex && !entry.isPlaceholder) {
            cardElement.classList.add('active');
        } else {
            cardElement.classList.remove('active');
        }
      }); // End forEach card

      // Reset the navigation flag after applying styles for this run
      if (playEntryAnimation) {
          isPageNavigatingRef.current = false;
      }
    }); // End requestAnimationFrame

    // Cleanup function to cancel the animation frame if the effect re-runs
    return () => cancelAnimationFrame(animationFrameId);

    // Ensure dependencies correctly reflect what the effect uses
}, [activePage, activeCardIndex, groupedEntries]);

  // --- Event Handlers ---

  // Page Navigation Button Click
  const handleNavClick = useCallback(async (pageNumber: number) => {
    if (pageNumber === activePage || loadingPage === pageNumber) return; 

    console.log(`Navigating to page: ${pageNumber}`);
    isPageNavigatingRef.current = true; // Set flag before fetching/setting state

    // --- Step 1: Fetch data if necessary ---
    if (!loadedPages.current.has(pageNumber)) {
      console.log(`Page ${pageNumber} not loaded. Fetching...`);
      setLoadingPage(pageNumber);
      try {
        // Modify fetchEntries slightly to return new entries or indicate success?
        // For now, assume fetchEntries updates the main 'entries' state.
        await fetchEntries(pageNumber);
        // We need to get the *latest* entries state here, which is tricky post-await.
        // A common pattern is to trigger a re-render and let a useEffect handle the rest,
        // or pass a callback to fetchEntries.
        // Let's try a simpler approach first: set activePage and let useEffects handle it,
        // but we need to be sure the calculation uses updated data.
        console.log(`Page ${pageNumber} fetch initiated.`);
      } catch (error) {
        console.error(`Error fetching page ${pageNumber}:`, error);
        setLoadingPage(null); // Clear loading state on error
        return; // Stop navigation if fetch fails
      } finally {
         // Clear loading state AFTER potential state updates from fetchEntries resolve
         // Use setTimeout to ensure it runs after the current execution context
         setTimeout(() => setLoadingPage(null), 0);
      }
       // At this point, fetchEntries has been called and likely updated the 'entries' state,
       // triggering a future re-render where groupedEntries will be updated.
    } else {
        console.log(`Page ${pageNumber} already loaded.`);
    }

    // --- Step 2: Set Active Page (triggers re-render) ---
    setActivePage(pageNumber);

    // --- Step 3: Determine Target Card and Update State (Best effort after state update) ---
    // This part is tricky because `groupedEntries` might not be updated yet in this render cycle
    // after a fetch. Let's calculate based on the *expected* structure post-fetch/update.

    // We need to use the main `entries` state, assuming it has been (or will be) updated.
    // Filter the main entries list for the target page.
    // Note: Accessing state directly (`entries`) here might use the value from the *previous* render
    // if called immediately after an awaited state update.
    // This calculation might be better placed in a useEffect triggered by `activePage` and `entries`.

    // *** Let's move the index/ID setting logic to a dedicated useEffect ***

  }, [activePage, loadingPage, fetchEntries]); // Remove groupedEntries dependency

  // --- Effect to Update Card Index and ID after Page Change or Data Load ---
  useEffect(() => {
      // This effect runs when activePage changes or when groupedEntries is recalculated (due to entries changing)
      console.log(`Effect: Updating index/ID for activePage: ${activePage}`);

      const targetGroup = groupedEntries.find(g => g.page === activePage);
      // Use the padded entries from the current groupedEntries memo
      const entriesOnTargetPage = targetGroup ? targetGroup.entries : padWithPlaceholders([], activePage, PAGE_SIZE);

      if (entriesOnTargetPage.length === 0) {
          console.warn(`Effect: No entries found for active page ${activePage} in groupedEntries.`);
          // Reset index/ID if page is somehow empty after load?
          // setActiveCardIndex(0);
          return;
      }

      const targetIndex = 0; // CHANGE: Always target the first card
      // Only update if the index actually changes (or initially)
      // This check might be redundant if dependencies are correct, but can prevent loops
      // if (activeCardIndex !== middleIndex) { // Let's remove this check for now to ensure update
          setActiveCardIndex(targetIndex);
          console.log(`Effect: Set active card index: ${targetIndex}`);
      // }

      // Only update if the ID actually changes
      // activeCardId state is unused
  }, [activePage, groupedEntries]); // Trigger when page changes or entries/groups update

  // Card Click
  const handleCardClick = (entry: Entry, indexInPage: number) => {
    if (entry.page !== activePage) {
        // If clicking a card on an inactive page, switch to that page first
        handleNavClick(entry.page);
        // We might need a slight delay or better state management to then set the card index,
        // but for now, let's assume handleNavClick resets it appropriately.
        // Or, set the index directly after switching the page.
        setActiveCardIndex(indexInPage);
    } else if (indexInPage !== activeCardIndex) {
        // If clicking a card on the active page but not the center one
        console.log(`Focusing card index ${indexInPage} on page ${activePage}`);
        setActiveCardIndex(indexInPage);
    } else {
         // Clicking the already active card - potentially open modal
         // Only open modal for non-placeholder cards
         if (!entry.isPlaceholder) {
             console.log(`Clicked active card: ${entry.id}. Opening modal.`);
             setModalContent({ date: formatDate(entry.date), content: entry.content });
             setIsModalOpen(true);
             document.body.style.overflow = 'hidden'; // Prevent background scroll
         } else {
             console.log(`Clicked active placeholder card: ${entry.id}. Doing nothing.`);
         }
    }
  };

  // Modal Close
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    document.body.style.overflow = ''; // Restore background scroll
  };

  // --- Progress Indicator Drag Logic ---
  const loadProgressPosition = useCallback(() => {
    let positionLoaded = false;
    try {
      const savedPosition = localStorage.getItem('progressIndicatorPosition');
      if (savedPosition) {
        const pos = JSON.parse(savedPosition);
        // Check for valid x, y coordinates (used when saving left/top)
        if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
          // Apply loaded position directly if element exists
          if (progressIndicatorRef.current) {
              // Apply as left/top
              progressIndicatorRef.current.style.left = `${pos.x}px`;
              progressIndicatorRef.current.style.top = `${pos.y}px`;
              progressIndicatorRef.current.style.right = 'auto';
              progressIndicatorRef.current.style.bottom = 'auto';
              console.log("Progress indicator position loaded (left/top):", pos);
              positionLoaded = true;
          }
        } else if (pos && pos.right && pos.bottom) {
            // Compatibility or preference for right/bottom saving
            // Estimate x/y for state if needed, but apply right/bottom
            // No need to set state here anymore
            // setProgressPosition({ ... });
            if (progressIndicatorRef.current) {
              progressIndicatorRef.current.style.right = pos.right;
              progressIndicatorRef.current.style.bottom = pos.bottom; // Use loaded bottom
              progressIndicatorRef.current.style.left = 'auto'; // Use auto for left
              progressIndicatorRef.current.style.top = 'auto'; // Use auto for top
              console.log("Progress indicator position loaded (right/bottom from storage):", pos);
              positionLoaded = true;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load progress indicator position:', e);
    }

    // Default position if loading fails or no position saved
    if (!positionLoaded && progressIndicatorRef.current) {
        console.log("Setting default progress indicator position (left/bottom).");
        // Ensure default position is set using left/bottom
        progressIndicatorRef.current.style.left = '2rem'; // Change from right to left
        progressIndicatorRef.current.style.bottom = '2rem';
        progressIndicatorRef.current.style.right = 'auto'; // Ensure right is auto
        progressIndicatorRef.current.style.top = 'auto';
        // Update state if needed, calculate approximate x/y based on default left/bottom
        // No need to set state here anymore
        // const rect = progressIndicatorRef.current.getBoundingClientRect();
        // setProgressPosition({ x: rect.left, y: rect.top });
    }
  }, []);

  const saveProgressPosition = useCallback((element: HTMLDivElement) => {
    // Save position based on final computed style (prefer right/bottom if available)
    const positionToSave = { x: element.offsetLeft, y: element.offsetTop };
    try {
      localStorage.setItem('progressIndicatorPosition', JSON.stringify(positionToSave));
      console.log("Progress indicator position saved:", positionToSave);
    } catch (e) {
      console.warn('Failed to save progress indicator position:', e);
    }
  }, []);

  // Load position effect - ensure it runs *after* the indicator ref is likely set.
  useEffect(() => {
    // Use setTimeout to delay loading until after the initial render slightly,
    // ensuring the ref is populated and dimensions are available.
    const timer = setTimeout(() => {
        if (progressIndicatorRef.current) {
             loadProgressPosition();
        } else {
            console.warn("Progress indicator ref not ready for position loading.");
            // Optionally retry or handle this case
        }
    }, 50); // Short delay

    return () => clearTimeout(timer);
  }, [loadProgressPosition]); // Depend on the memoized load function

   const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent text selection/default drag behavior
        setIsDraggingProgress(true);

        const indicator = progressIndicatorRef.current;
        if (!indicator) return;

        indicator.style.transition = 'none'; // Disable transition during drag
        indicator.classList.add('dragging');
        if(dragOverlayRef.current) dragOverlayRef.current.style.display = 'block'; // Show overlay

        const rect = indicator.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        dragOffset.current = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
   }, []);

    const handleProgressMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingProgress || !progressIndicatorRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        let newX = clientX - dragOffset.current.x;
        let newY = clientY - dragOffset.current.y;

        // Boundary checks
        const indicator = progressIndicatorRef.current;
        const maxX = window.innerWidth - indicator.offsetWidth;
        const maxY = window.innerHeight - indicator.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        indicator.style.left = `${newX}px`;
        indicator.style.top = `${newY}px`;
        indicator.style.right = 'auto'; // Ensure right/bottom are not interfering
        indicator.style.bottom = 'auto';

        // No need to update state here constantly, directly manipulate style
    }, [isDraggingProgress]);

   const handleProgressMouseUp = useCallback(() => {
        if (!isDraggingProgress) return;
        setIsDraggingProgress(false);

        const indicator = progressIndicatorRef.current;
         if(dragOverlayRef.current) dragOverlayRef.current.style.display = 'none'; // Hide overlay

        if (indicator) {
            indicator.style.transition = ''; // Re-enable transitions
            indicator.classList.remove('dragging');
            saveProgressPosition(indicator); // Save the final position using the element
        }
    }, [isDraggingProgress, saveProgressPosition]);

    // Add global listeners for mouse move and up when dragging
    useEffect(() => {
        if (isDraggingProgress) {
            window.addEventListener('mousemove', handleProgressMouseMove);
            window.addEventListener('touchmove', handleProgressMouseMove, { passive: false });
            window.addEventListener('mouseup', handleProgressMouseUp);
            window.addEventListener('touchend', handleProgressMouseUp);
        } else {
            window.removeEventListener('mousemove', handleProgressMouseMove);
            window.removeEventListener('touchmove', handleProgressMouseMove);
            window.removeEventListener('mouseup', handleProgressMouseUp);
            window.removeEventListener('touchend', handleProgressMouseUp);
        }

        // Cleanup listeners
        return () => {
            window.removeEventListener('mousemove', handleProgressMouseMove);
            window.removeEventListener('touchmove', handleProgressMouseMove);
            window.removeEventListener('mouseup', handleProgressMouseUp);
            window.removeEventListener('touchend', handleProgressMouseUp);
        };
    }, [isDraggingProgress, handleProgressMouseMove, handleProgressMouseUp]);


  // --- Render ---

  // Calculate progress percentage
  const progressPercent = totalCount > 0 ? Math.round((entries.length / totalCount) * 100) : 0;

  // Find global index of the active card ID
   const activeCardGlobalIndex = useMemo(() => {
       // Find the active group
       const activeGroup = groupedEntries.find(g => g.page === activePage);
       if (!activeGroup || activeCardIndex < 0 || activeCardIndex >= activeGroup.entries.length) {
           // Group not found or index out of bounds
           return null;
       }
       // Get the active entry within the group
       const activeEntry = activeGroup.entries[activeCardIndex];
       if (!activeEntry || activeEntry.isPlaceholder) {
           // Entry not found or is a placeholder, don't show global index
           return null;
       }
       // Calculate global index mathematically for non-placeholder cards
       // Assumes PAGE_SIZE items per page conceptually.
       const calculatedIndex = (activePage - 1) * PAGE_SIZE + (activeCardIndex + 1);
       return calculatedIndex;

   }, [activePage, activeCardIndex, groupedEntries]); // PAGE_SIZE removed from dependencies

   // Calculate total pages
   const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0;

  // --- Loading and Initial State Handling ---
  if (!isNicknameInitialized || loading) {
    // Show a loading indicator while context initializes or data is fetching
    return <div className="text-center text-gray-500 p-10">Loading Timeline...</div>;
  }

  // Context initialized, not loading, but still no nickname
  if (!nickname) {
    return <div className="text-center text-gray-500 p-10">No user selected or timeline available.</div>;
  }

  // Initialized, not loading, nickname exists, but no entries found (API returned 0 total)
  if (totalCount === 0 && initialLoadDone.current) {
     return <div className="text-center text-gray-500 p-10">No entries found for {nickname}.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-2 relative">
        {/* Hidden overlay for smoother dragging - Ensure this is styled correctly */}
       <div ref={dragOverlayRef} id="progress-drag-overlay" style={{ display: 'none' }}></div>

      {/* Title (Optional - can be part of page layout) */}
      {/* <h1 className="text-center text-3xl font-bold mb-8">时光轴</h1> */}

      {/* --- Carousel --- */}
      <div className="carousel-container performance-boost">
        {groupedEntries.map(({ page: pageNum, entries: entriesInGroup }) => (
          <div
            key={pageNum}
            ref={el => { carouselGroupRefs.current[pageNum] = el; }}
            className={`carousel-group ${pageNum === activePage ? 'active' : ''}`}
            data-group={pageNum}
          >
            <div className="timeline">
              {entriesInGroup.map((entry, indexInPage) => {
                const isCardActive = pageNum === activePage && indexInPage === activeCardIndex;
                // Placeholder check moved to data generation
                const isPlaceholder = entry.isPlaceholder ?? false;
                const needFade = !isPlaceholder && checkNeedFade(entry.content);

                return (
                  <div
                    key={entry.id}
                    ref={el => { cardRefs.current[entry.id] = el; }}
                    className={`timeline-card ${isPlaceholder ? 'placeholder-card' : ''} ${isCardActive ? 'active' : ''}`}
                    data-id={entry.id}
                    data-index={indexInPage}
                    onClick={() => handleCardClick(entry, indexInPage)}
                    // Add hover effects if needed via CSS or state
                  >
                    <div className="card-date">{formatDate(entry.date)}</div>
                    <div className="card-content">
                      <div
                         className="content-text"
                         style={{
                           // @ts-expect-error - CSS custom properties need to be asserted
                           '--lines-to-show': LINES_TO_SHOW,
                           '--line-height': LINE_HEIGHT,
                           // max height calculation can be removed if pure CSS handles truncation well
                          // maxHeight: `calc(var(--line-height) * var(--lines-to-show) * 1em)`
                         }}
                       >
                         {entry.content}
                       </div>
                       {/* Fade element might not be needed if CSS gradient is applied directly on content-text overflow */}
                       {needFade && !isPlaceholder && <div className="content-fade"></div>}
                    </div>
                    {!isPlaceholder && (
                      <div className="card-footer">
                        <div className="icon-holder" onClick={(e) => { e.stopPropagation(); alert('Like clicked!'); }}>
                           <Heart size={18} />
                         </div>
                         <div className="icon-holder" onClick={(e) => { e.stopPropagation(); alert('Star clicked!'); }}>
                           <Star size={18} />
                         </div>
                      </div>
                    )}
                     {/* Footer for placeholder - Ensure this is styled correctly in CSS */}
                     {isPlaceholder && <div className="card-footer"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* --- Page Navigation --- */}
      <div className="group-nav">
        {/* Use the new Pagination component */}
        <Pagination
           currentPage={activePage}
           totalPages={totalPages}
           onPageChange={handleNavClick}
           loadingPage={loadingPage}
        />
      </div>

      {/* --- Progress Indicator --- */}
        <AnimatePresence>
         {/* Render indicator container if initial load attempted/done, not strictly totalCount > 0 */}
         {/* Content inside will still depend on totalCount */}
         {(initialLoadDone.current || entries.length > 0 || loading) && nickname && (
            <motion.div
                ref={progressIndicatorRef}
                className="progress-indicator"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                 style={{ // Initial position can be set here, but useEffect will override
                     position: 'fixed', // Ensure it's fixed
                    // Let useEffect handle position loading/setting
                 }}
                 onMouseDown={handleProgressMouseDown}
                 onTouchStart={handleProgressMouseDown}
            >
                 <div className="progress-circle" style={{ '--progress-percent': `${progressPercent}%` } as React.CSSProperties}>
                   <div className="progress-inner">
                       <div className="progress-count">{entries.length}/{totalCount > 0 ? totalCount : '--'}</div>
                       <div className="progress-percent">{progressPercent}%</div>
                       {activeCardGlobalIndex !== null && (
                           <motion.div
                               className="progress-active"
                                key={activeCardGlobalIndex} // Key change triggers animation
                               initial={{ opacity: 0, y: 5 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ duration: 0.2 }}
                           >
                                <span className="progress-highlight">#{activeCardGlobalIndex}</span>
                            </motion.div>
                        )}
      </div>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

       {/* --- Modal --- */}
       <AnimatePresence>
         {isModalOpen && modalContent && (
           <motion.div
             className="modal-overlay active" // Use class to control display via CSS
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={closeModal} // Close on overlay click
           >
             <motion.div
               className="content-modal"
               initial={{ scale: 0.7, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.7, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
             >
               <button className="modal-close" onClick={closeModal}>&times;</button>
               <div className="modal-date">{modalContent.date}</div>
               <div className="modal-content">
                 {modalContent.content}
        </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}