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
  
  // 获取第一个组的按钮并触发初始发牌效果
  setTimeout(() => {
    const firstGroup = document.querySelector('.carousel-group[data-group="0"]');
    const firstBtn = document.querySelector('.nav-btn[data-group="0"]');
    
    if (firstGroup && firstBtn) {
      const btnRect = firstBtn.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;
      
      const cards = firstGroup.querySelectorAll('.timeline-card');
      const middleIndex = Math.floor(cards.length / 2) >= cards.length ? 0 : Math.floor(cards.length / 2);
      firstGroup.dataset.currentIndex = middleIndex;
      
      // 设置初始进度条ID
      const middleCard = cards[middleIndex];
      if (middleCard && middleCard.dataset.id) {
        updateProgressIndicator(middleCard.dataset.id);
      }
      
      // 计算并设置初始位置
      calculateAndAnimateCards(cards, btnCenterX, btnCenterY, middleIndex);
    }
  }, 100);
}

/**
 * 计算并设置卡片动画
 */
function calculateAndAnimateCards(cards, startX, startY, middleIndex) {
  // 清除之前可能存在的样式
  cards.forEach(card => {
    card.style.zIndex = "";
    card.classList.remove('active');
    card.style.visibility = 'visible';
    card.style.pointerEvents = 'auto';
  });
  
  // 先计算出卡片的最终位置
  const cardPositions = [];
  cards.forEach((card, index) => {
    // 计算相对于中间卡片的位置
    let relativePos = index - middleIndex;
    
    // 确保相对位置合理
    if (relativePos > cards.length / 2) relativePos -= cards.length;
    if (relativePos < -cards.length / 2) relativePos += cards.length;
    
    // 计算卡片角度与位置
    const angle = relativePos * (VISIBLE_ANGLE / VISIBLE_CARDS);
    const x = Math.sin(angle) * RADIUS;
    const y = -40 + Math.abs(relativePos) * 5; // 根据距离中心的远近调整高度，防止堆叠
    const z = Math.cos(angle) * RADIUS * 0.7;
    const rotateY = -angle * 0.8;
    
    // 根据与中间卡片的距离设置z-index
    const zIndex = 100 - Math.abs(relativePos) * 10;
    
    cardPositions.push({
      card,
      index,
      relativePos,
      finalTransform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}rad)`,
      zIndex,
      finalOpacity: 1 - Math.min(Math.abs(relativePos), 5) * 0.15
    });
    
    // 先将卡片设置在按钮位置
    card.style.transitionProperty = 'none';
    card.style.transform = `translate3d(${startX - window.innerWidth/2}px, ${startY - window.innerHeight/2}px, 0) scale(0.1)`;
    card.style.opacity = '0';
    card.style.zIndex = '1';
    
    // 强制重绘
    void card.offsetWidth;
  });
  
  // 对位置数组按z-index排序，确保正确的图层顺序
  cardPositions.sort((a, b) => a.zIndex - b.zIndex);
  
  // 然后为每张卡片应用动画
  setTimeout(() => {
    cardPositions.forEach((position, i) => {
      const card = position.card;
      const delay = 0.05 + Math.abs(position.relativePos) * 0.03;
      
      card.style.transitionProperty = 'transform, opacity';
      card.style.transitionDuration = '0.7s';
      card.style.transitionTimingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.style.transitionDelay = `${delay}s`;
      card.style.transform = position.finalTransform;
      card.style.opacity = position.finalOpacity.toString();
      card.style.zIndex = position.zIndex.toString();
    });
    
    // 设置中间卡片为活跃状态
    setTimeout(() => {
      const middleCard = cards[middleIndex];
      if (middleCard) {
        middleCard.classList.add('active');
        if (middleCard.dataset.id) {
          updateProgressIndicator(middleCard.dataset.id);
        }
      }
    }, 500);
  }, 50);
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
    
    // 设置默认的中间卡片索引
    const middleIndex = Math.floor(cards.length / 2) >= cards.length ? 0 : Math.floor(cards.length / 2);
    group.dataset.currentIndex = middleIndex;
    
    // 添加卡片点击事件 - 使用事件委托减少事件监听器数量
    group.addEventListener('click', (e) => {
      const card = e.target.closest('.timeline-card');
      if (!card) return;
      
      const index = parseInt(card.dataset.index);
      if (isNaN(index)) return;
      
      // 获取当前激活的索引
      const currentIndex = parseInt(group.dataset.currentIndex || 0);
      if (index === currentIndex) return; // 如果点击的是当前活跃卡片，不做处理
      
      // 更新组的当前索引
      group.dataset.currentIndex = index;
      
      // 使用环绕动画效果
      rotateCardsToTarget(cards, index);
      
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
}

/**
 * 旋转卡片到目标位置 - 使用环绕效果
 */
function rotateCardsToTarget(cards, targetIndex) {
  // 清除所有卡片的active状态
  cards.forEach(card => card.classList.remove('active'));
  
  // 计算每张卡片的位置
  cards.forEach((card, index) => {
    // 计算相对位置
    let relativePos = index - targetIndex;
    
    // 确保相对位置在合理范围内
    if (relativePos > cards.length / 2) relativePos -= cards.length;
    if (relativePos < -cards.length / 2) relativePos += cards.length;
    
    // 计算角度和位置
    const angle = relativePos * (VISIBLE_ANGLE / VISIBLE_CARDS);
    const x = Math.sin(angle) * RADIUS;
    const y = -40 + Math.abs(relativePos) * 5; // 调整高度避免堆叠
    const z = Math.cos(angle) * RADIUS * 0.7;
    const rotateY = -angle * 0.8;
    
    // 设置卡片样式
    card.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}rad)`;
    card.style.zIndex = 100 - Math.abs(relativePos) * 10;
    card.style.opacity = 1 - Math.min(Math.abs(relativePos), 5) * 0.15;
  });
  
  // 设置目标卡片为活跃状态
  const targetCard = cards[targetIndex];
  if (targetCard) {
    targetCard.classList.add('active');
    // 增加短暂延迟确保过渡效果完成后再添加active类
    setTimeout(() => {
      targetCard.classList.add('active');
    }, 100);
  }
}

/**
 * 设置初始状态和全局变量
 */
function setupInitialState() {
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
  const activeBtn = navBtns[index];
  
  // 保存按钮位置，用于发牌动画
  const btnRect = activeBtn.getBoundingClientRect();
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;
  
  // 立即隐藏所有组的卡片
  groups.forEach((g, i) => {
    if (i === index) return; // 跳过即将显示的组
    
    g.classList.remove('active');
    // 立即隐藏卡片，不做动画过渡
    const cards = g.querySelectorAll('.timeline-card');
    cards.forEach(card => {
      card.style.transition = 'none';
      card.style.transform = '';
      card.style.opacity = '0';
      card.style.visibility = 'hidden';
      card.style.pointerEvents = 'none';
      card.classList.remove('active');
    });
  });
  
  // 更新导航按钮状态
  navBtns.forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
  
  // 立即准备新组
  const group = groups[index];
  group.classList.add('active');
  const newCards = group.querySelectorAll('.timeline-card');
  
  // 计算中间卡片索引
  const middleIndex = Math.floor(newCards.length / 2) >= newCards.length ? 0 : Math.floor(newCards.length / 2);
  group.dataset.currentIndex = middleIndex;
  
  // 计算并设置动画 - 从按钮位置发牌
  calculateAndAnimateCards(newCards, btnCenterX, btnCenterY, middleIndex);
  
  window.currentGroup = index;
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