document.addEventListener('DOMContentLoaded', () => {
  const entriesContainer = document.getElementById('entries-container');
  const entryCardTemplate = document.getElementById('entry-card-template');
  const submitBtn = document.getElementById('submit-btn');
  const entryCountDisplay = document.querySelector('.entry-count');
  const activeIndicator = document.getElementById('active-indicator');
  const dragOverlay = document.getElementById('drag-overlay');

  const MAX_ENTRIES = 20;
  // --- 3D Carousel Constants (Hybrid Approach) ---
  const ANGLE_STEP = 5; // Degrees per card distance from center
  const X_STEP = 65; // Pixels horizontal offset per card distance
  const Z_STEP_PER_LEVEL = 80; // Pixels depth offset per card distance
  const Y_INITIAL_OFFSET = -40; // Base vertical offset for cards
  const Y_STEP_PER_LEVEL = 15; // Pixels vertical offset increase per card distance

  let entries = []; // Array to hold entry data { id, date, content }
  let activeCardIndex = 0; // Index of the currently centered card

  // Store card elements for easy access in layout function
  let dataCardElements = [];

  // --- Draggable Indicator State --- 
  let isDraggingIndicator = false;
  let dragOffset = { x: 0, y: 0 };
  let dragStartPosition = { x: 0, y: 0 }; // Store start position to detect drag vs click

  // --- Helper Functions ---

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for display in the header (e.g., YYYY年M月D日)
  function formatDateForDisplay(dateString) {
    try {
        const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString; // Fallback
    }
  }

  function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }

  function updateSubmitButtonState() {
    const hasContent = entries.some(entry => entry.content.trim() !== '');
    submitBtn.disabled = !hasContent;
  }

  function updateEntryCountDisplay() {
    // Now counts only data entries
    entryCountDisplay.textContent = `${entries.length}/${MAX_ENTRIES} 组`;
    if (activeIndicator) {
        // Control display based on whether MAX_ENTRIES is reached
        // Use hidden class for smoother transition
        if (entries.length >= MAX_ENTRIES) {
             activeIndicator.classList.add('hidden');
        } else {
             activeIndicator.classList.remove('hidden');
        }
    }
  }

  // --- 3D Carousel Layout Function ---
  function applyCarouselLayout(targetIndex = 0) {
     requestAnimationFrame(() => {
         const containerWidth = entriesContainer.offsetWidth;
         const containerHeight = entriesContainer.offsetHeight;
         const centerX = containerWidth / 2;
         const centerY = containerHeight / 2; // Correct vertical center

         const groupSize = dataCardElements.length;
         const hasAddNew = entries.length < MAX_ENTRIES && activeIndicator;

         // --- Calculate Visual Centering Offset --- 
         let minXOffset = 0;
         let maxXOffset = 0;

         // Calculate offsets for data cards
         const dataCardXOffsets = dataCardElements.map((_, index) => {
             const relativePos = index - targetIndex;
             return relativePos * X_STEP;
         });

         // Determine min/max from data cards
         if (dataCardXOffsets.length > 0) {
             minXOffset = Math.min(...dataCardXOffsets);
             maxXOffset = Math.max(...dataCardXOffsets);
         }

         // Calculate offset for AddNew card (always relativePos = 1)
         if (hasAddNew) {
             const addNewRelativePos = 1; // Always position relative to the right of the active card
             const addNewXOffset = addNewRelativePos * X_STEP;

             // Update overall min/max including AddNew card
             // If no data cards exist yet, AddNew defines the bounds
             if (dataCardXOffsets.length === 0) {
                  minXOffset = addNewXOffset; // Assuming active card is conceptually at 0
                  maxXOffset = addNewXOffset;
             } else {
                  minXOffset = Math.min(minXOffset, addNewXOffset);
                  maxXOffset = Math.max(maxXOffset, addNewXOffset);
             }
         }

         // Calculate the midpoint of the entire group's horizontal spread
         const visualMidpointX = (minXOffset + maxXOffset) / 2;
         // Calculate the shift needed to center this midpoint in the container
         const centeringShift = -visualMidpointX;

         dataCardElements.forEach((cardElement, index) => {
             if (!cardElement) return;

             // Calculate logical relative position
             const logicalRelativePos = index - targetIndex;

             // Calculate visual relative position for wrap-around effect
             let visualRelativePos = logicalRelativePos;
             if (groupSize > 1) { // Wrap-around logic only needed for more than 1 card
                 const halfSize = groupSize / 2;
                 if (logicalRelativePos > halfSize) {
                     visualRelativePos = logicalRelativePos - groupSize;
                 } else if (logicalRelativePos <= -halfSize) { // Use <= for negative half
                     visualRelativePos = logicalRelativePos + groupSize;
                 }
             }

             // Use visualRelativePos for layout calculations
             const relativePos = visualRelativePos;

             // --- Step-based Calculation --- 
             const angleDeg = relativePos * ANGLE_STEP;
             const rotateYRad = angleDeg * (Math.PI / 180);
             const x = relativePos * X_STEP; // Base position relative to the active card (where relativePos = 0)
             const z = -Math.abs(relativePos) * Z_STEP_PER_LEVEL;
             const y = Y_INITIAL_OFFSET + Math.abs(relativePos) * Y_STEP_PER_LEVEL;

             // Position relative to container center using the calculated relative offset x AND VISUAL CENTERING SHIFT
             const finalX = centerX + x + centeringShift;
             const finalY = centerY + y;
             const transform = `translate3d(${finalX}px, ${finalY}px, ${z}px) rotateY(${rotateYRad}rad)`;

             // Adjust zIndex and opacity based on distance for layering
             const zIndex = 100 - Math.abs(relativePos);
             // Make opacity drop off more gently for closer cards
             const opacity = Math.max(0.4, 1 - Math.abs(relativePos) * 0.12); // Further adjusted opacity fade
             const pointerEvents = Math.abs(relativePos) > 3 ? 'none' : 'auto'; // Limit interaction range slightly

             // Apply styles
             cardElement.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
             cardElement.style.transform = transform;
             cardElement.style.opacity = opacity;
             cardElement.style.zIndex = zIndex;
             cardElement.style.pointerEvents = pointerEvents;

             // Add/remove active class
             if (index === targetIndex) {
                 cardElement.classList.add('active');
             } else {
                 cardElement.classList.remove('active');
             }
         });

         // --- REMOVED Add New Card positioning logic from here --- 
     });
  }

  // --- Core Functions ---

  // Function to render a data entry card
  function renderEntryCard(entryData, index) {
    if (!entryCardTemplate) return null;

    const cardClone = entryCardTemplate.content.cloneNode(true);
    const cardElement = cardClone.querySelector('.entry-card');
    cardElement.dataset.id = entryData.id;
    cardElement.dataset.index = index; // Store current ARRAY index for click handling

    const dateHeader = cardElement.querySelector('.card-date-header');
    const dateDisplay = cardElement.querySelector('.date-display');
    const dateInputHidden = cardElement.querySelector('.date-input-hidden');
    const contentTextarea = cardElement.querySelector('.content-textarea');
    const charCount = cardElement.querySelector('.char-count');
    const deleteBtn = cardElement.querySelector('.delete-btn');
    const entryIndexSpan = cardElement.querySelector('.entry-index');

    // Set initial values
    dateDisplay.textContent = formatDateForDisplay(entryData.date);
    dateInputHidden.value = entryData.date;
    contentTextarea.value = entryData.content;
    charCount.textContent = `${entryData.content.length} 个字符`;
    if (entryIndexSpan) {
        entryIndexSpan.textContent = `体验 #${index + 1}`;
    }

    // --- Event listeners ---
    dateHeader.addEventListener('click', () => {
        dateInputHidden.focus();
        try { dateInputHidden.showPicker(); } catch (e) { /* Ignore */ }
    });

    dateInputHidden.addEventListener('change', (e) => {
        const entry = entries.find(en => en.id === entryData.id);
        if(entry) entry.date = e.target.value;
        dateDisplay.textContent = formatDateForDisplay(e.target.value);
    });
    dateInputHidden.addEventListener('input', (e) => {
        if (e.target.value) {
            const entry = entries.find(en => en.id === entryData.id);
            if(entry) entry.date = e.target.value;
            dateDisplay.textContent = formatDateForDisplay(e.target.value);
        }
    });

    contentTextarea.addEventListener('input', (e) => {
        const entry = entries.find(en => en.id === entryData.id);
        if(entry) entry.content = e.target.value;
        charCount.textContent = `${e.target.value.length} 个字符`;
        updateSubmitButtonState();
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click handler
        removeEntry(entryData.id);
    });

    // Card click handler to focus
    cardElement.addEventListener('click', () => {
        const clickedIndex = parseInt(cardElement.dataset.index || '0', 10);
        if (clickedIndex !== activeCardIndex) {
            activeCardIndex = clickedIndex;
            applyCarouselLayout(activeCardIndex);
        }
        // Potentially open modal or other action if already active?
    });

    // Control visibility
    deleteBtn.style.visibility = 'visible';

    // Insert the card into the entries container
    entriesContainer.appendChild(cardElement); // Append to the end
    return cardElement; // Return the created element
  }

  // Renamed handler for clarity
  function handleAddNewEntryClick() {
      if (entries.length >= MAX_ENTRIES) return;

      let newDate = new Date();
      if (entries.length > 0 && entries[entries.length - 1].date) { // Use last entry date
          try {
              const lastEntryDate = new Date(entries[entries.length - 1].date + 'T00:00:00');
              newDate = new Date(lastEntryDate);
              newDate.setDate(newDate.getDate() + 1); // New card date is day after the last
          } catch(e) {
               console.error("Error calculating next date:", e);
          }
      }

      const newEntry = {
        id: generateId(), // Internal unique ID
        date: formatDateForInput(newDate),
        content: '' // No displayIndex needed
      };

      const newArrayIndex = entries.length; // Index will be the current length BEFORE pushing
      entries.push(newEntry); // Append to data array

      // Render the new data card and add to elements array
      const newCardElement = renderEntryCard(newEntry, newArrayIndex);
      if (newCardElement) {
          // Apply initial state for animation
          newCardElement.style.position = 'absolute';
          // Start new card from a slightly different default state, centered horizontally
          const initialX = entriesContainer.offsetWidth / 2;
          const initialY = entriesContainer.offsetHeight / 2;
          newCardElement.style.opacity = '0'; 
          newCardElement.style.transform = `translate3d(${initialX}px, ${initialY}px, -150px) scale(0.5) rotateY(30deg)`;

          // Append element to the elements array
          dataCardElements.push(newCardElement);
      }

      // Update state and layout
      activeCardIndex = newArrayIndex; // Focus the newly added card at the end
      updateSubmitButtonState();
      updateEntryCountDisplay();

      // Apply layout AFTER the DOM element is ready and initial styles are set
      // Use a minimal timeout to ensure the browser registers the initial state before transitioning
      setTimeout(() => {
          applyCarouselLayout(activeCardIndex); // Use the updated active index
      }, 0);
  }

  function removeEntry(id) {
    const indexToRemove = entries.findIndex(entry => entry.id === id);
    if (indexToRemove === -1) return;

    // Remove element from DOM and array
    const cardToRemove = dataCardElements[indexToRemove];
    if (cardToRemove) {
      cardToRemove.remove();
    }

    // Remove from data and elements array
    entries.splice(indexToRemove, 1);
    dataCardElements.splice(indexToRemove, 1);

    // Adjust active index if necessary
    if (activeCardIndex > indexToRemove) {
        activeCardIndex--; // Shift active index left if removed item was before it
    } else if (activeCardIndex === indexToRemove && activeCardIndex >= entries.length) {
        // If the removed item was the active one and it was the last one
        activeCardIndex = Math.max(0, entries.length - 1);
    } else if (activeCardIndex >= entries.length) {
        // General case if active index becomes out of bounds
        activeCardIndex = Math.max(0, entries.length - 1);
    }

    // Re-assign data-index attribute AND UPDATE DISPLAYED INDEX for remaining cards
    for (let i = indexToRemove; i < dataCardElements.length; i++) {
        const card = dataCardElements[i];
        card.dataset.index = i; // Update array index
        // Update the displayed sequential index in the footer
        const indexSpan = card.querySelector('.entry-index');
        if (indexSpan) {
            indexSpan.textContent = `体验 #${i + 1}`;
        }
    }

    // Update UI
    updateSubmitButtonState();
    updateEntryCountDisplay();
    applyCarouselLayout(activeCardIndex); // Re-apply layout
  }

  // --- Event Listeners ---

  submitBtn.addEventListener('click', () => {
    const validEntries = entries.filter(entry => entry.content.trim() !== '');
    if (validEntries.length === 0) {
        alert('请至少填写一条记录的内容');
        return;
    }
    console.log('Submitting data (prototype):', validEntries);
    alert(`准备提交 ${validEntries.length} 条有效记录 (查看控制台)`);

    const submitBtnInner = submitBtn.querySelector('.submit-btn-inner'); // Get inner element
    const originalBtnContent = submitBtnInner ? submitBtnInner.innerHTML : ''; // Store original inner HTML

    submitBtn.disabled = true;
    // Update the inner element's HTML
    if (submitBtnInner) {
        submitBtnInner.innerHTML = '<i class="fas fa-spinner fa-spin icon"></i> 提交中...';
    }

    setTimeout(() => {
        alert('提交成功! (原型)');
        submitBtn.disabled = false;
        // Restore the original inner HTML
        if (submitBtnInner) {
            submitBtnInner.innerHTML = originalBtnContent;
        }
    }, 1500);
  });

  // --- Draggable Indicator Logic (from Timeline.tsx, adapted) --- 
  function loadIndicatorPosition() {
      // Simplified: Always start at default position defined in CSS
      // Add localStorage load logic here if needed
      if (activeIndicator) {
         // Ensure initial styles if not loaded from storage
         if (!activeIndicator.style.left && !activeIndicator.style.top) {
              const defaultStyle = window.getComputedStyle(activeIndicator);
              activeIndicator.style.bottom = defaultStyle.bottom;
              activeIndicator.style.right = defaultStyle.right;
              activeIndicator.style.left = 'auto';
              activeIndicator.style.top = 'auto';
         }
      }
  }
  
  function saveIndicatorPosition(element) {
      // Save left/top position
      const positionToSave = { x: element.offsetLeft, y: element.offsetTop };
      try {
          localStorage.setItem('batchEntryIndicatorPosition', JSON.stringify(positionToSave));
          console.log("Indicator position saved:", positionToSave);
      } catch (e) {
          console.warn('Failed to save indicator position:', e);
      }
  }
  
  function handleDragStart(e) {
      if (!activeIndicator) return;

      isDraggingIndicator = false; // Reset flag initially
      activeIndicator.classList.add('dragging');
      if (dragOverlay) dragOverlay.style.display = 'block';

      const rect = activeIndicator.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Store start position for click detection
      dragStartPosition = { x: clientX, y: clientY };

      dragOffset = {
          x: clientX - rect.left,
          y: clientY - rect.top,
      };

      // Add move/end listeners globally
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
  }
  
  function handleDragMove(e) {
      if (!activeIndicator) return; // Check if dragging is intended (mouse button down etc.) - Basic check
      // Set dragging flag only when movement occurs
      if (!isDraggingIndicator) {
         // Check if moved beyond a small threshold to confirm drag
         const clientX = e.touches ? e.touches[0].clientX : e.clientX;
         const clientY = e.touches ? e.touches[0].clientY : e.clientY;
         const deltaX = Math.abs(clientX - dragStartPosition.x);
         const deltaY = Math.abs(clientY - dragStartPosition.y);
         if (deltaX > 5 || deltaY > 5) { // Threshold of 5px
             isDraggingIndicator = true; 
         }
      }

      // Only move if dragging is confirmed
      if (!isDraggingIndicator) return;

      e.preventDefault(); // Prevent scrolling during drag on touch devices

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      let newX = clientX - dragOffset.x;
      let newY = clientY - dragOffset.y;

      // Boundary checks
      const maxX = window.innerWidth - activeIndicator.offsetWidth;
      const maxY = window.innerHeight - activeIndicator.offsetHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      activeIndicator.style.left = `${newX}px`;
      activeIndicator.style.top = `${newY}px`;
      activeIndicator.style.right = 'auto'; // Ensure right/bottom are not interfering
      activeIndicator.style.bottom = 'auto';
  }
  
  function handleDragEnd() {
      // Check isDraggingIndicator flag before saving position
      if (!activeIndicator) return;

      if (isDraggingIndicator) {
          saveIndicatorPosition(activeIndicator); // Save final position only if dragged
      }

      activeIndicator.classList.remove('dragging');
      if (dragOverlay) dragOverlay.style.display = 'none';

      // Remove global listeners
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);

      // Reset dragging flag *after* potential click handler runs
      // Use setTimeout to ensure flag is reset after event bubble phase
      setTimeout(() => {
          isDraggingIndicator = false;
      }, 0);
  }

  // --- Initialization ---

  if (activeIndicator) {
    // Add click listener for adding entries (only if not dragging)
    activeIndicator.addEventListener('click', (e) => {
        // Check the flag set during move/end
        if (!isDraggingIndicator) {
             handleAddNewEntryClick(e);
        }
    });
    // Add drag listeners
    activeIndicator.addEventListener('mousedown', handleDragStart);
    activeIndicator.addEventListener('touchstart', handleDragStart, { passive: false });
    loadIndicatorPosition(); // Load saved position or set default
  } else {
    console.error('Active Indicator element not found!');
  }
  updateEntryCountDisplay(); // Set initial FAB visibility

  handleAddNewEntryClick(); // Create the first data card via new handler

  // Initial layout application
  // No need for requestAnimationFrame here as initial styles are set by CSS
  // applyCarouselLayout(activeCardIndex); // Called within handleAddNewEntryClick

}); 