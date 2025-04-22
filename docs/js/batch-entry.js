document.addEventListener('DOMContentLoaded', () => {
  const entriesContainer = document.getElementById('entries-container');
  const entryCardTemplate = document.getElementById('entry-card-template');
  const addNewCardTemplate = document.getElementById('add-new-card-template');
  const submitBtn = document.getElementById('submit-btn');
  const entryCountDisplay = document.querySelector('.entry-count');
  const carouselWrapper = document.querySelector('.carousel-wrapper'); // Get wrapper for add-new card placement

  const MAX_ENTRIES = 20;
  // --- 3D Carousel Constants (from Timeline.tsx) ---
  const RADIUS = 550; // Based on Timeline.tsx
  const VISIBLE_CARDS = 10; // Based on Timeline.tsx
  const VISIBLE_ANGLE = Math.PI * 0.8; // Based on Timeline.tsx

  let entries = []; // Array to hold entry data { id, date, content }
  let activeCardIndex = 0; // Index of the currently centered card
  let addNewCardElement = null; // Reference to the add new card DOM element

  // Store card elements for easy access in layout function
  let dataCardElements = [];

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
    // Add new card visibility logic might need adjustment based on new position
    if (addNewCardElement) {
        addNewCardElement.style.display = entries.length >= MAX_ENTRIES ? 'none' : 'flex';
    }
  }

  // Update card index text display
  function updateAllCardIndices() {
      dataCardElements.forEach((card, index) => {
          const indexSpan = card.querySelector('.entry-index');
          if (indexSpan) {
              indexSpan.textContent = `体验 #${index + 1}`;
          }
      });
  }

  // --- 3D Carousel Layout Function ---
  function applyCarouselLayout(targetIndex = 0) {
     requestAnimationFrame(() => {
         const groupSize = dataCardElements.length;
         if (groupSize === 0) return;

         dataCardElements.forEach((cardElement, index) => {
             if (!cardElement) return;

             let relativePos = index - targetIndex;
             // Wrap around logic (optional, uncomment if needed for circular feel)
             /*
             if (groupSize > 1) {
                 if (relativePos > groupSize / 2) relativePos -= groupSize;
                 if (relativePos < -groupSize / 2) relativePos += groupSize;
             }
             */

             const angleDivisor = Math.min(VISIBLE_CARDS, groupSize) || 1;
             const angle = relativePos * (VISIBLE_ANGLE / angleDivisor);

             // Calculate transformations based on Timeline.tsx logic
             const x = Math.sin(angle) * RADIUS;
             const y = -40 + Math.abs(relativePos) * 15; // Adjust y based on distance
             const z = Math.cos(angle) * RADIUS * 0.6 - RADIUS * 0.6; // Adjust z for center focus
             const rotateY = -angle * 0.8;

             const transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}rad)`;
             const zIndex = 100 - Math.abs(relativePos) * 10;
             const opacity = Math.max(0.1, 1 - Math.min(Math.abs(relativePos), 5) * 0.18);
             const pointerEvents = Math.abs(relativePos) > Math.floor(VISIBLE_CARDS / 2) ? 'none' : 'auto';

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
     });
  }

  // --- Core Functions ---

  function renderAddNewCard() {
      if (!addNewCardTemplate || !carouselWrapper) return;
      if (addNewCardElement) addNewCardElement.remove(); // Remove existing if any

      const cardClone = addNewCardTemplate.content.cloneNode(true);
      addNewCardElement = cardClone.querySelector('.add-new-card');

      if (addNewCardElement) {
          addNewCardElement.addEventListener('click', handleAddNewEntryClick); // Use new handler name
          // Append to wrapper, AFTER the entries container
          carouselWrapper.appendChild(addNewCardElement);
      }
      // Update visibility based on count (if needed)
      updateEntryCountDisplay();
  }

  // Function to render a data entry card
  function renderEntryCard(entryData, index) {
    if (!entryCardTemplate) return null;

    const cardClone = entryCardTemplate.content.cloneNode(true);
    const cardElement = cardClone.querySelector('.entry-card');
    cardElement.dataset.id = entryData.id;
    cardElement.dataset.index = index; // Store index for click handling

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
    entriesContainer.appendChild(cardElement);
    return cardElement; // Return the created element
  }

  // Renamed handler for clarity
  function handleAddNewEntryClick() {
      if (entries.length >= MAX_ENTRIES) return;

      let newDate = new Date();
      if (entries.length > 0 && entries[entries.length - 1].date) {
          try {
              const lastEntryDate = new Date(entries[entries.length - 1].date + 'T00:00:00');
              newDate = new Date(lastEntryDate);
              newDate.setDate(newDate.getDate() + 1);
          } catch(e) {
               console.error("Error calculating next date:", e);
          }
      }

      const newEntry = {
        id: generateId(),
        date: formatDateForInput(newDate),
        content: ''
      };

      const newIndex = entries.length; // Index will be the current length before pushing
      entries.push(newEntry);

      // Render the new data card and add to elements array
      const newCardElement = renderEntryCard(newEntry, newIndex);
      if (newCardElement) {
          dataCardElements.push(newCardElement);
      }

      // Update state and layout
      activeCardIndex = newIndex; // Focus the new card
      applyCarouselLayout(activeCardIndex);
      updateSubmitButtonState();
      updateEntryCountDisplay();
      // updateAllCardIndices(); // Indices updated in renderEntryCard
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
    if (activeCardIndex >= entries.length) {
        activeCardIndex = Math.max(0, entries.length - 1);
    }

    // Re-assign data-index attribute to remaining cards
    dataCardElements.forEach((card, index) => {
        card.dataset.index = index;
    });

    // Update UI
    updateSubmitButtonState();
    updateEntryCountDisplay();
    updateAllCardIndices(); // <-- Update index text display
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

  // --- Initialization ---

  renderAddNewCard(); // Render the static add new card
  handleAddNewEntryClick(); // Create the first data card via new handler

  // Initial layout application
  // No need for requestAnimationFrame here as initial styles are set by CSS
  // applyCarouselLayout(activeCardIndex); // Called within handleAddNewEntryClick

}); 