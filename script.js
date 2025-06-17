/**
 * 软件开发项目大数据展示屏交互脚本 - 优化版本
 * 作者：CTO级工程师
 * 功能：单张图片轮播、项目信息动态更新、成员模块进度展示
 * 技术栈：ES6+、DOM操作、CSS动画控制、响应式布局
 * 性能优化：防抖节流、事件委托、内存管理、滚动优化
 */

class DataDashboard {
    constructor() {
        // 配置参数 - 项目数据配置
        this.config = {
            animationDuration: 2000,
            updateInterval: 1000,
            carouselInterval: 4000,   // 轮播间隔4秒
            debounceDelay: 300
        };

        // 项目数据 - 支持单张轮播的项目信息
        this.projectData = [
            {
                title: '电商管理系统',
                description: 'React + Node.js + MongoDB',
                tags: ['前端开发', '后端开发', '数据库设计'],
                progress: 85,
                imageStart: 0,
                imageCount: 6
            },
            {
                title: '校园服务App',
                description: 'Flutter + Firebase',
                tags: ['移动开发', '云服务', 'UI设计'],
                progress: 78,
                imageStart: 6,
                imageCount: 6
            },
            {
                title: '智能推荐系统',
                description: 'Python + TensorFlow + Redis',
                tags: ['机器学习', '数据分析', '算法优化'],
                progress: 92,
                imageStart: 12,
                imageCount: 6
            },
            {
                title: '2D平台游戏',
                description: 'Unity + C# + Photon',
                tags: ['游戏引擎', '交互设计', '多人联机'],
                progress: 73,
                imageStart: 18,
                imageCount: 6
            }
        ];

        // 状态管理
        this.state = {
            currentProjectIndex: 0,
            availableImages: [],
            carouselInterval: null,
            isAnimating: false
        };

        this.init();
    }

    /**
     * 初始化应用程序
     * 功能：设置事件监听器、启动定时器、初始化轮播系统
     */
    async init() {
        try {
            this.setupEventListeners();
            this.startTimeUpdate();
            this.animateCounters();
            this.initParticleSystem();
            await this.initImageCarousel();
            this.initTeamScroll(); // 初始化团队滚动
            this.initResponsiveFeatures();
            
            // 初始化图表弹窗管理器
            setTimeout(() => {
                this.chartManager = new ChartModalManager();
            }, 200);
            
            console.log('✅ 大数据展示屏初始化完成');
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            this.handleError(error);
        }
    }

