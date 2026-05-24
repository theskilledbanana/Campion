// main.js - Vanilla JS Logic for MediaVault

import { db, auth } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    increment,
    updateDoc,
    limit
} from 'firebase/firestore';
import { 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

const ALLOWED_DEVS = []; // Strictly using passcode for CEO access as requested

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
let unsubscribeForum = null;
let unsubscribeBadge = null;

// Global UI Elements (Initialized in init)
const getEl = (id) => document.getElementById(id);
let itemsGrid, recentSection, recentGrid, clearRecentBtn, categoriesNav, searchInput;
let playerOverlay, gameIframe, playerTitle, playerCategory, closePlayerBtn, mobileBackButton;
let refreshPlayerBtn, fullscreenPlayerBtn, iframeLoader, loaderMessage, dismissLoaderBtn;
let updateSiteBtn, updateModal, updateContainer, closeUpdateBtn, devApplyBtn, devModal;
let devContainer, closeDevBtn, disclaimerModal, disclaimerContainer, acceptDisclaimerBtn;
let surpriseBtn, terminalModal, terminalContainer, terminalInput, terminalResults;
let cloakTabBtn, cloakModal, cloakContainer, closeCloakBtn, cloakInput, applyCloakBtn, resetCloakBtn;

const ORIGINAL_TITLE = document.title;
let playSessionStart = null;

let userData;
try {
    userData = JSON.parse(localStorage.getItem('vp_user_data')) || {
        username: '',
        totalSeconds: 0,
        sessions: 0,
        recentlyPlayed: []
    };
} catch (e) {
    console.error("Failed to load user data:", e);
    userData = {
        username: '',
        totalSeconds: 0,
        sessions: 0,
        recentlyPlayed: []
    };
}

// Migration for existing users
if (!userData.recentlyPlayed || !Array.isArray(userData.recentlyPlayed)) {
    userData.recentlyPlayed = [];
}

function init() {
    console.log("VaultPortal [UPLINK ACTIVE] Initializing System Core...");
    
    // Initialize UI Selectors
    itemsGrid = document.getElementById('items-grid');
    recentSection = document.getElementById('recent-section');
    recentGrid = document.getElementById('recent-grid');
    clearRecentBtn = document.getElementById('clear-recent');
    categoriesNav = document.getElementById('categories-nav');
    searchInput = document.getElementById('search-input');
    playerOverlay = document.getElementById('player-overlay');
    gameIframe = document.getElementById('game-area');
    playerTitle = document.getElementById('player-title');
    playerCategory = document.getElementById('player-category');
    closePlayerBtn = document.getElementById('close-player');
    mobileBackButton = document.getElementById('mobile-back-button');
    refreshPlayerBtn = document.getElementById('refresh-player');
    fullscreenPlayerBtn = document.getElementById('fullscreen-player');
    iframeLoader = document.getElementById('iframe-loader');
    loaderMessage = document.getElementById('loader-message');
    dismissLoaderBtn = document.getElementById('dismiss-loader');
    updateSiteBtn = document.getElementById('update-site-btn');
    updateModal = document.getElementById('update-modal');
    updateContainer = document.getElementById('update-container');
    closeUpdateBtn = document.getElementById('close-update');
    devApplyBtn = document.getElementById('dev-apply-btn');
    devModal = document.getElementById('dev-modal');
    devContainer = document.getElementById('dev-container');
    closeDevBtn = document.getElementById('close-dev');
    disclaimerModal = document.getElementById('disclaimer-modal');
    disclaimerContainer = document.getElementById('disclaimer-container');
    acceptDisclaimerBtn = document.getElementById('accept-disclaimer');
    surpriseBtn = document.getElementById('surprise-btn');
    terminalModal = document.getElementById('terminal-modal');
    terminalContainer = document.getElementById('terminal-container');
    terminalInput = document.getElementById('terminal-input');
    terminalResults = document.getElementById('terminal-results');
    cloakTabBtn = document.getElementById('cloak-tab-btn');
    cloakModal = document.getElementById('cloak-modal');
    cloakContainer = document.getElementById('cloak-container');
    closeCloakBtn = document.getElementById('close-cloak');
    cloakInput = document.getElementById('cloak-input');
    applyCloakBtn = document.getElementById('apply-cloak');
    resetCloakBtn = document.getElementById('reset-cloak');

    // Explicitly reset initial state
    currentCategory = 'All';
    currentSearch = '';
    
    if (searchInput) searchInput.value = '';

    const indicator = document.getElementById('system-indicator');
    if (indicator) indicator.textContent = 'SYSTEM: [SYNCING]';

    const isDevOverridden = localStorage.getItem('vp_dev_override') === 'true';

    try {
        console.log(`Diagnostic: Found ${allEntries.length} modules in payload.`);
        
        // Individual safety wrappers for core rendering
        safeCall(renderCategories, "Categories");
        safeCall(renderRecentlyPlayed, "Recent");
        safeCall(renderItems, "Items");
        
        // Non-critical systems
        safeCall(setupEventListeners, "Events");
        safeCall(showDisclaimer, "Disclaimer");
        safeCall(startSystemTicker, "Ticker");
        safeCall(initBadgeSubscription, "BadgeSub");
        
        if (indicator) {
            indicator.textContent = isDevOverridden ? 'SYSTEM: [OVERRIDE_ACTIVE]' : 'SYSTEM: [ONLINE]';
        }
        console.log("VaultPortal [INITIALIZATION COMPLETE]");
    } catch (err) {
        console.error("Initialization sequence fatal error:", err);
        if (indicator) indicator.textContent = 'SYSTEM: [CRITICAL_FAIL]';
    }
    
    // Auto-load cloaked title
    const savedTitle = localStorage.getItem('vp_cloaked_title');
    if (savedTitle) {
        document.title = savedTitle;
        if (cloakInput) cloakInput.value = savedTitle;
    }
}

function safeCall(fn, name) {
    try {
        fn();
    } catch (e) {
        console.error(`Sub-system failure [${name}]:`, e);
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
    const nav = getEl('categories-nav');
    if (!nav) return;
    
    const entries = Array.isArray(allEntries) ? allEntries : [];
    const rawCategories = [...new Set(entries.flatMap(e => e.categories || []))];
    const sortedCategories = rawCategories.filter(Boolean).sort((a, b) => {
        if (a === 'Trending Games') return -1;
        if (b === 'Trending Games') return 1;
        return String(a).localeCompare(String(b));
    });
    
    const categoriesList = ['All', ...sortedCategories];
    
    // Static HTML for the filter label to ensure it's always there
    const labelHTML = `
        <div class="flex items-center gap-3 pr-6 border-r border-white/5 mr-3 flex-shrink-0">
            <i class="bi bi-filter-left text-zinc-500 text-xl"></i>
            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Filter</span>
        </div>
    `;
    
    nav.innerHTML = labelHTML;

    categoriesList.forEach(category => {
        const btn = document.createElement('button');
        const isActive = currentCategory === category;
        btn.className = `whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
            isActive 
            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] translate-y-[-1px]' 
            : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-zinc-300 hover:border-white/10'
        }`;
        btn.textContent = category;
        btn.onclick = () => {
            currentCategory = category;
            renderCategories();
            renderItems();
        };
        nav.appendChild(btn);
    });
}

function renderItems() {
    const grid = getEl('items-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const term = (currentSearch || '').toLowerCase();
    const cat = currentCategory || 'All';

    const filtered = allEntries.filter(item => {
        if (!item) return false;
        const matchesCategory = cat === 'All' || (Array.isArray(item.categories) && item.categories.includes(cat));
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const matchesSearch = title.includes(term) || desc.includes(term);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-32 text-center">
                <div class="inline-block p-10 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5">
                        <i class="bi bi-grid-3x3-gap text-zinc-700 text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tight uppercase">Void Detected</h3>
                    <p class="text-zinc-500 mt-2 font-medium max-w-xs mx-auto">No interactive modules match your current decryption parameters.</p>
                    <button onclick="document.getElementById('search-input').value=''; window.dispatchEvent(new Event('input'));" class="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors">Reset Query</button>
                </div>
            </div>`;
        return;
    }

    filtered.forEach((item, index) => {
        if (!item || !item.id) return;
        
        const nodeId = `V-P node [${(index + 101).toString(16).toUpperCase()}]`;
        const categories = Array.isArray(item.categories) ? item.categories : ['Uncategorized'];
        
        const card = document.createElement('div');
        card.className = "group relative bg-zinc-900/40 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl backdrop-blur-sm hover:-translate-y-2 hover:shadow-cyan-500/10";
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden bg-zinc-950">
                <img src="${item.thumbnail || ''}" alt="${item.title || 'Untitled'}" class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105" referrerpolicy="no-referrer">
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
                        ${categories.map(cat => `
                            <span class="text-[10px] font-bold text-cyan-400/80 px-2 py-0.5 bg-cyan-400/5 border border-cyan-400/10 rounded uppercase tracking-[0.1em] font-mono">${cat}</span>
                        `).join('')}
                    </div>
                </div>
                <h3 class="text-zinc-100 font-extrabold text-xl tracking-tight leading-tight group-hover:text-cyan-400 transition-colors uppercase italic">${item.title || 'Untitled Game'}</h3>
                <p class="text-zinc-500 text-sm line-clamp-2 mt-2 font-medium leading-relaxed">${item.description || 'No description available for this link.'}</p>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        grid.appendChild(card);
    });
}

function renderRecentlyPlayed() {
    const grid = getEl('recent-grid');
    const section = getEl('recent-section');
    if (!grid || !section) return;
    
    if (currentSearch.trim() !== '') {
        section.classList.add('hidden');
        return;
    }
    
    section.classList.remove('hidden');
    grid.innerHTML = '';
    const recentIds = Array.isArray(userData.recentlyPlayed) ? userData.recentlyPlayed : [];
    
    if (recentIds.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 px-8 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5 backdrop-blur-sm w-full">
                <p class="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] text-center">No session history detected in current cycle</p>
            </div>
        `;
        return;
    }
    
    recentIds.forEach(id => {
        const item = allEntries.find(g => g.id === id);
        if (!item || !item.id) return;
        
        const card = document.createElement('div');
        card.className = "flex-shrink-0 w-64 group cursor-pointer snap-start";
        card.innerHTML = `
            <div class="relative aspect-video rounded-2xl overflow-hidden border border-white/5 group-hover:border-cyan-500/50 transition-all duration-500 shadow-2xl bg-zinc-900/50 backdrop-blur-sm">
                <img src="${item.thumbnail || ''}" alt="${item.title || 'Game'}" class="w-full h-full object-contain p-6 transition-all duration-700 group-hover:scale-110 group-hover:rotate-1" referrerpolicy="no-referrer">
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
                <h4 class="text-zinc-200 font-bold text-sm uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors">${item.title || 'Untitled'}</h4>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">${(item.categories && item.categories[0]) || 'Game'}</span>
                </div>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        grid.appendChild(card);
    });
}

function saveUserData() {
    localStorage.setItem('vp_user_data', JSON.stringify(userData));
}

function openPlayer(item) {
    if (!item) return;
    
    // Baseball Bros Disclaimer - Using non-blocking feedback
    if (item.id === 'baseball-bros') {
        console.log("Baseball Bros Access Code: 123");
    }
    
    // Update Recently Played
    if (!Array.isArray(userData.recentlyPlayed)) userData.recentlyPlayed = [];
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
    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderRecentlyPlayed();
        renderItems();
    });

    // Player Controls
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

    // Disclaimer
    acceptDisclaimerBtn.onclick = hideDisclaimer;

    // Surprise Me
    surpriseBtn.onclick = () => {
        const randomItem = allEntries[Math.floor(Math.random() * allEntries.length)];
        openPlayer(randomItem);
    };

    // Purge History
    if (clearRecentBtn) {
        clearRecentBtn.onclick = () => {
            if (confirm("PURGE SESSION RESUME DATA?")) {
                userData.recentlyPlayed = [];
                saveUserData();
                renderRecentlyPlayed();
            }
        };
    }

    // Tab Cloak
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

    // Update Modal
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

    // Dev Application
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

    // Global Keybinds
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayer();
            closeCloakModal();
            closeDevModal();
            closeForumModal();
        }
    });

    // Use a safer selector for the system indicator
    const systemIndicator = document.getElementById('system-indicator') || document.querySelector('p.text-cyan-400\\/70');
    const isDevOverridden = localStorage.getItem('vp_dev_override') === 'true';

    if (systemIndicator) {
        let clickCount = 0;
        systemIndicator.style.cursor = 'pointer';
        systemIndicator.onclick = () => {
            clickCount++;
            if (clickCount >= 5) {
                clickCount = 0;
                const key = prompt("ENTER MANUAL UPLINK KEY:");
                if (key === 'VAULT-OVERRIDE-2026') {
                    alert("MANUAL UPLINK AUTHENTICATED. DEV ACCESS GRANTED.");
                    localStorage.setItem('vp_dev_override', 'true');
                    location.reload();
                } else if (key) {
                    alert("INVALID UPLINK KEY. ACCESS DENIED.");
                }
            }
        };
        if (isDevOverridden) {
            systemIndicator.textContent = 'SYSTEM: [OVERRIDE_ACTIVE]';
        }
    }

    // Developer Authorization Logic
    const isChatAuthorized = () => {
        return localStorage.getItem('vp_chat_authorized') === 'true' || localStorage.getItem('vp_dev_override') === 'true';
    };

    const updateForumAuthUI = (user) => {
        const forumInputArea = document.getElementById('forum-input-area');
        const forumAuthPrompt = document.getElementById('forum-auth-prompt');
        
        const isAuthorized = isChatAuthorized() || (user && ALLOWED_DEVS.includes(user.email));

        if (isAuthorized) {
            forumInputArea?.classList.remove('hidden');
            forumAuthPrompt?.classList.add('hidden');
        } else {
            forumInputArea?.classList.add('hidden');
            forumAuthPrompt?.classList.remove('hidden');
            if (user && !isAuthorized) {
                const promptText = forumAuthPrompt?.querySelector('p');
                if (promptText) promptText.textContent = `V-P ACCESS DENIED: ${user.email} IS NOT AUTHORIZED`;
            }
        }
    };

    if (auth) {
        onAuthStateChanged(auth, (user) => {
            updateForumAuthUI(user);
        });
    }

    // Developer Login Button (Passcode implementation)
    const devLoginBtn = document.getElementById('dev-login-btn');
    if (devLoginBtn) {
        devLoginBtn.onclick = () => {
            const code = prompt("ENTER AUTHORIZATION PASSCODE:");
            if (code === '3012') {
                alert("PROTOCOL ACCEPTED. DEVELOPER ACCESS GRANTED.");
                localStorage.setItem('vp_chat_authorized', 'true');
                devLoginBtn.textContent = 'PROTOCOL SUCCESS';
                devLoginBtn.disabled = true;
                updateForumAuthUI(auth?.currentUser);
            } else if (code !== null) {
                alert("PROTOCOL ERROR: INVALID PASSCODE.");
                setTimeout(() => {
                    devLoginBtn.textContent = 'LINK FAILED';
                    setTimeout(() => {
                        devLoginBtn.textContent = 'AUTHORIZE LINK';
                    }, 2000);
                }, 100);
            }
        };
        
        if (isChatAuthorized()) {
            devLoginBtn.textContent = 'PROTOCOL SUCCESS';
            devLoginBtn.disabled = true;
        }
    }

    // Forum Management
    const forumBtn = document.getElementById('forum-btn');
    const closeForumBtn = document.getElementById('close-forum');
    const forumModal = document.getElementById('forum-modal');
    const forumContainer = document.getElementById('forum-container');
    const forumMessagesView = document.getElementById('forum-messages-view');
    const forumMsgInput = document.getElementById('forum-msg-input');
    const sendForumMsgBtn = document.getElementById('send-forum-msg');

    const openForumModal = () => {
        forumModal.classList.remove('hidden');
        setTimeout(() => {
            forumModal.classList.remove('opacity-0');
            forumContainer.classList.remove('scale-90');
            forumContainer.classList.add('scale-100');
        }, 10);
        document.body.style.overflow = 'hidden';
        
        // Mark as read when opening
        const broadcastBadge = document.getElementById('broadcast-badge');
        if (broadcastBadge) broadcastBadge.classList.add('hidden');
        const forumBtn = document.getElementById('forum-btn');
        if (forumBtn) forumBtn.classList.remove('ring-2', 'ring-indigo-500/50', 'animate-pulse');
        
        syncForumMessages();
    };

    const closeForumModal = () => {
        forumModal.classList.add('opacity-0');
        forumContainer.classList.remove('scale-100');
        forumContainer.classList.add('scale-90');
        
        if (unsubscribeForum) {
            unsubscribeForum();
            unsubscribeForum = null;
        }

        setTimeout(() => {
            forumModal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };

    if (forumBtn) forumBtn.onclick = openForumModal;
    if (closeForumBtn) closeForumBtn.onclick = closeForumModal;

    if (sendForumMsgBtn && db) {
        sendForumMsgBtn.onclick = async () => {
            const content = forumMsgInput.value.trim();
            if (!content) return;

            const user = auth ? auth.currentUser : null;
            const isManualDev = localStorage.getItem('vp_dev_override') === 'true' || localStorage.getItem('vp_chat_authorized') === 'true';

            if (!user && !isManualDev) {
                alert("PROTOCOL ERROR: YOU MUST BE AUTHORIZED TO BROADCAST");
                return;
            }

            try {
                sendForumMsgBtn.disabled = true;
                sendForumMsgBtn.innerHTML = '<div class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>';

                await addDoc(collection(db, 'forum_messages'), {
                    content,
                    authorId: user ? user.uid : (isManualDev ? 'passcode-admin-001' : 'guest'),
                    authorName: isManualDev ? 'CEO' : (user ? (user.displayName || user.email.split('@')[0]) : 'Guest'),
                    authorPhoto: user ? user.photoURL : (isManualDev ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=ceo-vault-portal` : `https://api.dicebear.com/7.x/pixel-art/svg?seed=guest`),
                    createdAt: serverTimestamp()
                });

                forumMsgInput.value = '';
                forumMsgInput.style.height = 'auto';
                forumMessagesView.scrollTo({ top: forumMessagesView.scrollHeight, behavior: 'smooth' });
            } catch (error) {
                console.error("Transmission failed:", error);
                alert("Cloud Sync Failure: " + error.message);
            } finally {
                sendForumMsgBtn.disabled = false;
                sendForumMsgBtn.innerHTML = '<i class="bi bi-send-fill text-xl group-hover:rotate-12 transition-transform"></i>';
            }
        };

        forumMsgInput.oninput = () => {
            forumMsgInput.style.height = 'auto';
            forumMsgInput.style.height = (forumMsgInput.scrollHeight) + 'px';
        };

        forumMsgInput.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendForumMsgBtn.click();
            }
        };
    }
}


