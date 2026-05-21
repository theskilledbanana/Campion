// main.js - Vanilla JS Logic for MediaVault
const allEntries = [
    {
    "id": "bitlife",
    "title": "BitLife",
    "iframeUrl": "https://only-game.github.io/projects/bitlife/index.html",
    "thumbnail": "https://i.ibb.co/WN05w1Mr/bitlife.png",
    "categories": ["Simulation", "Trending Games"],
    "description": "Live your virtual life and make choices that determine your destiny."
  },
  {
    "id": "retro-bowl",
    "title": "Retro Bowl",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-24",
    "thumbnail": "https://upload.wikimedia.org/wikipedia/en/b/bf/Retro_Bowl_cover.png",
    "categories": ["Sport", "Trending Games"],
    "description": "The ultimate retro-style American football management sim. Call the plays, manage your roster, and lead your team to victory in this addictive pixel-art classic."
  },
  {
    "id": "geometry-dash",
    "title": "Geometry Dash",
    "iframeUrl": "https://web-dashers.github.io/",
    "thumbnail": "https://static.wikia.nocookie.net/b213ondiscord/images/a/a6/Geometrydash.png/revision/latest?cb=20200721125515",
    "categories": ["Skill", "Trending Games"],
    "description": "Jump, fly, and flip your way through dangerous passages and spiky obstacles in this high-intensity rhythm-based action platformer."
  },
  {
    "id": "slope",
    "title": "Slope",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-26",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUM15tsz1rOyZ_8gi3Vvjxu_6Un3bgbwuteg&s",
    "categories": ["Skill", "Trending Games"],
    "description": "Test your reflexes in this high-speed obstacle course. Navigate through a shifting neon world where one wrong move ends the run."
  },
  {
    "id": "indian-truck-driving-simulator",
    "title": "Indian Truck Driving Simulator",
    "iframeUrl": "https://oshkii.github.io/indiantruckdrivingsimulator-webport/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGJvjj2YumCANX_Xd8bcJmXeJnqigOh5y0gg&s",
    "categories": ["Simulation", "Driving"],
    "description": "Experience the thrill of navigating massive rigs through challenging Indian landscapes. Master the art of heavy transport in this high-octane driving simulator."
  },
  {
    "id": "drive-mad",
    "title": "Drive Mad",
    "iframeUrl": "https://xg4321.github.io/drivemad-gnmathport/",
    "thumbnail": "https://maddrive.io/cache/data/image/game/drive-mad2-f500x500.webp",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Navigate through increasingly difficult obstacle courses in this physics-based driving game. Master the art of balance and speed to reach the finish line."
  }
];

let currentCategory = 'All';
let currentSearch = '';

const itemsGrid = document.getElementById('items-grid');
const categoriesNav = document.getElementById('categories-nav');
const searchInput = document.getElementById('search-input');
const playerOverlay = document.getElementById('player-overlay');
const gameIframe = document.getElementById('game-area');
const playerTitle = document.getElementById('player-title');
const playerCategory = document.getElementById('player-category');
const closePlayerBtn = document.getElementById('close-player');
const mobileBackButton = document.getElementById('mobile-back-button');
const refreshPlayerBtn = document.getElementById('refresh-player');
const fullscreenPlayerBtn = document.getElementById('fullscreen-player');
const iframeLoader = document.getElementById('iframe-loader');
const dismissLoaderBtn = document.getElementById('dismiss-loader');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const instructionsModal = document.getElementById('instructions-modal');
const instructionsContainer = document.getElementById('instructions-container');
const closeInstructionsBtn = document.getElementById('close-instructions');
const loaderHowToPlayBtn = document.getElementById('loader-how-to-play');
const updateSiteBtn = document.getElementById('update-site-btn');
const updateModal = document.getElementById('update-modal');
const updateContainer = document.getElementById('update-container');
const closeUpdateBtn = document.getElementById('close-update');
const disclaimerModal = document.getElementById('disclaimer-modal');
const disclaimerContainer = document.getElementById('disclaimer-container');
const acceptDisclaimerBtn = document.getElementById('accept-disclaimer');
const randomBtn = document.getElementById('random-btn');
const terminalModal = document.getElementById('terminal-modal');
const terminalContainer = document.getElementById('terminal-container');
const terminalInput = document.getElementById('terminal-input');
const terminalResults = document.getElementById('terminal-results');

