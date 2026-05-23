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
    "categories": ["Sports", "Trending Games"],
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
  },
  {
    "id": "moto-x3m",
    "title": "Moto X3M",
    "iframeUrl": "https://lesson126.github.io/lesson305/lesson-332",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6dkOS1Oz4sPuSpxKPm_TwAnsjUUaageye0A&s",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Master the art of motorcycle stunts in this high-speed physics-based racer. Navigate through challenging obstacle courses and beat the clock.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "geometry-dash-wave",
    "title": "Geometry Dash Wave",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2119",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_7SeScDs80JQ9Aqk7Z2qd4FPVd_BS0Rw3aA&s",
    "categories": ["Skill", "Trending Games"],
    "description": "Master the wave form in this intense high-speed precision challenge. Navigate the zig-zag corridors with absolute timing.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "stickman-hook",
    "title": "Stickman Hook",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-28",
    "thumbnail": "https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=204,height=204,fit=cover,f=auto/99e090d154caf30f3625df7e456d5984/stickman-hook-logo.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "Swing like a spider! Master the physics of the hook and rope to navigate through challenging levels in this addictive skill-based platformer.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },

  {
    "id": "among-us",
    "title": "Among Us",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-1",
    "thumbnail": "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
    "categories": ["Skill", "Trending Games", "Multiplayer"],
    "description": "Find the imposter or sabotage the crew! Master the art of deception and deduction in this social deduction sensation.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "we-become-what-we-behold",
    "title": "We Become What We Behold",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-59",
    "thumbnail": "https://img.itch.zone/aW1hZ2UvOTIxMTUvNDM0OTExLnBuZw==/original/GkCZT7.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "A game about news cycles, vicious cycles, and how we become what we behold. Take photos of people to see how they react and observe the societal impact in this thought-provoking simulation.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "flappy-bird",
    "title": "Flappy Bird",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-130",
    "thumbnail": "https://static.wikia.nocookie.net/gamia_gamepedia_en/images/b/b5/Title.jpg/revision/latest?cb=20180806163955",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "The viral flight sensation. Tap to flap your way through a treacherous landscape of pipes in this deceptively simple but incredibly challenging arcade classic.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "level-devil",
    "title": "Level Devil",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2107",
    "thumbnail": "https://i.ytimg.com/vi/KRv-x5eCFoU/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDitvnLMDHAnWeJx4QIz99ByUSB2g",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "A brutally difficult platformer where the levels are designed to trick you. Master the art of anticipation and reflexes to navigate through treacherous traps.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "real-cars-epic-stunts",
    "title": "Real Cars Epic Stunts",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2161",
    "thumbnail": "https://imgs.crazygames.com/real-cars-epic-stunts_16x9/20240913073039/real-cars-epic-stunts_16x9-cover?metadata=none&quality=60&height=3091",
    "categories": ["Driving", "Arcade", "Trending Games"],
    "description": "Perform impossible maneuvers in high-performance vehicles. Master the physics of speed and rotation to execute the ultimate stunt sequence.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "vex-8",
    "title": "Vex 8",
    "iframeUrl": "https://lesson126.github.io/lesson306/lesson-216",
    "thumbnail": "https://play-lh.googleusercontent.com/4tQSYur7SAvXeEvT5GBugYeqbh8KEQSLd1S16t8CJYyDN3g2p27wiPlXnqqAxeCqvg",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "The latest installment in the legendary platformer series. Master new mechanics, tackle treacherous levels, and prove your parkour prowess in this high-octane skill challenge.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  }
];

let currentCategory = 'All';
let currentSearch = '';

const itemsGrid = document.getElementById('items-grid');
const recentSection = document.getElementById('recent-section');
const recentGrid = document.getElementById('recent-grid');
const clearRecentBtn = document.getElementById('clear-recent');
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
const updateSiteBtn = document.getElementById('update-site-btn');
const updateModal = document.getElementById('update-modal');
const updateContainer = document.getElementById('update-container');
const closeUpdateBtn = document.getElementById('close-update');
const devApplyBtn = document.getElementById('dev-apply-btn');
const devModal = document.getElementById('dev-modal');
const devContainer = document.getElementById('dev-container');
const closeDevBtn = document.getElementById('close-dev');
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
    sessions: 0,
    recentlyPlayed: []
};

// Migration for existing users
if (!userData.recentlyPlayed) userData.recentlyPlayed = [];