// Integrated Broadcast Badge Syncing
function initBadgeSubscription() {
    if (unsubscribeBadge) unsubscribeBadge();
    const broadcastBadge = document.getElementById('broadcast-badge');
    if (!broadcastBadge || !db) return;

    try {
        const messagesQuery = query(collection(db, 'forum_messages'), orderBy('createdAt', 'desc'), limit(1));
        
        unsubscribeBadge = onSnapshot(messagesQuery, (snapshot) => {
            if (snapshot.empty) return;
            
            const newestMsg = snapshot.docs[0].data();
            const newestTime = newestMsg.createdAt?.toMillis() || 0;
            const lastReadTime = parseInt(localStorage.getItem('vp_last_read_broadcast') || '0');

            // If we are currently viewing the forum, mark as read
            const forumModal = document.getElementById('forum-modal');
            if (forumModal && !forumModal.classList.contains('hidden')) {
                localStorage.setItem('vp_last_read_broadcast', newestTime.toString());
                broadcastBadge.classList.add('hidden');
                return;
            }

            if (newestTime > lastReadTime) {
                broadcastBadge.classList.remove('hidden');
                const forumBtn = document.getElementById('forum-btn');
                if (forumBtn) forumBtn.classList.add('ring-2', 'ring-indigo-500/50', 'animate-pulse');
            } else {
                broadcastBadge.classList.add('hidden');
                const forumBtn = document.getElementById('forum-btn');
                if (forumBtn) forumBtn.classList.remove('ring-2', 'ring-indigo-500/50', 'animate-pulse');
            }
        }, (err) => {
            console.warn("Badge sync unavailable:", err);
            broadcastBadge.classList.add('hidden');
        });
    } catch (e) {
        console.warn("Badge sub failed:", e);
    }
}