function init() {
    renderCategories();
    renderItems();
    setupEventListeners();
    showDisclaimer();
    startSystemTicker();
}

function startSystemTicker() {
    const ticker = document.getElementById('system-ticker');
    if (!ticker) return;
    
    setInterval(() => {
        const baud = [4800, 9600, 14400, 19200, 38400, 57600, 115200][Math.floor(Math.random() * 7)];
        const mem = Math.floor(Math.random() * 15) + 75;
        const cpu = (Math.random() * 5).toFixed(1);
        ticker.textContent = `Baud: ${baud} // MEM: ${mem}% // CPU: ${cpu}%`;
    }, 3000);
}

function showDisclaimer() {
    if (!disclaimerModal) return;
    
    disclaimerModal.classList.remove('hidden');
    setTimeout(() => {
        disclaimerModal.classList.remove('opacity-0');
        disclaimerContainer.classList.remove('scale-90');
        disclaimerContainer.classList.add('scale-100');
    }, 100);
}

function hideDisclaimer() {
    disclaimerModal.classList.add('opacity-0');
    disclaimerContainer.classList.remove('scale-100');
    disclaimerContainer.classList.add('scale-90');
    setTimeout(() => {
        disclaimerModal.classList.add('hidden');
    }, 700);
}

function renderCategories() {
    const rawCategories = [...new Set(allEntries.flatMap(e => e.categories))];
    // Ensure "Trending Games" is at the start if it exists
    const sortedCategories = rawCategories.sort((a, b) => {
        if (a === 'Trending Games') return -1;
        if (b === 'Trending Games') return 1;
        return a.localeCompare(b);
    });
    
    const categories = ['All', ...sortedCategories];
    
    // Clear existing buttons (except the label)
    const label = categoriesNav.querySelector('div');
    categoriesNav.innerHTML = '';
    categoriesNav.appendChild(label);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
            currentCategory === category 
            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] translate-y-[-1px]' 
            : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-zinc-300 hover:border-white/10'
        }`;
        btn.textContent = category;
        btn.onclick = () => {
            currentCategory = category;
            renderCategories();
            renderItems();
        };
        categoriesNav.appendChild(btn);
    });
}

function renderItems() {
    itemsGrid.innerHTML = '';
    
    const filtered = allEntries.filter(item => {
        const matchesCategory = currentCategory === 'All' || item.categories.includes(currentCategory);
        const matchesSearch = item.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                             item.description.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        itemsGrid.innerHTML = `
            <div class="col-span-full py-32 text-center">
                <div class="inline-block p-10 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5">
                        <i class="bi bi-grid-3x3-gap text-zinc-700 text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tight uppercase">Void Detected</h3>
                    <p class="text-zinc-500 mt-2 font-medium max-w-xs mx-auto">No interactive modules match your current decryption parameters.</p>
                    <button onclick="currentSearch=''; searchInput.value=''; renderItems();" class="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors">Reset Query</button>
                </div>
            </div>`;
        return;
    }

    filtered.forEach((item, index) => {
        const isSpecialFraming = item.id === 'retro-bowl' || item.id === 'geometry-dash' || item.id === 'drive-mad';
        const nodeId = `V-P node [${(index + 101).toString(16).toUpperCase()}]`;
        const card = document.createElement('div');
        card.className = "group relative bg-zinc-900/40 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl backdrop-blur-sm hover:-translate-y-2 hover:shadow-cyan-500/10";
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden bg-zinc-950">
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full ${isSpecialFraming ? 'object-contain' : 'object-cover'} transition-transform duration-700 group-hover:scale-105" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60"></div>
                <div class="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- Data Fragments -->
                <div class="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span class="text-[8px] font-mono text-cyan-400/50 uppercase tracking-widest bg-zinc-950/80 px-2 py-0.5 rounded border border-cyan-500/20">${nodeId}</span>
                </div>

                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <div class="bg-white text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-tighter shadow-2xl flex items-center gap-2">
                        <span>Initialize Link</span>
                        <i class="bi bi-arrow-right-short text-xl group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </div>
            </div>
            <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        ${item.categories.map(cat => `
                            <span class="text-[10px] font-bold text-cyan-400/80 px-2 py-0.5 bg-cyan-400/5 border border-cyan-400/10 rounded uppercase tracking-[0.1em] font-mono">${cat}</span>
                        `).join('')}
                    </div>
                    <span class="text-[9px] font-mono text-zinc-700 font-bold group-hover:text-cyan-900 transition-colors">v2.4.0</span>
                </div>
                <h3 class="text-zinc-100 font-extrabold text-xl tracking-tight leading-tight group-hover:text-cyan-400 transition-colors uppercase italic">${item.title}</h3>
                <p class="text-zinc-500 text-sm line-clamp-2 mt-2 font-medium leading-relaxed">${item.description}</p>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        itemsGrid.appendChild(card);
    });
}

function openPlayer(item) {
    playerTitle.textContent = item.title;
    playerCategory.textContent = item.categories.join(' / ');
    
    // Set fallback links href
    const fallbackLink = document.getElementById('external-link');
    const loaderLink = document.getElementById('loader-external-link');
    
    if (fallbackLink) fallbackLink.href = item.iframeUrl;
    if (loaderLink) loaderLink.href = item.iframeUrl;

    // Reset loader state
    iframeLoader.classList.remove('hidden');
    gameIframe.classList.add('opacity-0');

    gameIframe.src = item.iframeUrl;
    playerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePlayer() {
    playerOverlay.classList.add('hidden');
    gameIframe.src = '';
    gameIframe.classList.add('opacity-0');
    document.body.style.overflow = '';
}

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderItems();
    });

    if (randomBtn) {
        randomBtn.onclick = () => {
            const originalContent = randomBtn.innerHTML;
            randomBtn.innerHTML = `<i class="bi bi-cpu text-lg animate-spin"></i><span>Decrypting...</span>`;
            randomBtn.classList.add('pointer-events-none', 'opacity-70');
            
            setTimeout(() => {
                const randomItem = allEntries[Math.floor(Math.random() * allEntries.length)];
                openPlayer(randomItem);
                randomBtn.innerHTML = originalContent;
                randomBtn.classList.remove('pointer-events-none', 'opacity-70');
            }, 1000);
        };
    }

    // Terminal Logic
    const openTerminal = () => {
        terminalModal.classList.remove('hidden');
        setTimeout(() => {
            terminalModal.classList.remove('opacity-0');
            terminalContainer.classList.remove('scale-95');
            terminalContainer.classList.add('scale-100');
            terminalInput.focus();
            renderTerminalResults();
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeTerminal = () => {
        terminalModal.classList.add('opacity-0');
        terminalContainer.classList.remove('scale-100');
        terminalContainer.classList.add('scale-95');
        setTimeout(() => {
            terminalModal.classList.add('hidden');
            if (playerOverlay.classList.contains('hidden') && instructionsModal.classList.contains('hidden')) {
                document.body.style.overflow = '';
            }
        }, 300);
    };

    const renderTerminalResults = (query = '') => {
        terminalResults.innerHTML = '';
        
        const commands = [
            { cmd: '/random', desc: 'Initialize random session link' },
            { cmd: '/clear', desc: 'Reset all active filters/queries' },
            { cmd: '/about', desc: 'Display system architecture specs' },
            { cmd: '/theme', desc: 'Cycle interface accent protocols' }
        ];

        const games = allEntries.filter(g => g.title.toLowerCase().includes(query.toLowerCase()));
        
        if (query.startsWith('/')) {
            const filteredCmds = commands.filter(c => c.cmd.startsWith(query.toLowerCase()));
            filteredCmds.forEach(c => {
                const div = document.createElement('div');
                div.className = "px-6 py-4 hover:bg-white/5 border-b border-white/5 cursor-pointer flex items-center justify-between group";
                div.innerHTML = `
                    <div class="flex items-center gap-4">
                        <i class="bi bi-terminal text-cyan-400"></i>
                        <div>
                            <p class="text-cyan-400 font-mono text-sm">${c.cmd}</p>
                            <p class="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">${c.desc}</p>
                        </div>
                    </div>
                    <i class="bi bi-arrow-right-short text-zinc-800 group-hover:text-cyan-400 transition-colors text-xl"></i>
                `;
                div.onclick = () => executeCommand(c.cmd);
                terminalResults.appendChild(div);
            });
        }

        games.forEach(g => {
            const div = document.createElement('div');
            div.className = "px-6 py-4 hover:bg-white/5 border-b border-white/5 cursor-pointer flex items-center justify-between group";
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                        <img src="${g.thumbnail}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity">
                    </div>
                    <div>
                        <p class="text-zinc-300 font-bold text-sm uppercase italic tracking-tighter">${g.title}</p>
                        <p class="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.1em] font-mono">${g.categories.join(' // ')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-[8px] font-mono text-zinc-800 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">Node: En-0${Math.floor(Math.random()*9)}</span>
                    <i class="bi bi-arrow-right-short text-zinc-800 group-hover:text-cyan-400 transition-colors text-xl"></i>
                </div>
            `;
            div.onclick = () => {
                openPlayer(g);
                closeTerminal();
            };
            terminalResults.appendChild(div);
        });

        if (games.length === 0 && !query.startsWith('/')) {
            terminalResults.innerHTML = `
                <div class="px-6 py-12 text-center">
                    <i class="bi bi-slash-circle text-zinc-800 text-3xl mb-4"></i>
                    <p class="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">No matching nodes found in directory</p>
                </div>
            `;
        }
    };

    const executeCommand = (cmd) => {
        if (cmd === '/random') {
            const randomItem = allEntries[Math.floor(Math.random() * allEntries.length)];
            openPlayer(randomItem);
            closeTerminal();
        } else if (cmd === '/clear') {
            currentSearch = '';
            searchInput.value = '';
            renderItems();
            closeTerminal();
        } else if (cmd === '/about') {
            alert('Vault Portal v2.4.0\nKernel: 0.11.4-LTS\nMaintainer: V-P Control Node\nStatus: Secure');
        } else if (cmd === '/theme') {
            const colors = ['#22d3ee', '#4ade80', '#f87171', '#c084fc'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.documentElement.style.setProperty('--cyan-500', randomColor);
            // This is a bit hacky as tailwind uses its own vars, but for custom styles it works
            closeTerminal();
        }
    };

    terminalInput.addEventListener('input', (e) => renderTerminalResults(e.target.value));
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = terminalInput.value;
            if (query.startsWith('/')) {
                executeCommand(query.trim());
            } else {
                const firstGame = allEntries.find(g => g.title.toLowerCase().includes(query.toLowerCase()));
                if (firstGame) {
                    openPlayer(firstGame);
                    closeTerminal();
                }
            }
        }
    });

    closePlayerBtn.onclick = closePlayer;
    if (mobileBackButton) {
        mobileBackButton.onclick = closePlayer;
        
        // Simple drag functionality for the mobile back button
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        mobileBackButton.addEventListener("mousedown", dragStart);
        mobileBackButton.addEventListener("touchstart", dragStart);
        document.addEventListener("mousemove", drag);
        document.addEventListener("touchmove", drag);
        document.addEventListener("mouseup", dragEnd);
        document.addEventListener("touchend", dragEnd);

        function dragStart(e) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            if (e.target === mobileBackButton || mobileBackButton.contains(e.target)) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                xOffset = currentX;
                yOffset = currentY;
                mobileBackButton.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    }
    
    refreshPlayerBtn.onclick = () => {
        const src = gameIframe.src;
        gameIframe.src = '';
        setTimeout(() => gameIframe.src = src, 10);
    };

    fullscreenPlayerBtn.onclick = () => {
        if (gameIframe.requestFullscreen) {
            gameIframe.requestFullscreen();
        } else if (gameIframe.webkitRequestFullscreen) {
            gameIframe.webkitRequestFullscreen();
        } else if (gameIframe.msRequestFullscreen) {
            gameIframe.msRequestFullscreen();
        }
    };

    if (dismissLoaderBtn) {
        dismissLoaderBtn.onclick = () => {
            iframeLoader.classList.add('hidden');
            gameIframe.classList.remove('opacity-0');
        };
    }

    if (acceptDisclaimerBtn) {
        acceptDisclaimerBtn.onclick = hideDisclaimer;
    }

    // Modal Logic
    const openInstructions = () => {
        instructionsModal.classList.remove('hidden');
        setTimeout(() => {
            instructionsModal.classList.remove('opacity-0');
            instructionsContainer.classList.remove('scale-95');
            instructionsContainer.classList.add('scale-100');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    if (howToPlayBtn) howToPlayBtn.onclick = openInstructions;
    if (loaderHowToPlayBtn) loaderHowToPlayBtn.onclick = openInstructions;

    // Update Site Modal Logic
    const openUpdateModal = () => {
        updateModal.classList.remove('hidden');
        setTimeout(() => {
            updateModal.classList.remove('opacity-0');
            updateContainer.classList.remove('scale-95');
            updateContainer.classList.add('scale-100');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeUpdateModal = () => {
        updateModal.classList.add('opacity-0');
        updateContainer.classList.remove('scale-100');
        updateContainer.classList.add('scale-95');
        setTimeout(() => {
            updateModal.classList.add('hidden');
            if (playerOverlay.classList.contains('hidden') && instructionsModal.classList.contains('hidden')) {
                document.body.style.overflow = '';
            }
        }, 300);
    };

    if (updateSiteBtn) updateSiteBtn.onclick = openUpdateModal;
    if (closeUpdateBtn) closeUpdateBtn.onclick = closeUpdateModal;
    if (updateModal) {
        updateModal.onclick = (e) => {
            if (e.target === updateModal) closeUpdateModal();
        };
    }

    if (terminalModal) {
        terminalModal.onclick = (e) => {
            if (e.target === terminalModal) closeTerminal();
        };
    }

    const closeInstructions = () => {
        instructionsModal.classList.add('opacity-0');
        instructionsContainer.classList.remove('scale-100');
        instructionsContainer.classList.add('scale-95');
        setTimeout(() => {
            instructionsModal.classList.add('hidden');
            if (playerOverlay.classList.contains('hidden')) {
                document.body.style.overflow = '';
            }
        }, 300);
    };

    if (closeInstructionsBtn) closeInstructionsBtn.onclick = closeInstructions;
    if (instructionsModal) {
        instructionsModal.onclick = (e) => {
            if (e.target === instructionsModal) closeInstructions();
        };
    }

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            if (document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                openTerminal();
            }
        }
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            openTerminal();
        }
        if (e.key === 'Escape') {
            closePlayer();
            closeInstructions();
            closeUpdateModal();
            closeTerminal();
        }
    });

    // Handle iframe load
    gameIframe.onload = () => {
        // We no longer auto-hide the loader to ensure the user has time to choose the fallback link
        // The loader is now manually dismissed via the proceed button
        gameIframe.classList.remove('opacity-0');
    };
}

init();