function init() {
    renderCategories();
    renderRecentlyPlayed();
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
    if (!itemsGrid) return;
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
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105" referrerpolicy="no-referrer">
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

function renderRecentlyPlayed() {
    if (!recentGrid || !recentSection) return;
    
    if (currentSearch.trim() !== '') {
        recentSection.classList.add('hidden');
        return;
    }
    
    recentSection.classList.remove('hidden');
    recentGrid.innerHTML = '';
    const recentIds = userData.recentlyPlayed || [];
    
    if (recentIds.length === 0) {
        recentGrid.innerHTML = `
            <div class="col-span-full py-12 px-8 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5 backdrop-blur-sm w-full">
                <p class="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] text-center">No session history detected in current cycle</p>
            </div>
        `;
        return;
    }
    
    recentIds.forEach(id => {
        const item = allEntries.find(g => g.id === id);
        if (!item) return;
        
        const card = document.createElement('div');
        card.className = "flex-shrink-0 w-64 group cursor-pointer snap-start";
        card.innerHTML = `
            <div class="relative aspect-video rounded-2xl overflow-hidden border border-white/5 group-hover:border-cyan-500/50 transition-all duration-500 shadow-2xl bg-zinc-900/50 backdrop-blur-sm">
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-contain p-6 transition-all duration-700 group-hover:scale-110 group-hover:rotate-1" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-cyan-950/40 backdrop-blur-[2px]">
                     <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <i class="bi bi-play-fill text-2xl ml-1"></i>
                     </div>
                     <span class="mt-4 text-[9px] font-black text-white uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">Resume Link</span>
                </div>
                <div class="absolute top-3 left-3">
                    <div class="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
                </div>
            </div>
            <div class="mt-4 px-1">
                <h4 class="text-zinc-200 font-bold text-sm uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors">${item.title}</h4>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">${item.categories[0]}</span>
                </div>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        recentGrid.appendChild(card);
    });
}

function saveUserData() {
    localStorage.setItem('vp_user_data', JSON.stringify(userData));
}

function openPlayer(item) {
    if (!item) return;
    
    // Baseball Bros Disclaimer
    if (item.id === 'baseball-bros') {
        alert("SECURITY ALERT: When you enter the game, you will be asked for a password. The access code is 123.");
    }
    
    // Update Recently Played
    if (!userData.recentlyPlayed) userData.recentlyPlayed = [];
    userData.recentlyPlayed = [item.id, ...userData.recentlyPlayed.filter(id => id !== item.id)].slice(0, 8);
    
    // Track session and time
    playSessionStart = Date.now();
    userData.sessions++;
    saveUserData();
    renderRecentlyPlayed();

    // Directly take the user to the "Secure Mirror" (External Link)
    // and skip the intermediate "option" screen.
    window.open(item.iframeUrl, '_blank');
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
        renderRecentlyPlayed();
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
            if (playerOverlay.classList.contains('hidden')) {
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
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 p-2">
                        <img src="${g.thumbnail}" class="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" referrerpolicy="no-referrer">
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

    if (clearRecentBtn) {
        clearRecentBtn.onclick = () => {
            if (confirm("PURGE SESSION RESUME DATA?")) {
                userData.recentlyPlayed = [];
                saveUserData();
                renderRecentlyPlayed();
            }
        };
    }

    if (resetIdentityBtn) {
        resetIdentityBtn.onclick = () => {
            if (confirm('REDACT ALL SESSION DATA?')) {
                localStorage.removeItem('vp_user_data');
                userData = { username: '', totalSeconds: 0, sessions: 0, recentlyPlayed: [] };
                saveUserData();
                renderRecentlyPlayed();
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

    const openDevModal = () => {
        devModal.classList.remove('hidden');
        setTimeout(() => {
            devModal.classList.remove('opacity-0');
            devContainer.classList.add('scale-100');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeDevModal = () => {
        devModal.classList.add('opacity-0');
        devContainer.classList.remove('scale-100');
        setTimeout(() => {
            devModal.classList.add('hidden');
            if (playerOverlay.classList.contains('hidden')) {
                document.body.style.overflow = '';
            }
        }, 300);
    };

    if (devApplyBtn) devApplyBtn.onclick = openDevModal;
    if (closeDevBtn) closeDevBtn.onclick = closeDevModal;
    if (devModal) {
        devModal.onclick = (e) => {
            if (e.target === devModal) closeDevModal();
        };
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayer();
            closeCloakModal();
            closeDevModal();
        }
    });
}

init();