// Forum Message Rendering Logic
function syncForumMessages() {
    const forumMessagesView = document.getElementById('forum-messages-view');
    if (unsubscribeForum) unsubscribeForum();
    
    if (!forumMessagesView) return;

    if (!db) {
        forumMessagesView.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <i class="bi bi-wifi-off text-zinc-700 text-4xl mb-4"></i>
                <h3 class="text-white font-bold uppercase italic tracking-tighter">Connection Unavailable</h3>
                <p class="text-zinc-500 text-xs mt-2 px-10">The secure relay network is currently offline. Please check your local uplink.</p>
            </div>
        `;
        return;
    }

    const messagesQuery = query(collection(db, 'forum_messages'), orderBy('createdAt', 'asc'));
    
    unsubscribeForum = onSnapshot(messagesQuery, (snapshot) => {
        if (snapshot.empty) {
            forumMessagesView.innerHTML = `
                <div class="flex flex-col items-center justify-center py-24 text-center">
                    <div class="p-6 bg-white/5 rounded-3xl mb-6">
                        <i class="bi bi-terminal text-zinc-700 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white uppercase italic tracking-tighter">No Logs Yet</h3>
                    <p class="text-zinc-500 text-xs mt-2 max-w-xs">Development is in progress. Stay tuned for official system updates.</p>
                </div>
            `;
            return;
        }

        let latestTime = 0;
        forumMessagesView.innerHTML = '';
        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            if (msg.createdAt?.toMillis() > latestTime) latestTime = msg.createdAt.toMillis();
            
            const date = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
            
            const msgEl = document.createElement('div');
            msgEl.className = `flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500`;
            msgEl.innerHTML = `
                <img src="${msg.authorPhoto || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + msg.authorId}" class="w-10 h-10 rounded-xl border border-white/5 flex-shrink-0">
                <div class="flex flex-col items-start max-w-[80%]">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-black text-white uppercase italic leading-none">${msg.authorName}</span>
                        <span class="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">${date}</span>
                    </div>
                    <div class="bg-indigo-500/10 text-zinc-200 rounded-2xl p-4 text-sm leading-relaxed border border-indigo-500/20">
                        ${msg.content}
                    </div>
                </div>
            `;
            forumMessagesView.appendChild(msgEl);
        });

        // Update last read since we are viewing
        localStorage.setItem('vp_last_read_broadcast', latestTime.toString());
        
        setTimeout(() => {
            forumMessagesView.scrollTo({ top: forumMessagesView.scrollHeight, behavior: 'smooth' });
        }, 100);
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
