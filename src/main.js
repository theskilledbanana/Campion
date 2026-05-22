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
  },
  {
    "id": "baseball-bros",
    "title": "Baseball Bros",
    "iframeUrl": "https://y.demo.lhyang.org/https://baseballbros.io/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnPsW1dDDFaNek8XIZfnwITQE8Ep-ERAY5rQ&s",
    "categories": ["Sports", "Skill", "Trending Games"],
    "description": "Step up to the plate and become a baseball legend. Master your timing, swing for the fences, and dominate the diamond in this fast-paced, competitive baseball game.",
    "loadingMessage": "THE PASSWORD IS 123"
  },
  {
    "id": "escape-road-2",
    "title": "Escape Road 2",
    "iframeUrl": "https://staticquasar931.github.io/Escape-Road-2/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoJmBnLLcGoLogI3-_x2Tl6kXvMyIFZRc0_A&s",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Escape the law in this high-octane driving game. Navigate through dense traffic, avoid police roadblocks, and prove your skills behind the wheel in a race for freedom."
  },
  {
    "id": "basketball-stars",
    "title": "Basketball Stars",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-3",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0hMBsvy_AxpR3o3RcMOXsZwDWWtfWrX1CIQ&s",
    "categories": ["Sports", "Trending Games", "2 Player"],
    "description": "Shoot hoops and play as a legend in this competitive basketball game. Master your shots, steals, and blocks to dominate the court in single-player or 2-player modes.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "golf-orbit",
    "title": "Golf Orbit",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2123",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYbiEb5tS7wNx-siDywgLLc0M26k5aYkWaHw&s",
    "categories": ["Sports", "Skill", "Arcade"],
    "description": "Launch your golf ball into the stratosphere! Master the perfect swing to send your ball orbiting through space in this addictive timing-based arcade game."
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
const loaderMessage = document.getElementById('loader-message');
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
const surpriseBtn = document.getElementById('surprise-btn');
const terminalModal = document.getElementById('terminal-modal');
const terminalContainer = document.getElementById('terminal-container');
const terminalInput = document.getElementById('terminal-input');
const terminalResults = document.getElementById('terminal-results');
const resetIdentityBtn = document.getElementById('reset-identity');
const cloakTabBtn = document.getElementById('cloak-tab-btn');
const cloakModal = document.getElementById('cloak-modal');
const cloakContainer = document.getElementById('cloak-container');
const closeCloakBtn = document.getElementById('close-cloak');
const cloakInput = document.getElementById('cloak-input');
const applyCloakBtn = document.getElementById('apply-cloak');
const resetCloakBtn = document.getElementById('reset-cloak');

const ORIGINAL_TITLE = document.title;
let playSessionStart = null;

let userData = JSON.parse(localStorage.getItem('vp_user_data')) || {
    username: '',
    totalSeconds: 0,
    sessions: 0
};

function init() {
    renderCategories();
    renderItems();
    setupEventListeners();
    showDisclaimer();
    startSystemTicker();
    
    // Auto-load cloaked title
    const savedTitle = localStorage.getItem('vp_cloaked_title');
    if (savedTitle) {
        document.title = savedTitle;
        if (cloakInput) cloakInput.value = savedTitle;
    }
}

function startSystemTicker() {
    const ticker = document.getElementById('system-ticker');
    if (!ticker) return;
    
    setInterval(() => {
        const baud = [4800, 9600, 14400, 19200, 38400, 57600, 115200][Math.floor(Math.random() * 7)];
        const mem = Math.floor(Math.random() * 15) + 75;
        ticker.textContent = `Baud: ${baud} // MEM: ${mem}%`;
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
        const nodeId = `V-P node [${(index + 101).toString(16).toUpperCase()}]`;
        const card = document.createElement('div');
        card.className = "group relative bg-zinc-900/40 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl backdrop-blur-sm hover:-translate-y-2 hover:shadow-cyan-500/10";
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden bg-zinc-950">
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60"></div>
                <div class="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
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
                </div>
                <h3 class="text-zinc-100 font-extrabold text-xl tracking-tight leading-tight group-hover:text-cyan-400 transition-colors uppercase italic">${item.title}</h3>
                <p class="text-zinc-500 text-sm line-clamp-2 mt-2 font-medium leading-relaxed">${item.description}</p>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        itemsGrid.appendChild(card);
    });
}

function saveUserData() {
    localStorage.setItem('vp_user_data', JSON.stringify(userData));
}

function openPlayer(item) {
    if (!item) return;
    
    playSessionStart = Date.now();
    userData.sessions++;
    saveUserData();

    playerTitle.textContent = item.title;
    playerCategory.textContent = item.categories.join(' / ');
    
    const fallbackLink = document.getElementById('external-link');
    const loaderLink = document.getElementById('loader-external-link');
    
    if (fallbackLink) fallbackLink.href = item.iframeUrl;
    if (loaderLink) loaderLink.href = item.iframeUrl;

    iframeLoader.classList.remove('hidden');
    gameIframe.classList.add('opacity-0');

    if (item.loadingMessage) {
        loaderMessage.innerHTML = `<span class="text-cyan-400 font-black text-2xl uppercase italic tracking-tighter underline decoration-cyan-400/30 underline-offset-8 mb-4 block animate-pulse">${item.loadingMessage}</span><p class="mt-4">Attempting secure extraction. If the module is blocked or slow, use the manual override below.</p>`;
    } else {
        loaderMessage.textContent = 'Attempting secure extraction. If the module is blocked or slow, use the manual override below.';
    }

    if (item.customStyles) {
        gameIframe.style.cssText = item.customStyles;
        gameIframe.classList.remove('w-full', 'h-full');
    } else {
        gameIframe.style.cssText = '';
        gameIframe.classList.add('w-full', 'h-full');
    }

    gameIframe.src = item.iframeUrl;
    playerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePlayer() {
    if (playSessionStart) {
        const elapsed = Math.floor((Date.now() - playSessionStart) / 1000);
        userData.totalSeconds += elapsed;
        saveUserData();
        playSessionStart = null;
    }

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
        const games = allEntries.filter(g => g.title.toLowerCase().includes(query.toLowerCase()));
        
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
                <i class="bi bi-arrow-right-short text-zinc-800 group-hover:text-cyan-400 transition-colors text-xl"></i>
            `;
            div.onclick = () => {
                openPlayer(g);
                closeTerminal();
            };
            terminalResults.appendChild(div);
        });
    };

    terminalInput.addEventListener('input', (e) => renderTerminalResults(e.target.value));
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = terminalInput.value;
            const firstGame = allEntries.find(g => g.title.toLowerCase().includes(query.toLowerCase()));
            if (firstGame) {
                openPlayer(firstGame);
                closeTerminal();
            }
        }
    });

    closePlayerBtn.onclick = closePlayer;
    if (mobileBackButton) mobileBackButton.onclick = closePlayer;
    
    refreshPlayerBtn.onclick = () => {
        const src = gameIframe.src;
        gameIframe.src = '';
        setTimeout(() => gameIframe.src = src, 10);
    };

    fullscreenPlayerBtn.onclick = () => {
        if (gameIframe.requestFullscreen) gameIframe.requestFullscreen();
    };

    if (dismissLoaderBtn) {
        dismissLoaderBtn.onclick = () => {
            iframeLoader.classList.add('hidden');
            gameIframe.classList.remove('opacity-0');
        };
    }

    acceptDisclaimerBtn.onclick = hideDisclaimer;

    surpriseBtn.onclick = () => {
        const randomItem = allEntries[Math.floor(Math.random() * allEntries.length)];
        openPlayer(randomItem);
    };

    if (resetIdentityBtn) {
        resetIdentityBtn.onclick = () => {
            if (confirm('REDACT ALL SESSION DATA?')) {
                localStorage.removeItem('vp_user_data');
                userData = { username: '', totalSeconds: 0, sessions: 0 };
            }
        }
    }

    const openCloakModal = () => {
        cloakModal.classList.remove('hidden');
        setTimeout(() => {
            cloakModal.classList.remove('opacity-0');
            cloakContainer.classList.add('scale-100');
            cloakInput.focus();
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeCloakModal = () => {
        cloakModal.classList.add('opacity-0');
        cloakContainer.classList.remove('scale-100');
        setTimeout(() => cloakModal.classList.add('hidden'), 500);
        document.body.style.overflow = '';
    };

    if (cloakTabBtn) cloakTabBtn.onclick = openCloakModal;
    if (closeCloakBtn) closeCloakBtn.onclick = closeCloakModal;

    applyCloakBtn.onclick = () => {
        const val = cloakInput.value.trim();
        if (val) {
            document.title = val;
            localStorage.setItem('vp_cloaked_title', val);
            closeCloakModal();
        }
    };

    resetCloakBtn.onclick = () => {
        document.title = ORIGINAL_TITLE;
        localStorage.removeItem('vp_cloaked_title');
        cloakInput.value = '';
        closeCloakModal();
    };

    const openInstructions = () => {
        instructionsModal.classList.remove('hidden');
        setTimeout(() => {
            instructionsModal.classList.remove('opacity-0');
            instructionsContainer.classList.add('scale-100');
        }, 10);
    };

    const closeInstructions = () => {
        instructionsModal.classList.add('opacity-0');
        instructionsContainer.classList.remove('scale-100');
        setTimeout(() => instructionsModal.classList.add('hidden'), 300);
    };

    if (howToPlayBtn) howToPlayBtn.onclick = openInstructions;
    if (closeInstructionsBtn) closeInstructionsBtn.onclick = closeInstructions;

    updateSiteBtn.onclick = () => {
        updateModal.classList.remove('hidden');
        setTimeout(() => {
            updateModal.classList.remove('opacity-0');
            updateContainer.classList.add('scale-100');
        }, 10);
    };

    closeUpdateBtn.onclick = () => {
        updateModal.classList.add('opacity-0');
        updateContainer.classList.remove('scale-100');
        setTimeout(() => updateModal.classList.add('hidden'), 300);
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayer();
            closeInstructions();
            closeCloakModal();
        }
    });
}

init();
