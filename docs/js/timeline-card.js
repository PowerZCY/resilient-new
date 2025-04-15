/**
 * 时间轴卡片交互和3D效果统一实现
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化页面
  initializeTimelineCards();
  setup3DEffects();
  setupEventListeners();
});

// 3D效果常量
const ROTATION_STEP = (2 * Math.PI) / 10; // 10张卡片，每张旋转36度
const RADIUS = 550; // 增加半径以适应更多卡片
const VISIBLE_CARDS = 10; // 一次显示5张卡片
const VISIBLE_ANGLE = Math.PI * 0.6; // 可见范围约为108度，确保5张卡片可见
let lastFrameId = null; // 全局缓存动画帧引用

/**
 * 初始化时间轴卡片
 */
function initializeTimelineCards() {
  renderNavButtons();
  renderAllGroups();
  setupInitialState();
  
  // 添加性能优化标记，让浏览器提前做好准备
  document.querySelector('.carousel-container').classList.add('performance-boost');
}

/**
 * 渲染导航按钮
 */
function renderNavButtons() {
  const navContainer = document.querySelector('.group-nav');
  navContainer.innerHTML = '';
  
  timelineData.groups.forEach(group => {
    const button = document.createElement('button');
    button.className = 'nav-btn';
    button.dataset.group = group.id;
    button.textContent = group.label;
    
    if (group.id === 0) {
      button.classList.add('active');
    }
    
    navContainer.appendChild(button);
  });
}

/**
 * 渲染所有分组
 */
function renderAllGroups() {
  const container = document.querySelector('.carousel-container');
  container.innerHTML = '';
  
  timelineData.cards.forEach((group, groupIndex) => {
    const groupElement = renderGroup(group, groupIndex);
    container.appendChild(groupElement);
  });
}

/**
 * 渲染单个分组
 */
function renderGroup(cards, groupIndex) {
  // 创建分组元素
  const groupElement = document.createElement('div');
  groupElement.className = 'carousel-group';
  groupElement.dataset.group = groupIndex;
  
  if (groupIndex === 0) {
    groupElement.classList.add('active');
  }
  
  // 添加进度指示器 - 使用现代化的设计
  const progressIndicator = document.createElement('div');
  progressIndicator.className = 'progress-indicator';
  
  // 获取当前进度百分比
  const progress = timelineData.progress;
  const progressPercent = Math.floor((progress.current / progress.total) * 100);
  
  // 获取当前卡片ID
  const currentCardId = cards[0].id; // 默认显示组内第一张卡片的ID
  
  progressIndicator.innerHTML = `
    <div class="progress-circle" style="--progress-percent: ${progressPercent}%">
      <div class="progress-inner">
        <div class="progress-count">${progress.current}/${progress.total}</div>
        <div class="progress-percent">${progressPercent}%</div>
        <div class="progress-active">
          <span class="progress-highlight">#${currentCardId}</span>
        </div>
      </div>
    </div>
  `;
  
  // 创建时间轴容器
  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  timeline.style.willChange = 'transform'; // 增加will-change以优化性能
  
  // 渲染每张卡片
  cards.forEach((card, index) => {
    const cardElement = renderCard(card, index, cards.length);
    timeline.appendChild(cardElement);
  });
  
  groupElement.appendChild(timeline);
  groupElement.appendChild(progressIndicator); // 将进度指示器添加到组元素末尾，使其位于正确位置
  
  return groupElement;
}

/**
 * 渲染单张卡片
 */
function renderCard(card, index, totalCards) {
  // 创建卡片元素
  const cardElement = document.createElement('div');
  cardElement.className = 'timeline-card';
  if (card.isPlaceholder) {
    cardElement.classList.add('placeholder-card');
  }
  
  cardElement.dataset.id = card.id;
  cardElement.dataset.index = index;
  cardElement.style.willChange = 'transform'; // 增加will-change以优化性能
  
  // 添加卡片内容
  cardElement.innerHTML = `
    <div class="card-date">${card.date}</div>
    <div class="card-content">
      <div class="content-text">${card.content}</div>
      ${card.needFade ? '<div class="content-fade"></div>' : ''}
    </div>
    <div class="card-footer">
      <div class="icon-holder">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </div>
      <div class="icon-holder">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
    </div>
  `;
  
  return cardElement;
}