    /**
     * 设置事件监听器
     * 功能：响应式设计、指示器点击、项目切换
     */
    setupEventListeners() {
        // 指示器点击事件
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('indicator')) {
                const projectIndex = parseInt(event.target.dataset.project);
                this.switchToProject(projectIndex);
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), this.config.debounceDelay));
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // 键盘导航
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * 启动时间更新
     * 功能：实时显示当前时间
     */
    startTimeUpdate() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
            
            setTimeout(updateTime, this.config.updateInterval);
        };
        
        updateTime();
    }

    /**
     * 初始化数字计数动画
     * 功能：头部统计数字的动画效果
     */
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            let current = 0;
            const increment = target / 60; // 60帧动画
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // 延迟启动动画
            setTimeout(updateCounter, Math.random() * 1000);
        });
    }

    /**
     * 初始化粒子系统
     * 功能：背景粒子动画效果
     */
    initParticleSystem() {
        const particles = document.querySelectorAll('.particle');
        
        particles.forEach((particle, index) => {
            // 随机初始位置
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = (index * 2) + 's';
            particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        });
    }

    /**
     * 初始化图片轮播系统 - 核心功能
     * 功能：加载所有图片，启动单张轮播展示
     */
    async initImageCarousel() {
        try {
            // 获取所有可用图片
            await this.loadAvailableImages();
            
            if (this.state.availableImages.length === 0) {
                console.warn('⚠️ 未找到可用图片，显示默认占位符');
                return;
            }

            // 初始化主轮播容器
            this.setupMainCarousel();
            
            // 显示第一个项目
            this.switchToProject(0);
            
            // 启动自动轮播
            this.startAutoCarousel();
            
            console.log(`✅ 图片轮播系统初始化完成，共找到 ${this.state.availableImages.length} 张图片`);
            
        } catch (error) {
            console.error('❌ 图片轮播初始化失败:', error);
        }
    }

    /**
     * 加载所有可用图片
     * 功能：检测image文件夹中的所有图片
     */
    async loadAvailableImages() {
        // 常见的图片文件名模式
        const imagePatterns = [
            // 数字命名
            '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png',
            '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png', '18.png', '19.png', '20.png',
            '21.png', '22.png', '23.png', '24.png', '25.png', '26.png', '27.png', '28.png', '29.png', '30.png',
            
            // JPG格式
            '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
            '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
            '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg',
            
            // 中文命名文件（根据实际图片）
            '数据库设计图.png',
            '购物车选购.png',
            'Snipaste_2024-01-15_14-22-30.jpg',
            'Snipaste_2024-01-15_14-23-45.jpg',
            'Snipaste_2024-01-15_14-24-12.jpg',
            'Snipaste_2024-01-15_14-25-38.jpg',
            'Snipaste_2024-01-15_14-26-55.jpg'
        ];

        const validImages = [];

        // 并发检查所有图片
        const checkPromises = imagePatterns.map(async (filename) => {
            try {
                const imagePath = `image/${filename}`;
                const exists = await this.checkImageExists(imagePath);
                if (exists) {
                    validImages.push(imagePath);
                }
            } catch (error) {
                // 忽略单个图片加载失败
            }
        });

        await Promise.all(checkPromises);
        
        // 随机打乱图片顺序，增加展示随机性
        this.state.availableImages = this.shuffleArray(validImages);
        
        console.log(`📸 发现可用图片:`, this.state.availableImages);
    }

    /**
     * 检查图片是否存在
     * 功能：通过创建Image对象检查图片是否可用
     */
    checkImageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
            
            // 3秒超时
            setTimeout(() => resolve(false), 3000);
        });
    }

    /**
     * 设置主轮播容器
     * 功能：初始化单张图片轮播的DOM结构
     */
    setupMainCarousel() {
        const carousel = document.getElementById('main-carousel');
        if (!carousel) return;

        // 清空现有内容
        carousel.innerHTML = '';

        // 创建单张图片容器
        const imageContainer = document.createElement('div');
        imageContainer.className = 'main-carousel-image';
        imageContainer.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            border-radius: clamp(6px, 0.8vw, 10px);
            background: var(--background-light);
        `;

        // 创建图片元素
        const img = document.createElement('img');
        img.className = 'carousel-main-img';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.8s ease-in-out;
            opacity: 0;
        `;
        img.loading = 'lazy';

        imageContainer.appendChild(img);
        carousel.appendChild(imageContainer);
    }

    /**
     * 切换到指定项目
     * 功能：更新项目信息和对应图片
     */
    switchToProject(projectIndex) {
        if (this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        this.state.currentProjectIndex = projectIndex;
        
        const project = this.projectData[projectIndex];
        
        // 更新指示器状态
        this.updateIndicators(projectIndex);
        
        // 更新项目信息
        this.updateProjectInfo(project);
        
        // 更新项目图片
        this.updateProjectImage(project);
        
        // 重新启动自动轮播
        this.restartAutoCarousel();
        
        setTimeout(() => {
            this.state.isAnimating = false;
        }, 800);
    }

    /**
     * 更新指示器状态
     * 功能：高亮当前项目的指示器
     */
    updateIndicators(activeIndex) {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === activeIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    /**
     * 更新项目信息
     * 功能：更新标题、描述、标签、进度等信息
     */
    updateProjectInfo(project) {
        // 更新标题
        const titleElement = document.getElementById('current-project-title');
        if (titleElement) {
            titleElement.style.opacity = '0';
            setTimeout(() => {
                titleElement.textContent = project.title;
                titleElement.style.opacity = '1';
            }, 400);
        }

        // 更新描述
        const descElement = document.getElementById('current-project-desc');
        if (descElement) {
            descElement.style.opacity = '0';
            setTimeout(() => {
                descElement.textContent = project.description;
                descElement.style.opacity = '1';
            }, 500);
        }

        // 更新标签
        const tagsElement = document.getElementById('current-project-tags');
        if (tagsElement) {
            tagsElement.style.opacity = '0';
            setTimeout(() => {
                tagsElement.innerHTML = project.tags.map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join('');
                tagsElement.style.opacity = '1';
            }, 600);
        }

        // 更新进度
        const progressElement = document.getElementById('current-progress');
        const progressFill = document.getElementById('progress-fill');
        if (progressElement && progressFill) {
            progressElement.style.opacity = '0';
            setTimeout(() => {
                progressElement.textContent = project.progress + '%';
                progressFill.style.width = project.progress + '%';
                progressElement.style.opacity = '1';
            }, 700);
        }
    }

    /**
     * 更新项目图片
     * 功能：显示对应项目的图片
     */
    updateProjectImage(project) {
        const img = document.querySelector('.carousel-main-img');
        if (!img || this.state.availableImages.length === 0) return;

        // 为该项目分配图片
        const projectImages = this.getProjectImages(project);
        if (projectImages.length === 0) return;

        // 随机选择一张图片
        const randomImage = projectImages[Math.floor(Math.random() * projectImages.length)];
        
        // 淡出当前图片
        img.style.opacity = '0';
        
        // 加载新图片
        setTimeout(() => {
            img.src = randomImage;
            img.onload = () => {
                img.style.opacity = '1';
            };
        }, 400);
    }

    /**
     * 获取项目对应的图片
     * 功能：根据项目索引分配对应的图片组
     */
    getProjectImages(project) {
        if (this.state.availableImages.length === 0) return [];
        
        const totalImages = this.state.availableImages.length;
        const imagesPerProject = Math.ceil(totalImages / this.projectData.length);
        
        const startIndex = project.imageStart || 0;
        const endIndex = Math.min(startIndex + imagesPerProject, totalImages);
        
        return this.state.availableImages.slice(startIndex, endIndex);
    }

    /**
     * 启动自动轮播
     * 功能：自动切换项目和图片
     */
    startAutoCarousel() {
        this.clearAutoCarousel();
        
        this.state.carouselInterval = setInterval(() => {
            const nextIndex = (this.state.currentProjectIndex + 1) % this.projectData.length;
            this.switchToProject(nextIndex);
        }, this.config.carouselInterval);
    }

    /**
     * 重新启动自动轮播
     * 功能：用户交互后重新开始计时
     */
    restartAutoCarousel() {
        this.clearAutoCarousel();
        
        // 延迟重新启动，给用户查看时间
        setTimeout(() => {
            this.startAutoCarousel();
        }, 2000);
    }

    /**
     * 清除自动轮播
     */
    clearAutoCarousel() {
        if (this.state.carouselInterval) {
            clearInterval(this.state.carouselInterval);
            this.state.carouselInterval = null;
        }
    }

    /**
     * 初始化响应式特性
     * 功能：滚动优化、性能监控
     */
    initResponsiveFeatures() {
        // 学习情况统计区域滚动优化
        const statsContainer = document.querySelector('.stats-container');
        if (statsContainer) {
            // 添加滚动渐变效果
            statsContainer.addEventListener('scroll', this.debounce(() => {
                const scrollTop = statsContainer.scrollTop;
                const scrollHeight = statsContainer.scrollHeight - statsContainer.clientHeight;
                const scrollPercent = scrollTop / scrollHeight;
                
                // 更新滚动指示器（如果需要）
                console.log(`📊 学习统计滚动进度: ${Math.round(scrollPercent * 100)}%`);
            }, 100));
        }

        // 成员卡片交互增强
        this.enhanceMemberCards();
    }

    /**
     * 增强成员卡片交互
     * 功能：悬停效果、进度条动画
     */
    enhanceMemberCards() {
        const memberCards = document.querySelectorAll('.member-card');
        
        memberCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // 添加悬停发光效果
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.3)';
                
                // 进度数字闪烁效果
                const progress = card.querySelector('.member-progress');
                if (progress) {
                    progress.style.animation = 'pulse 0.6s ease-in-out';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
                
                const progress = card.querySelector('.member-progress');
                if (progress) {
                    progress.style.animation = '';
                }
            });
        });
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        console.log('🔄 响应式布局调整中...');
        
        // 重新计算图片尺寸
        this.recalculateImageSizes();
        
        // 重新初始化粒子系统
        this.initParticleSystem();
    }

    /**
     * 重新计算图片尺寸
     */
    recalculateImageSizes() {
        const img = document.querySelector('.carousel-main-img');
        if (img) {
            // 强制重新渲染
            img.style.transform = 'scale(1.001)';
            setTimeout(() => {
                img.style.transform = '';
            }, 50);
        }
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.clearAutoCarousel();
            console.log('⏸️ 页面隐藏，暂停轮播');
        } else {
            this.startAutoCarousel();
            console.log('▶️ 页面显示，恢复轮播');
        }
    }

    /**
     * 处理键盘事件
     */
    handleKeyDown(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                const prevIndex = (this.state.currentProjectIndex - 1 + this.projectData.length) % this.projectData.length;
                this.switchToProject(prevIndex);
                break;
            case 'ArrowRight':
                event.preventDefault();
                const nextIndex = (this.state.currentProjectIndex + 1) % this.projectData.length;
                this.switchToProject(nextIndex);
                break;
            case ' ':
                event.preventDefault();
                if (this.state.carouselInterval) {
                    this.clearAutoCarousel();
                } else {
                    this.startAutoCarousel();
                }
                break;
        }
    }

    /**
     * 数组打乱函数
     * 功能：Fisher-Yates洗牌算法
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 防抖函数
     * 功能：性能优化，避免频繁触发
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * 初始化团队滚动效果
     * 功能：创建无缝循环滚动的团队成员列表
     */
    initTeamScroll() {
        const scrollContent = document.getElementById('team-scroll');
        if (!scrollContent) {
            console.warn('⚠️ 团队滚动容器未找到');
            return;
        }

        // 克隆所有成员卡片，创建无缝循环效果
        const memberCards = scrollContent.querySelectorAll('.member-card');
        if (memberCards.length === 0) {
            console.warn('⚠️ 未找到团队成员卡片');
            return;
        }

        // 复制所有成员卡片到容器末尾，形成无缝循环
        memberCards.forEach(card => {
            const clonedCard = card.cloneNode(true);
            scrollContent.appendChild(clonedCard);
        });

        // 鼠标悬停暂停滚动事件
        const scrollWrapper = scrollContent.parentElement;
        if (scrollWrapper) {
            scrollWrapper.addEventListener('mouseenter', () => {
                scrollContent.style.animationPlayState = 'paused';
            });

            scrollWrapper.addEventListener('mouseleave', () => {
                scrollContent.style.animationPlayState = 'running';
            });
        }

        console.log('✅ 团队滚动效果初始化完成，共', memberCards.length * 2, '个成员卡片');
    }

    /**
     * 错误处理
     * 功能：统一错误处理和日志记录
     */
    handleError(error) {
        console.error('🚨 系统错误:', error);
        
        // 在生产环境中，这里可以发送错误到监控服务
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'exception', {
                'description': error.message,
                'fatal': false
            });
        }
    }

    /**
     * 销毁实例
     * 功能：清理资源，防止内存泄漏
     */
    destroy() {
        this.clearAutoCarousel();
        
        // 移除事件监听器
        document.removeEventListener('click', this.handleClick);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        console.log('🧹 大数据展示屏已清理');
    }
}

