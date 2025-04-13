// 实现3D卡片环绕效果
document.addEventListener('DOMContentLoaded', () => {
    const carouselGroups = document.querySelectorAll('.carousel-group');
    const ROTATION_STEP = (2 * Math.PI) / 5; // 5张卡片，每张旋转72度
    const RADIUS = 400; // 旋转半径

    // 初始化每个组的卡片位置
    carouselGroups.forEach((group) => {
        const cards = group.querySelectorAll('.timeline-card');
        let currentIndex = 0;

        // 设置初始位置
        cards.forEach((card, index) => {
            const angle = ROTATION_STEP * index;
            const x = Math.sin(angle) * RADIUS;
            const z = Math.cos(angle) * RADIUS;
            card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${-angle}rad)`;
        });

        // 添加卡片点击事件
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const rotationDiff = index - currentIndex;
                currentIndex = index;

                // 更新所有卡片的位置
                cards.forEach((c, i) => {
                    const newIndex = (i - currentIndex + cards.length) % cards.length;
                    const angle = ROTATION_STEP * newIndex;
                    const x = Math.sin(angle) * RADIUS;
                    const z = Math.cos(angle) * RADIUS;

                    c.style.transition = 'transform 0.8s ease';
                    c.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${-angle}rad)`;

                    // 重置active状态
                    c.classList.remove('active');
                });

                // 设置当前卡片为active
                card.classList.add('active');
            });

            // 添加鼠标悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform += ' scale(1.05)';
            });

            card.addEventListener('mouseleave', () => {
                const currentTransform = card.style.transform.replace(' scale(1.05)', '');
                card.style.transform = currentTransform;
            });
        });

    });

    // 绑定导航按钮事件
    const navBtns = document.querySelectorAll('.nav-btn');
    const groups = document.querySelectorAll('.carousel-group');
    let currentGroupIndex = 0;

    navBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (currentGroupIndex === index) return;

            // 更新按钮状态
            navBtns[currentGroupIndex].classList.remove('active');
            btn.classList.add('active');

            // 切换组显示
            groups[currentGroupIndex].classList.remove('active');
            groups[index].classList.add('active');

            currentGroupIndex = index;
        });
    });
});