/**
 * 设置3D效果 - 从3d-card.js合并过来的核心功能
 */
function setup3DEffects() {
  const carouselGroups = document.querySelectorAll('.carousel-group');
  
  // 选中卡片ID的默认值
  window.currentCardId = 1;
  
  // 初始化每个组的卡片位置
  carouselGroups.forEach((group) => {
    const cards = group.querySelectorAll('.timeline-card');
    group.dataset.currentIndex = 0;
    
    // 设置初始位置 - 使卡片环绕分布
    positionCards(cards, 0);
    
    // 添加卡片点击事件 - 使用事件委托减少事件监听器数量
    group.addEventListener('click', (e) => {
      const card = e.target.closest('.timeline-card');
      if (!card) return;
      
      const index = parseInt(card.dataset.index);
      if (isNaN(index)) return;
      
      // 取消任何正在进行的动画帧
      if (lastFrameId) {
        cancelAnimationFrame(lastFrameId);
      }
      
      // 获取当前索引
      let currentIndex = parseInt(group.dataset.currentIndex || 0);
      
      // 更新卡片位置
      rotateCardsTo(cards, index, currentIndex);
      
      // 更新当前索引
      group.dataset.currentIndex = index;
      
      // 获取卡片ID并更新进度指示器
      const cardId = card.dataset.id;
      if (cardId) {
        updateProgressIndicator(cardId);
      }
    });
    
    // 卡片悬停效果
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        // 添加悬停光晕效果
        card.classList.add('hover-scale');
        
        // 提高悬停卡片的Z-index，使其在视觉上更突出
        const originalZIndex = parseInt(card.style.zIndex) || 1;
        card.dataset.originalZIndex = originalZIndex;
        card.style.zIndex = originalZIndex + 5;
      });
      
      card.addEventListener('mouseleave', () => {
        // 移除悬停光晕效果
        card.classList.remove('hover-scale');
        
        // 恢复原始Z-index
        const originalZIndex = parseInt(card.dataset.originalZIndex) || 1;
        card.style.zIndex = originalZIndex;
      });
    });
  });
  
  // 更新当前卡片ID
  updateProgressIndicator(1);
}

/**
 * 定位所有卡片
 * @param {NodeList} cards 卡片元素列表
 * @param {number} centerIndex 中心卡片的索引
 */