// 添加CSS动画样式
const dynamicStyles = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .main-carousel-image {
        position: relative;
        overflow: hidden;
    }
    
    .main-carousel-image::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.1) 50%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
    }
    
    .main-carousel-image:hover::before {
        opacity: 1;
    }
    
    .carousel-main-img {
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .carousel-main-img:hover {
        transform: scale(1.02);
    }
`;

// 注入动态样式
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// 初始化应用
let dashboard;

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboard = new DataDashboard();
    });
} else {
    dashboard = new DataDashboard();
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});

/**
 * 数据图表弹窗管理类
 * 功能：管理四个统计卡片的图表弹窗显示
 * 技术栈：Chart.js + Canvas API + 模态框设计
 */
class ChartModalManager {
    constructor() {
        this.modal = document.getElementById('chartModal');
        this.chartTitle = document.getElementById('chartTitle');
        this.chartCanvas = document.getElementById('chartCanvas');
        this.chartContainer = document.getElementById('chartContainer');
        this.closeBtn = document.getElementById('chartCloseBtn');
        this.currentChart = null;
        
        this.initializeEventListeners();
        console.log('📊 图表弹窗管理器初始化完成');
    }

    /**
     * 初始化事件监听器
     * 为统计卡片和关闭按钮绑定事件
     */
    initializeEventListeners() {
        // 为统计卡片添加点击事件
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const cardType = this.getCardType(card);
                this.showChart(cardType);
            });
        });

        // 关闭按钮事件
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // 点击背景关闭模态框
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    /**
     * 根据卡片DOM获取卡片类型
     */
    getCardType(card) {
        const title = card.querySelector('h3').textContent;
        const typeMap = {
            '项目周期': 'timeline',
            '代码提交': 'commits',
            '技术栈': 'techstack',
            '完成率': 'completion'
        };
        return typeMap[title] || 'timeline';
    }

    /**
     * 显示对应类型的图表
     */
    showChart(type) {
        const chartConfigs = {
            timeline: {
                title: '📅 项目周期 - 开发时间线分析',
                method: () => this.createTimelineChart()
            },
            commits: {
                title: '💻 代码提交 - 开发活跃度趋势',
                method: () => this.createCommitsChart()
            },
            techstack: {
                title: '🔧 技术栈 - 技能掌握度雷达',
                method: () => this.createTechStackChart()
            },
            completion: {
                title: '🎯 完成率 - 模块进度监控',
                method: () => this.createCompletionChart()
            }
        };

        const config = chartConfigs[type];
        if (config) {
            this.chartTitle.textContent = config.title;
            this.openModal();
            
            // 延迟创建图表，确保模态框已显示
            setTimeout(() => {
                config.method();
            }, 300);
        }
    }

    /**
     * 创建项目周期甘特图
     */
    createTimelineChart() {
        this.clearChart();
        
        const ctx = this.chartCanvas.getContext('2d');
        
        // 项目阶段数据
        const phases = [
            { name: '需求分析', start: 0, duration: 14, color: '#00D4FF' },
            { name: '系统设计', start: 14, duration: 14, color: '#FF6B35' },
            { name: '核心开发', start: 28, duration: 35, color: '#00FF88' },
            { name: '测试部署', start: 63, duration: 21, color: '#FFD700' }
        ];

        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: phases.map(p => p.name),
                datasets: [{
                    label: '项目天数',
                    data: phases.map(p => p.duration),
                    backgroundColor: phases.map(p => p.color + '80'),
                    borderColor: phases.map(p => p.color),
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '软件开发项目生命周期 (84天)',
                        color: '#00D4FF',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#FFFFFF' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#FFFFFF' }
                    }
                }
            }
        });

        // 添加详细信息
        this.addTimelineInfo();
    }

    /**
     * 创建代码提交趋势图
     */
    createCommitsChart() {
        this.clearChart();
        
        const ctx = this.chartCanvas.getContext('2d');
        
        // 12周的提交数据
        const weeks = Array.from({length: 12}, (_, i) => `第${i+1}周`);
        const commitData = [45, 67, 89, 123, 156, 178, 134, 167, 189, 201, 145, 98];
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeks,
                datasets: [{
                    label: '代码提交次数',
                    data: commitData,
                    borderColor: '#00D4FF',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B35',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '团队代码提交活跃度 (累计1247次)',
                        color: '#00D4FF',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#FFFFFF' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#FFFFFF' }
                    }
                }
            }
        });

        this.addCommitsInfo();
    }

    /**
     * 创建技术栈雷达图
     */
    createTechStackChart() {
        this.clearChart();
        
        const ctx = this.chartCanvas.getContext('2d');
        
        const techData = {
            labels: ['前端开发', '后端开发', '数据库', '移动端', '测试', 'DevOps', 'AI算法', '安全'],
            datasets: [{
                label: '团队掌握度',
                data: [92, 88, 85, 76, 91, 74, 68, 82],
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                borderColor: '#00D4FF',
                borderWidth: 2,
                pointBackgroundColor: '#FF6B35',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        };

        this.currentChart = new Chart(ctx, {
            type: 'radar',
            data: techData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '团队技术栈能力雷达 (15+技术领域)',
                        color: '#00D4FF',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#FFFFFF', font: { size: 12 } },
                        ticks: { color: '#FFFFFF', backdropColor: 'transparent' }
                    }
                }
            }
        });

        this.addTechStackInfo();
    }

    /**
     * 创建完成率环形图
     */
    createCompletionChart() {
        this.clearChart();
        
        const ctx = this.chartCanvas.getContext('2d');
        
        const modules = [
            { name: '用户界面', completion: 92 },
            { name: '服务端API', completion: 87 },
            { name: '数据处理', completion: 90 },
            { name: '移动端', completion: 85 },
            { name: '测试验证', completion: 91 },
            { name: '部署运维', completion: 88 }
        ];

        this.currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: modules.map(m => m.name),
                datasets: [{
                    data: modules.map(m => m.completion),
                    backgroundColor: [
                        '#00D4FF', '#FF6B35', '#00FF88', 
                        '#FFD700', '#FF69B4', '#9370DB'
                    ],
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '项目模块完成度分布 (总体96%)',
                        color: '#00D4FF',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#FFFFFF', font: { size: 12 } }
                    }
                },
                cutout: '60%'
            }
        });

        this.addCompletionInfo();
    }

    /**
     * 添加项目周期详细信息
     */
    addTimelineInfo() {
        this.chartContainer.innerHTML = `
            <div class="chart-info-grid">
                <div class="chart-info-card">
                    <h4>需求分析</h4>
                    <div class="value">2周</div>
                    <div class="desc">用户调研、需求收集</div>
                </div>
                <div class="chart-info-card">
                    <h4>系统设计</h4>
                    <div class="value">2周</div>
                    <div class="desc">架构设计、接口设计</div>
                </div>
                <div class="chart-info-card">
                    <h4>核心开发</h4>
                    <div class="value">5周</div>
                    <div class="desc">功能实现、代码编写</div>
                </div>
                <div class="chart-info-card">
                    <h4>测试部署</h4>
                    <div class="value">3周</div>
                    <div class="desc">质量保证、上线部署</div>
                </div>
            </div>
        `;
    }

    /**
     * 添加代码提交详细信息
     */
    addCommitsInfo() {
        this.chartContainer.innerHTML = `
            <div class="chart-info-grid">
                <div class="chart-info-card">
                    <h4>活跃贡献者</h4>
                    <div class="value">14人</div>
                    <div class="desc">全员参与开发</div>
                </div>
                <div class="chart-info-card">
                    <h4>代码行数</h4>
                    <div class="value">35.2K</div>
                    <div class="desc">高质量代码输出</div>
                </div>
                <div class="chart-info-card">
                    <h4>峰值提交</h4>
                    <div class="value">201次/周</div>
                    <div class="desc">第10周达到峰值</div>
                </div>
                <div class="chart-info-card">
                    <h4>提交频率</h4>
                    <div class="value">15次/天</div>
                    <div class="desc">持续集成开发</div>
                </div>
            </div>
        `;
    }

    /**
     * 添加技术栈详细信息
     */
    addTechStackInfo() {
        this.chartContainer.innerHTML = `
            <div class="chart-info-grid">
                <div class="chart-info-card">
                    <h4>前端技术</h4>
                    <div class="value">React/Vue</div>
                    <div class="desc">现代化UI框架</div>
                </div>
                <div class="chart-info-card">
                    <h4>后端技术</h4>
                    <div class="value">Node.js/Java</div>
                    <div class="desc">企业级后端方案</div>
                </div>
                <div class="chart-info-card">
                    <h4>数据库</h4>
                    <div class="value">MySQL/MongoDB</div>
                    <div class="desc">关系型+文档型</div>
                </div>
                <div class="chart-info-card">
                    <h4>云服务</h4>
                    <div class="value">AWS/Docker</div>
                    <div class="desc">容器化部署</div>
                </div>
            </div>
        `;
    }

    /**
     * 添加完成率详细信息
     */
    addCompletionInfo() {
        this.chartContainer.innerHTML = `
            <div class="chart-info-grid">
                <div class="chart-info-card">
                    <h4>最高完成率</h4>
                    <div class="value">92%</div>
                    <div class="desc">用户界面模块</div>
                </div>
                <div class="chart-info-card">
                    <h4>平均完成率</h4>
                    <div class="value">88.8%</div>
                    <div class="desc">整体进度良好</div>
                </div>
                <div class="chart-info-card">
                    <h4>待优化模块</h4>
                    <div class="value">移动端</div>
                    <div class="desc">85%需提升</div>
                </div>
                <div class="chart-info-card">
                    <h4>预计交付</h4>
                    <div class="value">1周内</div>
                    <div class="desc">按计划完成</div>
                </div>
            </div>
        `;
    }

    /**
     * 打开模态框
     */
    openModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        this.clearChart();
    }

    /**
     * 清除当前图表
     */
    clearChart() {
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
        this.chartContainer.innerHTML = '';
    }
}

// 导出到全局作用域（用于调试）
window.DataDashboard = DataDashboard;
window.ChartModalManager = ChartModalManager;
window.dashboard = dashboard; 