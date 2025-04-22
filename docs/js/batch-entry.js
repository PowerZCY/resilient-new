document.addEventListener('DOMContentLoaded', () => {
  const entriesContainer = document.getElementById('entries-container');
  const entryCardTemplate = document.getElementById('entry-card-template');
  const addNewCardTemplate = document.getElementById('add-new-card-template');
  const submitBtn = document.getElementById('submit-btn');
  const entryCountDisplay = document.querySelector('.entry-count');

  const MAX_ENTRIES = 20;
  let entries = []; // Array to hold entry data { id, date, content }
  let addNewCardElement = null; // Reference to the add new card DOM element

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
    entryCountDisplay.textContent = `${entries.length}/${MAX_ENTRIES} 组`;
    if (addNewCardElement) {
        addNewCardElement.style.display = entries.length >= MAX_ENTRIES ? 'none' : 'flex';
    }
  }

  // NEW function to update all card indices after deletion
  function updateAllCardIndices() {
      const cardElements = entriesContainer.querySelectorAll('.entry-card[data-id]'); // Select only data cards
      cardElements.forEach((card, index) => {
          const indexSpan = card.querySelector('.entry-index');
          if (indexSpan) {
              indexSpan.textContent = `体验 #${index + 1}`;
          }
      });
  }

  // --- Core Functions ---

  function renderAddNewCard() {
      if (!addNewCardTemplate) return;
      if (addNewCardElement) addNewCardElement.remove();

      const cardClone = addNewCardTemplate.content.cloneNode(true);
      addNewCardElement = cardClone.querySelector('.add-new-card');

      if (addNewCardElement) {
        addNewCardElement.addEventListener('click', handleAddNewEntry);
        entriesContainer.appendChild(addNewCardElement);
      }
      updateEntryCountDisplay();
  }

  // Function to render a data entry card - ADD index parameter
  function renderEntryCard(entryData, index, insertBeforeElement) { // Added index parameter
    if (!entryCardTemplate) return;

    const cardClone = entryCardTemplate.content.cloneNode(true);
    const cardElement = cardClone.querySelector('.entry-card');
    cardElement.dataset.id = entryData.id;

    const dateHeader = cardElement.querySelector('.card-date-header');
    const dateDisplay = cardElement.querySelector('.date-display');
    const dateInputHidden = cardElement.querySelector('.date-input-hidden');
    const contentTextarea = cardElement.querySelector('.content-textarea');
    const charCount = cardElement.querySelector('.char-count');
    const deleteBtn = cardElement.querySelector('.delete-btn');
    const entryIndexSpan = cardElement.querySelector('.entry-index'); // Get the index span

    // Set initial values
    dateDisplay.textContent = formatDateForDisplay(entryData.date);
    dateInputHidden.value = entryData.date;
    contentTextarea.value = entryData.content;
    charCount.textContent = `${entryData.content.length} 个字符`;
    if (entryIndexSpan) { // Set the index text
        entryIndexSpan.textContent = `体验 #${index + 1}`;
    }

    // --- Event listeners ---
    dateHeader.addEventListener('click', () => {
        dateInputHidden.focus();
        try { dateInputHidden.showPicker(); } catch (e) { /* Ignore */ }
    });

    dateInputHidden.addEventListener('change', (e) => {
        entryData.date = e.target.value;
        dateDisplay.textContent = formatDateForDisplay(entryData.date);
    });
     dateInputHidden.addEventListener('input', (e) => {
         if (e.target.value) {
            entryData.date = e.target.value;
            dateDisplay.textContent = formatDateForDisplay(entryData.date);
         }
    });

    contentTextarea.addEventListener('input', (e) => {
      entryData.content = e.target.value;
      charCount.textContent = `${entryData.content.length} 个字符`;
      updateSubmitButtonState();
    });

    deleteBtn.addEventListener('click', () => {
      removeEntry(entryData.id);
    });

    // Control visibility
    deleteBtn.style.visibility = 'visible';

    // Insert the card
    if (insertBeforeElement) {
        entriesContainer.insertBefore(cardElement, insertBeforeElement);
    } else {
        entriesContainer.appendChild(cardElement);
    }
  }

  function handleAddNewEntry() {
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

    // Render the new data card *before* the add-new card, passing the index
    renderEntryCard(newEntry, newIndex, addNewCardElement);
    updateSubmitButtonState();
    updateEntryCountDisplay();

    const newCardElement = entriesContainer.querySelector(`.entry-card[data-id="${newEntry.id}"]`);
    if (newCardElement && entriesContainer.parentElement.scrollTo) {
        const container = entriesContainer.parentElement; // This is carousel-wrapper
        const scrollLeft = newCardElement.offsetLeft - container.offsetLeft - 40; // Adjust for padding
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }

  function removeEntry(id) {
    const cardToRemove = entriesContainer.querySelector(`.entry-card[data-id="${id}"]`);
    if (cardToRemove) {
      cardToRemove.remove();
    }

    entries = entries.filter(entry => entry.id !== id);
    updateSubmitButtonState();
    updateEntryCountDisplay();
    updateAllCardIndices(); // <-- Update indices after removing a card
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

  renderAddNewCard();
  handleAddNewEntry();

}); 