function positionCards(cards, centerIndex) {
  const totalCards = cards.length;
  
  // 设置所有卡片的位置
  cards.forEach((card, index) => {
    // 计算每张卡片相对于中心卡片的位置
    let relativePos = index - centerIndex;
    
    // 确保relativePos在-5到4的范围内，实现无限循环效果
    if (relativePos > totalCards / 2) relativePos -= totalCards;
    if (relativePos < -totalCards / 2) relativePos += totalCards;
    
    // 设置卡片可见性
    const isVisible = Math.abs(relativePos) <= Math.floor(VISIBLE_CARDS / 2);
    card.style.display = isVisible ? 'flex' : 'none';
    
    if (isVisible) {
      // 调整角度计算，使可见卡片分布在前方视野内
      const angle = relativePos * (VISIBLE_ANGLE / (VISIBLE_CARDS - 1));
      
      // 计算卡片位置 - 向上偏移一些，给底部控件留出空间
      const x = Math.sin(angle) * RADIUS;
      const y = -40; // 向上偏移一些，给底部控件留出空间
      const z = Math.cos(angle) * RADIUS * 0.7;
      
      // 卡片旋转角度，使卡片正面朝向用户
      const rotateY = -angle * 0.8;
      
      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}rad)`;
      
      // 根据位置设置不同的层级，使中间卡片位于最上层
      card.style.zIndex = 20 - Math.abs(relativePos) * 3;
      
      // 调整卡片整体的透明度，但保持在较高的可见范围
      // 这里设置卡片整体的透明度较高，具体内容的透明度由CSS控制
      const opacityFactor = 1 - Math.abs(relativePos) * 0.08;
      card.style.opacity = opacityFactor;
    }
  });
  
  // 设置当前卡片为active
  if (cards[centerIndex]) {
    cards.forEach(c => c.classList.remove('active'));
    cards[centerIndex].classList.add('active');
  }
}

/**
 * 旋转卡片到指定位置
 */
function rotateCardsTo(cards, newIndex, currentIndex) {
  // 使用requestAnimationFrame优化性能
  lastFrameId = requestAnimationFrame(() => {
    // 更新所有卡片的位置
    positionCards(cards, newIndex);
    
    // 清除动画帧引用
    lastFrameId = null;
  });
}

/**
 * 设置初始状态和全局变量
 */
function setupInitialState() {
  window.currentRotation = 0;
  window.currentGroup = 0;
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
  // 获取DOM元素
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal-close');
  
  // 导航点击事件 - 使用事件委托
  document.querySelector('.group-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    
    const index = parseInt(btn.dataset.group);
    if (isNaN(index) || window.currentGroup === index) return;
    
    switchGroup(index);
  });
  
  // 添加卡片事件
  setupCardEvents();
  
  // 模态框关闭事件
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // 点击模态框外部区域关闭
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  
  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/**
 * 设置卡片事件
 */
function setupCardEvents() {
  document.querySelectorAll('.timeline-card').forEach(card => {
    // 获取内容元素
    const contentText = card.querySelector('.content-text');
    const dateText = card.querySelector('.card-date').textContent;
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalDate = document.querySelector('.modal-date');
    const modalContent = document.querySelector('.modal-content');
    
    // 点击内容区域展示模态框
    if (contentText && modalOverlay) {
      contentText.addEventListener('click', (e) => {
        // 只有当卡片处于active状态(在中间位置)时才展示完整内容
        if (card.classList.contains('active') && contentText.scrollHeight > contentText.clientHeight) {
          // 设置模态框内容
          modalDate.textContent = dateText;
          modalContent.textContent = contentText.textContent.trim();
          
          // 显示模态框
          modalOverlay.classList.add('active');
          
          // 禁止背景滚动
          document.body.style.overflow = 'hidden';
          
          e.stopPropagation();
        }
      });
    }
    
    // 阻止卡片文本选中传播到卡片点击事件
    if (contentText) {
      contentText.addEventListener('mousedown', (e) => {
        if (card.classList.contains('active')) {
          e.stopPropagation(); // 阻止事件冒泡
        }
      });
    }
  });
}

/**
 * 切换分组
 */
function switchGroup(index) {
  if (index === window.currentGroup) return;
  
  const groups = document.querySelectorAll('.carousel-group');
  const navBtns = document.querySelectorAll('.nav-btn');
  
  if (groups[window.currentGroup]) {
    groups[window.currentGroup].classList.remove('active');
  }
  
  if (navBtns[window.currentGroup]) {
    navBtns[window.currentGroup].classList.remove('active');
  }
  
  if (groups[index]) {
    groups[index].classList.add('active');
  }
  
  if (navBtns[index]) {
    navBtns[index].classList.add('active');
  }
  
  window.currentGroup = index;
  window.currentRotation = 0;
  
  // 更新当前组的第一张卡片为默认选中
  const firstCard = groups[index].querySelector('.timeline-card');
  if (firstCard && firstCard.dataset.id) {
    updateProgressIndicator(firstCard.dataset.id);
  }
}

/**
 * 更新进度指示器中显示的卡片ID
 */
function updateProgressIndicator(cardId) {
  window.currentCardId = cardId;
  const highlightElements = document.querySelectorAll('.progress-highlight');
  
  // 批量更新DOM，减少重排
  requestAnimationFrame(() => {
    highlightElements.forEach(el => {
      el.textContent = `#${cardId}`;
    });
  });
} 