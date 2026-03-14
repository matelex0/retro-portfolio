document.addEventListener('DOMContentLoaded', () => {
    
    // Clock script in realtime
    const clockEl = document.getElementById('clock');
    function updateClock() {
        if (!clockEl) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        clockEl.textContent = timeString;
    }
    if (clockEl) {
        setInterval(updateClock, 1000);
        updateClock();
    }

    // Mail copy function
    const contactCard = document.getElementById('copy-email');
    const toast = document.getElementById('toast');
    let email = 'example@example.com'; // Default fallback

    // Fetch config.yaml
    fetch('config.yaml')
        .then(response => response.text())
        .then(text => {
            try {
                const config = jsyaml.load(text);
                
                if (!config) return;

                // 1. Profile
                if (config.profile) {
                    if (config.profile.name) {
                        const nameEl = document.querySelector('.hero-content h1 .accent');
                        if (nameEl) nameEl.textContent = config.profile.name;
                    }
                    if (config.profile.role) {
                        const roleEl = document.querySelector('.role');
                        if (roleEl) roleEl.textContent = config.profile.role;
                    }
                    if (config.profile.subtitle) {
                        const subEl = document.querySelector('.subtitle');
                        if (subEl) subEl.textContent = config.profile.subtitle;
                    }
                    if (config.profile.status) {
                        const statusEl = document.querySelector('.status-badge');
                        if (statusEl) {
                             statusEl.innerHTML = '<span class="dot"></span> ' + config.profile.status;
                        }
                    }
                    if (config.profile.location) {
                        const locEl = document.querySelector('.place');
                        if (locEl) locEl.textContent = config.profile.location;
                    }
                    if (config.profile.bio) {
                        const bioEl = document.querySelector('.terminal-text');
                        if (bioEl) bioEl.innerHTML = config.profile.bio;
                    }
                }

                // 2. Mail
                if (config.mail && config.mail.address) {
                    email = config.mail.address;
                    const emailTextEl = document.querySelector('.email-text');
                    if (emailTextEl) emailTextEl.textContent = email;
                }

                // 3. Colors
                if (config.colors) {
                    const root = document.documentElement;
                    if (config.colors.accent) root.style.setProperty('--accent', config.colors.accent);
                    if (config.colors.bg_color) root.style.setProperty('--bg-color', config.colors.bg_color);
                    if (config.colors.card_bg) root.style.setProperty('--card-bg', config.colors.card_bg);
                    if (config.colors.text_main) root.style.setProperty('--text-main', config.colors.text_main);
                }

                // 4. Stack
                if (config.stack && Array.isArray(config.stack)) {
                    const stackList = document.querySelector('.stack-list');
                    if (stackList) {
                        stackList.innerHTML = '';
                        config.stack.forEach(tech => {
                            const div = document.createElement('div');
                            div.className = 'icon';
                            div.title = tech.name;
                            div.textContent = tech.label;
                            stackList.appendChild(div);
                        });
                    }
                }

                // 5. Projects
                if (config.projects && Array.isArray(config.projects)) {
                    const projectsGrid = document.querySelector('.projects-grid');
                    if (projectsGrid) {
                        projectsGrid.innerHTML = '';
                        config.projects.forEach(proj => {
                            const card = document.createElement('div');
                            card.className = 'project-card';
                            
                            const tagsHtml = proj.tags ? proj.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join(' ') : '';

                            card.innerHTML = `
                                <div class="project-img-wrapper">
                                    <img src="${proj.image}" alt="${proj.title}">
                                </div>
                                <div class="project-details">
                                    <h4>${proj.title}</h4>
                                    ${tagsHtml}
                                    <p>${proj.description}</p>
                                    <a href="${proj.link}" target="_blank" class="link-btn">${proj.link_text}</a>
                                </div>
                            `;
                            projectsGrid.appendChild(card);
                        });
                    }
                }

                // 6. Timeline
                if (config.timeline && Array.isArray(config.timeline)) {
                    const timelineList = document.querySelector('.timeline-list');
                    if (timelineList) {
                        timelineList.innerHTML = '';
                        config.timeline.forEach(item => {
                            const li = document.createElement('li');
                            li.innerHTML = `<span class="date">${item.year}</span> <span class="event">${item.event}</span>`;
                            timelineList.appendChild(li);
                        });
                    }
                }

            } catch (e) {
                console.error('Error parsing config.yaml:', e);
            }
        })
        .catch(err => console.error('Error fetching config.yaml:', err));

    if (contactCard) {
        contactCard.addEventListener('click', () => {
            navigator.clipboard.writeText(email).then(() => {
                showToast();
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    function showToast() {
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    const workModal = document.getElementById('workModal');
    const viewWorkBtn = document.getElementById('viewWorkBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function openModal() {
        if (!workModal) return;
        workModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!workModal) return;
        workModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (viewWorkBtn) viewWorkBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    if (workModal) {
        workModal.addEventListener('click', (e) => {
            if (e.target === workModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && workModal && !workModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Game
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');
    const overlay = document.getElementById('gameOverlay');

    const dPadBtns = document.querySelectorAll('.d-pad-btn');
    
    dPadBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!isGameRunning) return;
            
            const dir = btn.getAttribute('data-dir');
            handleInput(dir);
        });
        
        btn.addEventListener('mousedown', (e) => {
            if (!isGameRunning) return;
            const dir = btn.getAttribute('data-dir');
            handleInput(dir);
        });
    });

    function handleInput(dir) {
        switch(dir) {
            case 'up':
                if (dy === 0) { dx = 0; dy = -1; }
                break;
            case 'down':
                if (dy === 0) { dx = 0; dy = 1; }
                break;
            case 'left':
                if (dx === 0) { dx = -1; dy = 0; }
                break;
            case 'right':
                if (dx === 0) { dx = 1; dy = 0; }
                break;
        }
    }

    const GRID_SIZE = 20;
    const GAME_SPEED = 100;
    
    let tileCountX = 20;
    let tileCountY = 15;
    
    let score = 0;
    let snake = [];
    let food = { x: 0, y: 0 };
    let dx = 0;
    let dy = 0;
    let gameInterval;
    let isGameRunning = false;

    function resizeCanvas() {
        const wrapper = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const rect = wrapper.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        tileCountX = Math.floor(rect.width / GRID_SIZE);
        tileCountY = Math.floor(rect.height / GRID_SIZE);
    }

    let resizeTimeout;
    function scheduleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            if (!isGameRunning) draw();
        }, 100);
    }

    const resizeObserver = new ResizeObserver(() => scheduleResize());
    resizeObserver.observe(gameContainer);
    window.addEventListener('resize', scheduleResize);
    resizeCanvas();

    function initGame() {
        resizeCanvas();
        snake = [
            { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }
        ];
        score = 0;
        scoreElement.textContent = score;
        dx = 0;
        dy = 0;
        placeFood();
        isGameRunning = true;
        overlay.classList.add('hidden');
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCountX);
        food.y = Math.floor(Math.random() * tileCountY);
        // Ensure food doesn't spawn on snake
        snake.forEach(segment => {
            if (segment.x === food.x && segment.y === food.y) placeFood();
        });
    }

    function gameLoop() {
        if (!isGameRunning) return;

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            gameOver();
            return;
        }

        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y && snake.length > 1 && (dx !== 0 || dy !== 0)) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            placeFood();
        } else {
            if (dx !== 0 || dy !== 0) {
                snake.pop();
            } else {
                snake = [head]; 
            }
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = '#0f0f13';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#9ece6a';
        snake.forEach((segment, index) => {
            if (index === 0) ctx.fillStyle = '#bb9af7';
            else ctx.fillStyle = '#9ece6a';
            
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        ctx.fillStyle = '#7aa2f7';
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }

    function gameOver() {
        isGameRunning = false;
        clearInterval(gameInterval);
        overlay.classList.remove('hidden');
        const blinkText = document.querySelector('.blink-text');
        if (blinkText) blinkText.textContent = 'GAME OVER';
        startBtn.textContent = 'TRY AGAIN';
    }

    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;

        switch(e.key) {
            case 'ArrowUp':
                handleInput('up');
                break;
            case 'ArrowDown':
                handleInput('down');
                break;
            case 'ArrowLeft':
                handleInput('left');
                break;
            case 'ArrowRight':
                handleInput('right');
                break;
        }
    });

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            initGame();
            dx = 1; dy = 0; 
        });
    }

    resizeCanvas();
    ctx.fillStyle = '#0f0f13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
