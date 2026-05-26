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
    limit,
    where,
    deleteDoc
} from 'firebase/firestore';
import { 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    signOut
} from 'firebase/auth';

const ALLOWED_DEVS = []; // Strictly using passcode for CEO access as requested

const allEntries = [
  {
    "id": "eggy-car",
    "title": "Eggy Car",
    "iframeUrl": "https://y.demo.lhyang.org/https://eggycargame.cc/embed/eggy-car_en.embed",
    "thumbnail": "https://i.ytimg.com/vi/U2SgrOeRrrs/maxresdefault.jpg",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Drive a car with an egg in it as far as you can without breaking the egg."
  },
  {
    "id": "doom-2",
    "title": "Doom 2",
    "iframeUrl": "https://oshkii.github.io/doom2-webport/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHS4t4sbuYd5QRjB9GYCGT0DU7XoSZOLxnhg&s",
    "categories": ["Action", "Retro", "Shooter"],
    "description": "The classic sequel to the groundbreaking first-person shooter. Wage war against the forces of hell in this legendary action-packed experience."
  },
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
  },
  {
    "id": "infinite-craft",
    "title": "Infinite Craft Game",
    "iframeUrl": "https://y.demo.lhyang.org/https://infinitecraft-game.io/infinite-craft-game.embed",
    "thumbnail": "https://neal.fun/share-cards/infinite-craft.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "Combine basic elements—Fire, Water, Earth, and Air—to discover anything from dinosaurs to entire universes in this limitless crafting sandbox."
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
let versionTag, devTerminalOverlay, terminalPassInput, terminalStatusLog, terminalAuthSubmit, closeTerminalBtn;
let forumModal, forumContainer, closeForumBtn, sendForumMsgBtn;
let detailsModal, detailsContainer, closeDetailsBtn, detailsImg, detailsTitle, detailsCategories;
let detailsDesc, likeBtn, dislikeBtn, likeCount, dislikeCount, launchFromDetailsBtn;
let reviewsList, reviewInput, submitReviewBtn;
let profileBtn, profileModal, profileContainer, closeProfileBtn;
let leaderboardBtn, leaderboardModal, leaderboardContainer, closeLeaderboardBtn, leaderboardList;
let themeToggle, themeIcon, themeText;

const ORIGINAL_TITLE = document.title;
let playSessionStart = null;
let currentGameId = null;
let activeDetailsGameId = null;
let gameMetrics = {};
let unsubscribeMetrics = null;
let unsubscribeReviews = null;

const BADGES = [
    { id: 'early_adopter', name: 'Early Adopter', icon: 'bi-rocket-takeoff', desc: 'Sync with the network in the alpha stage.', color: 'text-indigo-400', condition: () => true },
    { id: 'novice_pilot', name: 'Novice Pilot', icon: 'bi-controller', desc: 'Successfully initiate 5 archive uplinks.', color: 'text-green-400', condition: (data) => (data.sessions || 0) >= 5 },
    { id: 'specialist', name: 'Module Specialist', icon: 'bi-stars', desc: 'Successfully initiate 20 archive uplinks.', color: 'text-blue-400', condition: (data) => (data.sessions || 0) >= 20 },
    { id: 'veteran_uplink', name: 'Veteran Uplink', icon: 'bi-cpu', desc: 'Successfully initiate 50 archive uplinks.', color: 'text-purple-400', condition: (data) => (data.sessions || 0) >= 50 },
    { id: 'loyalty_core', name: 'Loyalty Core', icon: 'bi-shield-check', desc: 'Initiate over 100 uplink sessions.', color: 'text-pink-400', condition: (data) => (data.sessions || 0) >= 100 }
];

let userData;
try {
    const raw = localStorage.getItem('vp_user_data');
    userData = raw ? JSON.parse(raw) : {
        username: '',
        totalSeconds: 0,
        sessions: 0,
        recentlyPlayed: [],
        favorites: [],
        badges: ['early_adopter'],
        theme: 'dark',
        perGamePlaytime: {}
    };
} catch (e) {
    console.error("Failed to load user data:", e);
    userData = {
        username: '',
        totalSeconds: 0,
        sessions: 0,
        recentlyPlayed: [],
        favorites: [],
        badges: ['early_adopter'],
        theme: 'dark',
        perGamePlaytime: {}
    };
}

// Migration and session tracking
if (!userData.recentlyPlayed || !Array.isArray(userData.recentlyPlayed)) userData.recentlyPlayed = [];
if (!userData.favorites || !Array.isArray(userData.favorites)) userData.favorites = [];
if (!userData.badges || !Array.isArray(userData.badges)) userData.badges = ['early_adopter'];
if (!userData.perGamePlaytime) userData.perGamePlaytime = {};
if (!userData.theme) userData.theme = 'dark';
userData.sessions = (userData.sessions || 0) + 1;

async function saveUserData() {
    checkBadges();
    localStorage.setItem('vp_user_data', JSON.stringify(userData));
}

function checkBadges() {
    let changed = false;
    BADGES.forEach(badge => {
        if (!badge.manual && !userData.badges.includes(badge.id)) {
            if (badge.condition(userData)) {
                userData.badges.push(badge.id);
                changed = true;
                showBadgeNotification(badge);
            }
        }
    });
    return changed;
}

function showBadgeNotification(badge) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-8 left-8 z-[200] bg-zinc-900 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl flex items-center gap-4 animate-in slide-in-from-left-full duration-500";
    toast.innerHTML = `
        <div class="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
            <i class="bi ${badge.icon} text-cyan-400 text-xl"></i>
        </div>
        <div>
            <h4 class="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none mb-1">Achievement Unlocked</h4>
            <p class="text-white font-bold text-sm">${badge.name}</p>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-left-full');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

function safeCall(fn, name) {
    try {
        fn();
    } catch (e) {
        console.error(`Sub-system failure [${name}]:`, e);
    }
}

function init() {
    console.log("VaultPortal [UPLINK ACTIVE] Initializing System Core...");
    applyTheme();
    saveUserData();
    
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
    
    // Forum Modal
    forumModal = document.getElementById('forum-modal');
    forumContainer = document.getElementById('forum-container');
    closeForumBtn = document.getElementById('close-forum');
    sendForumMsgBtn = document.getElementById('send-forum-msg');
    
    // Details Modal
    detailsModal = document.getElementById('details-modal');
    detailsContainer = document.getElementById('details-container');
    closeDetailsBtn = document.getElementById('close-details');
    detailsImg = document.getElementById('details-img');
    detailsTitle = document.getElementById('details-title');
    detailsCategories = document.getElementById('details-categories');
    detailsDesc = document.getElementById('details-desc');
    likeBtn = document.getElementById('like-btn');
    dislikeBtn = document.getElementById('dislike-btn');
    likeCount = document.getElementById('like-count');
    dislikeCount = document.getElementById('dislike-count');
    launchFromDetailsBtn = document.getElementById('launch-from-details');
    reviewsList = document.getElementById('reviews-list');
    reviewInput = document.getElementById('review-input');
    submitReviewBtn = document.getElementById('submit-review');

    themeToggle = document.getElementById('theme-toggle');
    themeIcon = document.getElementById('theme-icon');
    themeText = document.getElementById('theme-text');

    // Dev Terminal Selectors
    versionTag = document.getElementById('version-tag');
    devTerminalOverlay = document.getElementById('dev-terminal-overlay');
    terminalPassInput = document.getElementById('terminal-pass-input');
    terminalStatusLog = document.getElementById('terminal-status-log');
    terminalAuthSubmit = document.getElementById('terminal-auth-submit');
    closeTerminalBtn = document.getElementById('close-terminal');

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
        safeCall(initGameMetrics, "MetricsSub");
        safeCall(renderCategories, "Categories");
        safeCall(renderGameOfTheWeek, "GOTW");
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

function openUpdateModal() {
    if (!updateModal) return;
    updateModal.classList.remove('hidden');
    setTimeout(() => {
        updateModal.classList.remove('opacity-0');
        updateContainer.classList.add('scale-100');
    }, 10);
}

function closeUpdateModal() {
    if (!updateModal) return;
    updateModal.classList.add('opacity-0');
    updateContainer.classList.remove('scale-100');
    setTimeout(() => updateModal.classList.add('hidden'), 300);
}

function openDevModal() {
    if (!devModal) return;
    devModal.classList.remove('hidden');
    setTimeout(() => {
        devModal.classList.remove('opacity-0');
        devContainer.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeDevModal() {
    if (!devModal) return;
    devModal.classList.add('opacity-0');
    devContainer.classList.remove('scale-100');
    setTimeout(() => {
        devModal.classList.add('hidden');
        if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
            document.body.style.overflow = '';
        }
    }, 300);
}

function openDevTerminal() {
    if (!devTerminalOverlay) return;
    devTerminalOverlay.classList.remove('hidden');
    setTimeout(() => {
        devTerminalOverlay.classList.remove('opacity-0');
        terminalPassInput?.focus();
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeDevTerminal() {
    if (!devTerminalOverlay) return;
    devTerminalOverlay.classList.add('opacity-0');
    setTimeout(() => {
        devTerminalOverlay.classList.add('hidden');
        if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
            document.body.style.overflow = '';
        }
        if (terminalPassInput) terminalPassInput.value = '';
        if (terminalStatusLog) terminalStatusLog.textContent = 'Awaiting encrypted handshake...';
    }, 500);
}

async function handleTerminalAuth() {
    const code = terminalPassInput?.value;
    if (!code) return;

    const isCeo = code === '3012';
    const isDev = code === '5012';

    if (isCeo || isDev) {
        try {
            if (terminalStatusLog) terminalStatusLog.textContent = 'VALIDATING PROTOCOL...';
            
            const role = isCeo ? 'ceo' : 'dev';
            localStorage.setItem('vp_chat_role', role);
            localStorage.setItem('vp_chat_name', isCeo ? 'CEO' : 'Developer');
            localStorage.setItem('vp_chat_passcode', code);
            localStorage.setItem('vp_chat_authorized', 'true');
            
            if (!localStorage.getItem('vp_uplink_id')) {
                localStorage.setItem('vp_uplink_id', 'client-' + Math.random().toString(36).substring(2, 15));
            }

            if (isCeo) {
                if (terminalStatusLog) terminalStatusLog.textContent = 'ESTABLISHING MASTER LINK...';
                try {
                    const cred = await signInAnonymously(auth);
                    await setDoc(doc(db, 'authorized_users', cred.user.uid), {
                        role: 'ceo',
                        status: 'active',
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                    if (terminalStatusLog) terminalStatusLog.textContent = 'MASTER CONTROL ACTIVE.';
                } catch (authErr) {
                    console.error("Master Link Failure:", authErr);
                    if (terminalStatusLog) terminalStatusLog.textContent = 'LINK ERROR: REMOTE REJECTED.';
                }
            }
            
            if (terminalStatusLog) terminalStatusLog.textContent = 'PROTOCOL ACCEPTED. UPLINK ACTIVE.';
            
            setTimeout(() => {
                closeDevTerminal();
                updateForumAuthUI();
                alert(isCeo ? "CEO MASTER CONTROL ACTIVE." : "DEVELOPER ACCESS GRANTED.");
            }, 800);

        } catch (err) {
            console.error("Terminal Auth Error:", err);
            if (terminalStatusLog) terminalStatusLog.textContent = `ERROR: ${err.message || 'UPLINK FAILED'}`;
        }
    } else {
        if (terminalStatusLog) terminalStatusLog.textContent = 'IDENTITY ERROR: INVALID PAYLOAD.';
        if (terminalPassInput) {
            terminalPassInput.classList.add('border-red-500/50');
            setTimeout(() => terminalPassInput.classList.remove('border-red-500/50'), 1000);
        }
    }
}

function openCloakModal() {
    if (!cloakModal) return;
    cloakModal.classList.remove('hidden');
    setTimeout(() => {
        cloakModal.classList.remove('opacity-0');
        cloakContainer.classList.add('scale-100');
        cloakInput.focus();
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeCloakModal() {
    if (!cloakModal) return;
    cloakModal.classList.add('opacity-0');
    cloakContainer.classList.remove('scale-100');
    setTimeout(() => {
        cloakModal.classList.add('hidden');
        if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
            document.body.style.overflow = '';
        }
    }, 500);
}

function applyCloak() {
    const val = cloakInput.value.trim();
    if (val) {
        document.title = val;
        localStorage.setItem('vp_cloaked_title', val);
        closeCloakModal();
    }
}

function resetCloak() {
    document.title = ORIGINAL_TITLE;
    localStorage.removeItem('vp_cloaked_title');
    cloakInput.value = '';
    closeCloakModal();
}

function openForumModal() {
    if (!forumModal) return;
    forumModal.classList.remove('hidden');
    setTimeout(() => {
        forumModal.classList.remove('opacity-0');
        forumContainer.classList.remove('scale-90');
        forumContainer.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
    
    localStorage.setItem('vp_last_read_broadcast', Date.now().toString());
    const broadcastBadge = document.getElementById('broadcast-badge');
    if (broadcastBadge) broadcastBadge.classList.add('hidden');
    const forumBtn = document.getElementById('forum-btn');
    if (forumBtn) forumBtn.classList.remove('ring-2', 'ring-indigo-500/50', 'animate-pulse');
    
    syncForumMessages();
}

function closeForumModal() {
    if (!forumModal) return;
    forumModal.classList.add('opacity-0');
    forumContainer.classList.remove('scale-100');
    forumContainer.classList.add('scale-90');
    
    if (unsubscribeForum) {
        unsubscribeForum();
        unsubscribeForum = null;
    }

    setTimeout(() => {
        forumModal.classList.add('hidden');
        if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
            document.body.style.overflow = '';
        }
    }, 300);
}

async function postForumMessage() {
    const forumMsgInput = document.getElementById('forum-msg-input');
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

        const role = localStorage.getItem('vp_chat_role') || 'dev';
        const name = role === 'ceo' ? 'CEO' : 'Developer';
        const passcode = localStorage.getItem('vp_chat_passcode');
        const authorId = localStorage.getItem('vp_uplink_id') || 'passcode-uplink-' + Math.random().toString(36).substring(7);

        await addDoc(collection(db, 'forum_messages'), {
            content,
            authorId: authorId,
            firebaseUid: auth.currentUser?.uid || null,
            authorName: name,
            authorRole: role,
            authorPhoto: role === 'ceo' ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=ceo-vault-portal` : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`,
            passcode: passcode,
            createdAt: serverTimestamp()
        });

        forumMsgInput.value = '';
        forumMsgInput.style.height = 'auto';
        const forumMessagesView = document.getElementById('forum-messages-view');
        if (forumMessagesView) forumMessagesView.scrollTo({ top: forumMessagesView.scrollHeight, behavior: 'smooth' });
    } catch (error) {
        console.error("Transmission failed:", error);
        alert("Cloud Sync Failure: " + error.message);
    } finally {
        sendForumMsgBtn.disabled = false;
        sendForumMsgBtn.innerHTML = '<i class="bi bi-send-fill text-xl group-hover:rotate-12 transition-transform"></i>';
    }
}

async function logoutTerminal() {
    if (confirm("PROTOCOL: INITIATE TERMINAL DISCONNECT?")) {
        localStorage.removeItem('vp_chat_authorized');
        localStorage.removeItem('vp_chat_role');
        localStorage.removeItem('vp_chat_passcode');
        if (auth && auth.currentUser) {
            await signOut(auth);
        }
        updateForumAuthUI();
        alert("TERMINAL DISCONNECTED. PROTOCOL OFFLINE.");
    }
}

async function updateForumAuthUI(user) {
    const forumInputArea = document.getElementById('forum-input-area');
    const forumAuthPrompt = document.getElementById('forum-auth-prompt');
    const promptText = forumAuthPrompt?.querySelector('p');
    const devLoginBtn = document.getElementById('dev-login-btn');
    const logoutBtn = document.getElementById('terminal-logout-btn');
    const masterControlBtn = document.getElementById('master-control-btn');
    const masterPanel = document.getElementById('ceo-master-panel');
    
    if (!user && auth && auth.currentUser) user = auth.currentUser;

    let isAuthorized = localStorage.getItem('vp_chat_authorized') === 'true';
    let isBanned = false;
    const role = localStorage.getItem('vp_chat_role');

    if (user && isAuthorized) {
        try {
            const userDoc = await getDoc(doc(db, 'authorized_users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.status === 'banned') {
                    isAuthorized = false;
                    isBanned = true;
                    localStorage.removeItem('vp_chat_authorized');
                    localStorage.removeItem('vp_chat_role');
                } else {
                    localStorage.setItem('vp_chat_role', data.role);
                }
            }
        } catch (err) {
            console.warn("Auth verification failed:", err);
        }
    }

    if (isAuthorized) {
        forumInputArea?.classList.remove('hidden');
        forumAuthPrompt?.classList.add('hidden');
        if (devLoginBtn) {
            devLoginBtn.textContent = 'PROTOCOL SUCCESS';
            devLoginBtn.disabled = true;
        }
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        
        if (masterControlBtn && role === 'ceo') {
            masterControlBtn.classList.remove('hidden');
        } else if (masterControlBtn) {
            masterControlBtn.classList.add('hidden');
            masterPanel?.classList.add('hidden');
        }
    } else {
        forumInputArea?.classList.add('hidden');
        forumAuthPrompt?.classList.remove('hidden');
        if (devLoginBtn) {
            devLoginBtn.textContent = isBanned ? 'ACCESS REVOKED' : 'AUTHORIZE LINK';
            devLoginBtn.disabled = isBanned;
        }
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (masterControlBtn) masterControlBtn.classList.add('hidden');
        if (masterPanel) masterPanel.classList.add('hidden');
        if (promptText) {
            promptText.textContent = isBanned ? "SESSION TERMINATED // ACCESS REVOKED BY CEO" : "Official Developer Access Required to Post";
        }
    }
    
    const forumModal = document.getElementById('forum-modal');
    if (forumModal && !forumModal.classList.contains('hidden')) {
        syncForumMessages();
    }
}

function launchRandomGame() {
    const randomItem = allEntries[Math.floor(Math.random() * allEntries.length)];
    if (randomItem) openPlayer(randomItem);
}

function hideLoader() {
    if (iframeLoader) iframeLoader.classList.add('hidden');
    if (gameIframe) gameIframe.classList.remove('opacity-0');
}

function setupEventListeners() {
    // Nav Buttons
    const badgesBtn = document.getElementById('badges-btn');
    const badgesModal = document.getElementById('badges-modal');
    const badgesContainer = document.getElementById('badges-container');
    const closeBadgesBtn = document.getElementById('close-badges');
    const badgesGrid = document.getElementById('badges-grid');
    const badgeCountEl = document.getElementById('badge-count');

    if (badgesBtn) {
        badgesBtn.onclick = () => {
            renderBadges(badgesGrid, badgeCountEl);
            badgesModal.classList.remove('hidden');
            setTimeout(() => {
                badgesModal.classList.remove('opacity-0');
                badgesContainer.classList.remove('scale-90');
                badgesContainer.classList.add('scale-100');
            }, 10);
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeBadgesBtn) {
        closeBadgesBtn.onclick = () => {
            badgesModal.classList.add('opacity-0');
            badgesContainer.classList.remove('scale-100');
            badgesContainer.classList.add('scale-90');
            setTimeout(() => badgesModal.classList.add('hidden'), 500);
            if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
                document.body.style.overflow = '';
            }
        };
    }

    if (badgesModal) {
        badgesModal.onclick = (e) => {
            if (e.target === badgesModal) closeBadgesBtn.click();
        };
    }

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            renderRecentlyPlayed();
            renderItems();
        });
    }

    // Player Controls
    if (closePlayerBtn) closePlayerBtn.onclick = closePlayer;
    if (mobileBackButton) mobileBackButton.onclick = closePlayer;
    
    if (refreshPlayerBtn) {
        refreshPlayerBtn.onclick = () => {
            const src = gameIframe.src;
            gameIframe.src = '';
            setTimeout(() => gameIframe.src = src, 10);
        };
    }

    if (fullscreenPlayerBtn) {
        fullscreenPlayerBtn.onclick = () => {
            if (gameIframe.requestFullscreen) gameIframe.requestFullscreen();
        };
    }

    if (closeDetailsBtn) closeDetailsBtn.onclick = closeDetails;
    if (likeBtn) likeBtn.onclick = () => handleRating('likes');
    if (dislikeBtn) dislikeBtn.onclick = () => handleRating('dislikes');
    if (submitReviewBtn) submitReviewBtn.onclick = submitReview;
    
    // Modal Triggers
    if (updateSiteBtn) updateSiteBtn.onclick = openUpdateModal;
    if (closeUpdateBtn) closeUpdateBtn.onclick = closeUpdateModal;
    
    if (devApplyBtn) devApplyBtn.onclick = openDevModal;
    if (closeDevBtn) closeDevBtn.onclick = closeDevModal;

    if (surpriseBtn) surpriseBtn.onclick = launchRandomGame;

    if (cloakTabBtn) cloakTabBtn.onclick = openCloakModal;
    if (closeCloakBtn) closeCloakBtn.onclick = closeCloakModal;
    if (applyCloakBtn) applyCloakBtn.onclick = applyCloak;
    if (resetCloakBtn) resetCloakBtn.onclick = resetCloak;

    // Terminal
    if (terminalAuthSubmit) terminalAuthSubmit.onclick = handleTerminalAuth;
    if (terminalPassInput) {
        terminalPassInput.onkeydown = (e) => {
            if (e.key === 'Enter') handleTerminalAuth();
        };
    }

    if (themeToggle) themeToggle.onclick = toggleTheme;

    // Close Modals on Backdrop Click
    [forumModal, detailsModal, terminalModal, cloakModal, badgesModal, updateModal, devModal, disclaimerModal].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal === detailsModal) closeDetails();
                if (modal === forumModal) closeForum();
                if (modal === terminalModal) terminalModal.classList.add('hidden');
                if (modal === cloakModal) cloakModal.classList.add('hidden');
                if (modal === badgesModal) closeBadges();
                if (modal === updateModal) updateModal.classList.add('hidden');
                if (modal === devModal) devModal.classList.add('hidden');
                if (modal === disclaimerModal) disclaimerModal.classList.add('hidden');
            }
        });
    });
    if (launchFromDetailsBtn) {
        launchFromDetailsBtn.onclick = () => {
            const item = allEntries.find(g => g.id === activeDetailsGameId);
            if (item) {
                closeDetails();
                openPlayer(item);
            }
        };
    }

    if (reviewInput) {
        reviewInput.onkeydown = (e) => {
            if (e.key === 'Enter') submitReview();
        };
    }

    // Forum
    const forumBtn = document.getElementById('forum-btn');
    if (forumBtn) forumBtn.onclick = openForumModal;
    if (closeForumBtn) closeForumBtn.onclick = closeForumModal;
    if (sendForumMsgBtn) sendForumMsgBtn.onclick = postForumMessage;

    // Developer Login (Integrated into Terminal logic usually, but keep for UI compatibility)
    const terminalLogoutBtn = document.getElementById('terminal-logout-btn');
    if (terminalLogoutBtn) terminalLogoutBtn.onclick = logoutTerminal;

    const devLoginBtnElement = document.getElementById('dev-login-btn');
    if (devLoginBtnElement) devLoginBtnElement.onclick = () => {
        const code = prompt("ENTER AUTHORIZATION PASSCODE:");
        if (code === '5012' || code === '3012') {
            terminalPassInput.value = code;
            handleTerminalAuth();
        } else if (code !== null) {
            alert("PROTOCOL ERROR: INVALID PASSCODE.");
        }
    };

    // Master Control Logic
    const masterControlBtn = document.getElementById('master-control-btn');
    const masterPanel = document.getElementById('ceo-master-panel');
    const closeMasterBtn = document.getElementById('close-master-panel');

    if (masterControlBtn) {
        masterControlBtn.onclick = () => {
            if (masterPanel) {
                const isHidden = masterPanel.classList.contains('hidden');
                if (isHidden) {
                    masterPanel.classList.remove('hidden');
                    setTimeout(() => masterPanel.classList.add('opacity-100'), 10);
                } else {
                    masterPanel.classList.add('hidden');
                }
            }
        };
    }

    if (closeMasterBtn) {
        closeMasterBtn.onclick = () => {
            masterPanel?.classList.add('hidden');
        };
    }

    // Global Key Events
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            openDevTerminal();
        }
        if (e.key === 'Escape') {
            closePlayer();
            closeUpdateModal();
            closeDevModal();
            closeDevTerminal();
            closeCloakModal();
            closeDetails();
            closeForumModal();
            if (closeBadgesBtn) closeBadgesBtn.click();
        }
    });

    // Dismiss Initial Overlays
    if (acceptDisclaimerBtn) acceptDisclaimerBtn.onclick = hideDisclaimer;
    if (dismissLoaderBtn) dismissLoaderBtn.onclick = hideLoader;

    // Secret Dev Terminal Gesture
    if (versionTag) {
        let clickCount = 0;
        let lastClick = 0;
        versionTag.onclick = () => {
            const now = Date.now();
            if (now - lastClick < 500) {
                clickCount++;
            } else {
                clickCount = 1;
            }
            lastClick = now;

            if (clickCount >= 3) {
                clickCount = 0;
                openDevTerminal();
            }
        };
    }

    // System Indicator logic
    const systemIndicator = document.getElementById('system-indicator');
    if (systemIndicator) {
        let clickCount = 0;
        systemIndicator.onclick = () => {
            clickCount++;
            if (clickCount >= 5) {
                clickCount = 0;
                const key = prompt("ENTER MANUAL UPLINK KEY:");
                if (key === 'VAULT-OVERRIDE-2026') {
                    localStorage.setItem('vp_dev_override', 'true');
                    location.reload();
                }
            }
        };
    }

    // Backdrop Clicks
    const modals = [
        { id: 'update-modal', close: closeUpdateModal },
        { id: 'dev-modal', close: closeDevModal },
        { id: 'disclaimer-modal', close: hideDisclaimer },
        { id: 'dev-terminal-overlay', close: closeDevTerminal },
        { id: 'cloak-modal', close: closeCloakModal },
        { id: 'forum-modal', close: closeForumModal },
        { id: 'details-modal', close: closeDetails }
    ];

    modals.forEach(m => {
        const el = document.getElementById(m.id);
        if (el) {
            el.onclick = (e) => {
                if (e.target === el) m.close();
            };
        }
    });

    // Keep UI in sync with Auth
    onAuthStateChanged(auth, async (user) => {
        const storedRole = localStorage.getItem('vp_chat_role');
        
        if (!user && storedRole === 'ceo') {
            console.log("Re-establishing CEO credentials...");
            try {
                await signInAnonymously(auth);
            } catch (err) {
                console.error("CEO Re-login failed:", err);
            }
        } else if (user && storedRole === 'ceo') {
            // Ensure the authorization document exists for the current UID
            try {
                await setDoc(doc(db, 'authorized_users', user.uid), {
                    role: 'ceo',
                    status: 'active',
                    updatedAt: serverTimestamp()
                }, { merge: true });
                console.log("CEO Authorization Synced [UID: " + user.uid + "]");
            } catch (err) {
                console.error("Authorization sync failed:", err);
            }
        }
        updateForumAuthUI(user);
    });
}

function renderBadges(grid, countEl) {
    if (!grid) return;
    grid.innerHTML = '';
    
    BADGES.forEach(badge => {
        const isUnlocked = userData.badges.includes(badge.id);
        const card = document.createElement('div');
        card.className = `group relative p-4 rounded-[2rem] border transition-all duration-500 hover:bg-white/[0.02] flex flex-col items-center text-center ${
            isUnlocked 
            ? 'bg-zinc-900 border-white/10 hover:border-cyan-500/40' 
            : 'bg-black/40 border-white/5 grayscale opacity-40'
        }`;
        
        card.innerHTML = `
            <div class="w-full aspect-square rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center mb-4 transition-all duration-700 group-hover:scale-105 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/20 shadow-inner relative overflow-hidden">
                <i class="bi ${badge.icon} ${isUnlocked ? badge.color : 'text-zinc-800'} text-4xl"></i>
                ${isUnlocked ? '<div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse"></div>' : ''}
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-2">
                    <span class="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-black">Archive Active</span>
                </div>
            </div>
            
            <h3 class="font-black text-white italic uppercase tracking-tighter text-sm mb-1 group-hover:text-cyan-400 transition-colors truncate w-full px-2">
                ${badge.name}
            </h3>
            <p class="text-zinc-500 text-[10px] font-mono leading-tight line-clamp-2 px-2 h-6 mb-2">
                ${badge.desc}
            </p>

            <div class="mt-auto w-full pt-2 border-t border-white/5">
                 <span class="text-[8px] font-mono ${isUnlocked ? 'text-cyan-600' : 'text-zinc-700'} uppercase tracking-widest font-black">
                    ${isUnlocked ? 'Uplink: Primary' : 'Uplink: Offline'}
                 </span>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (countEl) countEl.textContent = `${userData.badges.length}/${BADGES.length} ARCHIVED`;
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
    
    // Static HTML for the filter label to ensure it's always there
    const labelHTML = `
        <div class="flex items-center gap-3 pr-6 border-r border-white/5 mr-3 flex-shrink-0">
            <i class="bi bi-filter-left text-zinc-500 text-xl"></i>
            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Filter</span>
        </div>
    `;
    
    nav.innerHTML = labelHTML;

    const categoriesList = ['All', 'Favorites ⭐', ...sortedCategories];
    
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

function toggleFavorite(e, gameId) {
    e.stopPropagation(); // Prevent launching game
    const index = userData.favorites.indexOf(gameId);
    if (index === -1) {
        userData.favorites.push(gameId);
    } else {
        userData.favorites.splice(index, 1);
    }
    saveUserData();
    renderCategories();
    renderItems();
}

function renderGameOfTheWeek() {
    const container = document.getElementById('gotw-container');
    if (!container) return;

    // Deterministic week-based selection
    // Epoch: May 25, 2024 (roughly when this pattern was established)
    const EPOCH = 1716595200000; 
    const currentWeek = Math.floor((Date.now() - EPOCH) / (7 * 24 * 60 * 60 * 1000));
    const featuredIndex = Math.max(0, currentWeek % allEntries.length);
    const item = allEntries[featuredIndex];

    if (!item) {
        container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase">Archive Sync Incomplete</div>';
        return;
    }

    container.innerHTML = `
        <div class="absolute inset-0">
            <img src="${item.thumbnail}" class="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000" alt="">
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent"></div>
        </div>
        
        <div class="relative h-full flex flex-col justify-end p-8 md:p-12">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="max-w-2xl">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 rounded-full text-[9px] font-black uppercase tracking-widest">Active Pulse Spotlight</span>
                        <div class="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[9px] font-mono font-bold text-zinc-400">
                            <span class="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                            STABLE UPLINK
                        </div>
                    </div>
                    <h3 class="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 group-hover:translate-x-2 transition-transform duration-500">${item.title}</h3>
                    <p class="text-zinc-400 text-sm md:text-base font-medium leading-relaxed max-w-xl group-hover:text-zinc-200 transition-colors">${item.description}</p>
                </div>
                
                <div class="flex items-center gap-4">
                    <button class="gotw-details-trigger px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white transition-all active:scale-95">Analyze Info</button>
                    <button class="gotw-launch-trigger px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_50px_rgba(234,179,8,0.3)] active:scale-95 flex items-center gap-3">
                        Launch Relay
                        <i class="bi bi-play-fill text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    container.querySelector('.gotw-details-trigger').onclick = (e) => {
        e.stopPropagation();
        openDetails(item);
    };

    container.querySelector('.gotw-launch-trigger').onclick = (e) => {
        e.stopPropagation();
        openPlayer(item);
    };

    container.onclick = () => openPlayer(item);
}

function renderItems() {
    const grid = getEl('items-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const term = (currentSearch || '').toLowerCase();
    const cat = currentCategory || 'All';

    const filtered = allEntries.filter(item => {
        if (!item) return false;
        
        let matchesCategory = false;
        if (cat === 'All') {
            matchesCategory = true;
        } else if (cat === 'Favorites ⭐') {
            matchesCategory = userData.favorites.includes(item.id);
        } else {
            matchesCategory = Array.isArray(item.categories) && item.categories.includes(cat);
        }
        
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const matchesSearch = title.includes(term) || desc.includes(term);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        const emptyMsg = cat === 'Favorites ⭐' 
            ? "Your bookmark archive is currently empty. Star games to add them here." 
            : "No interactive modules match your current decryption parameters.";
        grid.innerHTML = `
            <div class="col-span-full py-32 text-center">
                <div class="inline-block p-10 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 backdrop-blur-sm">
                    <div class="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5">
                        <i class="bi bi-grid-3x3-gap text-zinc-700 text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-tight uppercase">Void Detected</h3>
                    <p class="text-zinc-500 mt-2 font-medium max-w-xs mx-auto">${emptyMsg}</p>
                    <button onclick="document.getElementById('search-input').value=''; window.dispatchEvent(new Event('input'));" class="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors">Reset Query</button>
                </div>
            </div>`;
        return;
    }

    filtered.forEach((item, index) => {
        if (!item || !item.id) return;
        
        const nodeId = `V-P node [${(index + 101).toString(16).toUpperCase()}]`;
        const categories = Array.isArray(item.categories) ? item.categories : ['Uncategorized'];
        const isFavorited = userData.favorites.includes(item.id);
        
        const metrics = gameMetrics[item.id] || { likes: 0, dislikes: 0 };
        const total = metrics.likes + metrics.dislikes;
        const ratingPct = total > 0 ? Math.round((metrics.likes / total) * 100) : 0;
        const ratingHTML = total > 0 ? `
            <div class="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                <i class="bi bi-hand-thumbs-up-fill text-[10px] text-cyan-400"></i>
                <span class="text-[10px] font-black text-white">${ratingPct}%</span>
            </div>
        ` : '';

        const card = document.createElement('div');
        card.className = "group relative bg-zinc-900/40 rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 hover:border-cyan-500/50 transition-all duration-500 shadow-2xl backdrop-blur-sm hover:-translate-y-2 hover:shadow-cyan-500/20";
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden bg-zinc-950">
                <img src="${item.thumbnail || ''}" alt="${item.title || 'Untitled'}" class="w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110 group-hover:blur-md" referrerpolicy="no-referrer">
                
                <!-- Favorite Toggle -->
                <button class="favorite-btn absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:scale-110 hover:bg-black/60 group/fav" 
                        data-id="${item.id}">
                    <i class="bi ${isFavorited ? 'bi-star-fill text-yellow-400' : 'bi-star text-zinc-400'} text-xl group-hover/fav:text-yellow-400 transition-colors"></i>
                </button>

                <!-- Hover Overlay -->
                <div class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950/90 opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 text-center">
                    <div class="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
                        <div class="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] mb-4 mx-auto group-hover:scale-110 transition-transform">
                            <i class="bi bi-play-fill text-4xl ml-1"></i>
                        </div>
                        <h2 class="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Launch Game</h2>
                        <div class="flex items-center justify-center gap-4">
                             <div class="flex items-center gap-2">
                                <div class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                                <p class="text-cyan-400 font-mono text-[9px] uppercase tracking-[0.4em] font-bold">Uplink Ready</p>
                            </div>
                            <button class="details-btn px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all">Details</button>
                        </div>
                    </div>
                </div>
                
                <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <span class="text-[9px] font-mono text-cyan-400/50 uppercase tracking-widest bg-zinc-950/80 px-2 py-0.5 rounded border border-cyan-500/20 w-fit">${nodeId}</span>
                    ${ratingHTML}
                </div>
            </div>
            <div class="p-6 relative">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex flex-wrap gap-2">
                        ${categories.map(cat => `
                            <span class="text-[10px] font-black text-cyan-400/90 px-3 py-1 bg-cyan-400/5 border border-cyan-400/10 rounded-full uppercase tracking-widest font-mono shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">${cat}</span>
                        `).join('')}
                    </div>
                </div>
                <h3 class="text-zinc-100 font-black text-2xl tracking-tighter group-hover:text-cyan-400 transition-all duration-300 uppercase italic leading-none">${item.title || 'Untitled Game'}</h3>
                <p class="text-zinc-500 text-sm line-clamp-2 mt-3 font-medium leading-relaxed opacity-80 transition-opacity">${item.description || 'No description available for this link.'}</p>
                
                <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        
        // Favorite button click
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.onclick = (e) => toggleFavorite(e, item.id);

        const detailsBtn = card.querySelector('.details-btn');
        if (detailsBtn) {
            detailsBtn.onclick = (e) => {
                e.stopPropagation();
                openDetails(item);
            };
        }

        grid.appendChild(card);
    });
}

function renderRecentlyPlayed() {
    const grid = getEl('recent-grid');
    const section = getEl('recent-section');
    if (!grid || !section) return;
    
    if (currentSearch.trim() !== '' || currentCategory === 'Favorites ⭐') {
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
        card.className = "flex-shrink-0 w-72 group cursor-pointer snap-start transition-all duration-500 hover:-translate-y-2";
        card.innerHTML = `
            <div class="relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500/50 transition-all duration-500 shadow-2xl bg-zinc-900/50 backdrop-blur-sm">
                <img src="${item.thumbnail || ''}" alt="${item.title || 'Game'}" class="w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110 group-hover:blur-md" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-60"></div>
                
                <!-- Hover Overlay -->
                <div class="absolute inset-0 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-950/90 flex flex-col items-center justify-center p-6 text-center">
                    <div class="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <div class="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] mb-4 mx-auto group-hover:scale-110 transition-transform">
                            <i class="bi bi-play-fill text-3xl ml-1"></i>
                        </div>
                        <h5 class="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Resume Game</h5>
                    </div>
                </div>
                
                <div class="absolute top-4 left-4 z-10">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,1)] animate-pulse"></div>
                        <span class="text-[8px] font-black text-cyan-400 uppercase tracking-widest font-mono">Archive Active</span>
                    </div>
                </div>
            </div>
            <div class="mt-5 px-2">
                <h4 class="text-zinc-100 font-black text-lg uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors leading-none">${item.title || 'Untitled'}</h4>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-black">${(item.categories && item.categories[0]) || 'Game'}</span>
                </div>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        grid.appendChild(card);
    });
}

function openPlayer(item) {
    if (!item) return;
    
    // Baseball Bros Disclaimer - Horizontal protocol alert
    if (item.id === 'baseball-bros') {
        const notify = document.getElementById('top-notification');
        const msg = document.getElementById('notification-msg');
        const close = document.getElementById('close-notification');
        
        if (notify && msg) {
            msg.innerHTML = `SYSTEM NOTICE: UPON ENTERING THE GAME, YOU WILL BE ASKED FOR A PASSWORD. IT IS <span class="bg-white text-black px-3 py-0.5 rounded ml-2 font-black">123</span>`;
            close.textContent = "LAUNCH GAME";
            notify.classList.remove('-translate-y-full');
            notify.classList.add('translate-y-0');
            
            // Pulse the notification for visibility
            notify.classList.add('animate-pulse');
            setTimeout(() => notify.classList.remove('animate-pulse'), 2000);

            close.onclick = () => {
                notify.classList.remove('translate-y-0');
                notify.classList.add('-translate-y-full');
                
                trackAndLaunch(item);
            };
            return;
        }
    }
    
    trackAndLaunch(item);
}

function trackAndLaunch(item) {
    // STRAIGHT TO SECURE MIRROR - Auto-launch requested
    window.open(item.iframeUrl, '_blank');

    // Update Recently Played
    if (!Array.isArray(userData.recentlyPlayed)) userData.recentlyPlayed = [];
    userData.recentlyPlayed = [item.id, ...userData.recentlyPlayed.filter(id => id !== item.id)].slice(0, 8);
    
    // Track session and time
    playSessionStart = Date.now();
    currentGameId = item.id;
    userData.sessions++;
    
    saveUserData();
    renderRecentlyPlayed();

    // Show Player UI
    if (!playerOverlay) return;
    
    playerOverlay.classList.remove('hidden');
    playerTitle.textContent = item.title;
    playerCategory.textContent = (item.categories || []).join(' // ');
    
    const externalLink = document.getElementById('external-link');
    const loaderExternalLink = document.getElementById('loader-external-link');
    if (externalLink) externalLink.href = item.iframeUrl;
    if (loaderExternalLink) loaderExternalLink.href = item.iframeUrl;

    if (iframeLoader) iframeLoader.classList.remove('hidden');
    if (gameIframe) {
        gameIframe.classList.add('opacity-0');
        gameIframe.src = item.iframeUrl;
        
        if (item.customStyles) {
            gameIframe.style = item.customStyles;
        } else {
            gameIframe.style = "";
        }

        gameIframe.onload = () => {
            setTimeout(() => {
                if (iframeLoader) iframeLoader.classList.add('hidden');
                gameIframe.classList.remove('opacity-0');
            }, 1500);
        };
    }
    document.body.style.overflow = 'hidden';
}

function closePlayer() {
    if (playSessionStart && currentGameId) {
        const elapsed = Math.floor((Date.now() - playSessionStart) / 1000);
        userData.totalSeconds += elapsed;
        if (!userData.perGamePlaytime[currentGameId]) userData.perGamePlaytime[currentGameId] = 0;
        userData.perGamePlaytime[currentGameId] += elapsed;
        
        playSessionStart = null;
        currentGameId = null;
        saveUserData();
    }

    if (playerOverlay) playerOverlay.classList.add('hidden');
    if (gameIframe) gameIframe.src = "about:blank";
    gameIframe.classList.add('opacity-0');
    document.body.style.overflow = '';
}

function toggleTheme() {
    userData.theme = userData.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveUserData();
}

function applyTheme() {
    if (userData.theme === 'light') {
        document.documentElement.classList.add('light-mode');
        // Simple light theme overrides
        document.body.classList.add('bg-zinc-100', 'text-zinc-900');
        document.body.classList.remove('bg-zinc-950', 'text-white');
        if (themeIcon) {
            themeIcon.classList.remove('bi-moon-stars-fill');
            themeIcon.classList.add('bi-sun-fill');
        }
        if (themeText) themeText.textContent = 'Light Mode';
    } else {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.remove('bg-zinc-100', 'text-zinc-900');
        document.body.classList.add('bg-zinc-950', 'text-white');
        if (themeIcon) {
            themeIcon.classList.remove('bi-sun-fill');
            themeIcon.classList.add('bi-moon-stars-fill');
        }
        if (themeText) themeText.textContent = 'Dark Mode';
    }
}

function formatPlaytime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    
    // Background CEO sync to ensure Master Control is active if already in a session
    if (localStorage.getItem('vp_chat_role') === 'ceo') {
        signInAnonymously(auth).then(cred => {
            setDoc(doc(db, 'authorized_users', cred.user.uid), {
                role: 'ceo',
                status: 'active',
                updatedAt: serverTimestamp()
            }, { merge: true });
        }).catch(err => console.error("Initial Master Link refresh failed:", err));
    }

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
        const currentUserRole = localStorage.getItem('vp_chat_role');
        const isCeo = currentUserRole === 'ceo';

        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            if (msg.createdAt?.toMillis() > latestTime) latestTime = msg.createdAt.toMillis();
            
            const date = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
            
            const msgEl = document.createElement('div');
            const isCeo = localStorage.getItem('vp_chat_role') === 'ceo';
            const isMsgCeo = msg.authorRole === 'ceo';
            const isOwnMsg = msg.authorId === (localStorage.getItem('vp_uplink_id'));
            
            // Strictly limit buttons to those in a CEO session
            const canDelete = isCeo;
            const canRevoke = isCeo && !isMsgCeo;
            
            msgEl.className = `flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 group/msg`;
            msgEl.innerHTML = `
                <img src="${msg.authorPhoto || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + (msg.authorRole || 'dev')}" class="w-10 h-10 rounded-xl border border-white/5 flex-shrink-0">
                <div class="flex flex-col items-start max-w-[80%] relative">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-black ${isMsgCeo ? 'text-indigo-400' : 'text-white'} uppercase italic leading-none">${msg.authorName}</span>
                        <span class="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">${date}</span>
                    </div>
                    <div class="bg-indigo-500/10 text-zinc-200 rounded-2xl p-4 text-sm leading-relaxed border border-indigo-500/20 relative group/msg-content">
                        ${msg.content}
                        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 empty:hidden">
                            ${canDelete ? `
                                <button class="delete-msg-btn text-zinc-500 hover:text-red-400 flex items-center gap-1.5 transition-colors" data-id="${docSnap.id}">
                                    <i class="bi bi-trash"></i>
                                    <span class="text-[9px] font-black uppercase tracking-widest">Delete Log</span>
                                </button>
                            ` : ''}
                            ${canRevoke ? `
                                <button class="revoke-access-btn text-zinc-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors" data-authorid="${msg.authorId}">
                                    <i class="bi bi-person-x"></i>
                                    <span class="text-[9px] font-black uppercase tracking-widest">Revoke Access</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            forumMessagesView.appendChild(msgEl);
    });

    document.querySelectorAll('.delete-msg-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const msgId = btn.getAttribute('data-id');

            if (confirm("PROTOCOL: DELETE THIS LOG FROM THE GRID?")) {
                try {
                    await deleteDoc(doc(db, 'forum_messages', msgId));
                } catch (err) {
                    console.error("Deletion failed:", err);
                    alert("DELETION ERROR: " + err.message);
                }
            }
        };
    });

    document.querySelectorAll('.revoke-access-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const authorId = btn.getAttribute('data-authorid');

            if (confirm(`PROTOCOL: REVOKE DEVELOPER ACCESS FOR CLIENT [${authorId.substring(0, 15)}]?`)) {
                try {
                    await setDoc(doc(db, 'banned_clients', authorId), {
                        status: 'banned',
                        bannedAt: serverTimestamp(),
                        bannedBy: 'CEO'
                    });
                    alert("CLIENT TERMINATED. HANDSHAKE REVOKED.");
                } catch (err) {
                    console.error("Revoke failed:", err);
                    alert("REVOKE ERROR: " + err.message);
                }
            }
        };
    });
    });
}

function initGameMetrics() {
    if (unsubscribeMetrics) unsubscribeMetrics();
    unsubscribeMetrics = onSnapshot(collection(db, 'game_metrics'), (snapshot) => {
        snapshot.forEach(doc => {
            gameMetrics[doc.id] = doc.data();
        });
        renderItems();
    });
}

async function openDetails(item) {
    if (!item) return;
    activeDetailsGameId = item.id;
    
    // Fill basic info
    detailsImg.src = item.thumbnail || '';
    detailsTitle.textContent = item.title || 'Untitled';
    detailsDesc.textContent = item.description || '';
    detailsCategories.innerHTML = (item.categories || []).map(cat => `
        <span class="text-[9px] font-black text-cyan-400 px-2 py-1 bg-cyan-400/5 border border-cyan-400/10 rounded-full uppercase tracking-widest">${cat}</span>
    `).join('');
    
    // Reset buttons
    likeBtn.classList.remove('bg-cyan-500', 'text-black');
    dislikeBtn.classList.remove('bg-red-500', 'text-white');
    
    const votedKey = `voted_${activeDetailsGameId}`;
    const previousVote = localStorage.getItem(votedKey);
    if (previousVote === 'likes') likeBtn.classList.add('bg-cyan-500', 'text-black');
    if (previousVote === 'dislikes') dislikeBtn.classList.add('bg-red-500', 'text-white');

    // Fill metrics
    const metrics = gameMetrics[item.id] || { likes: 0, dislikes: 0 };
    likeCount.textContent = metrics.likes || 0;
    dislikeCount.textContent = metrics.dislikes || 0;
    
    // Reset review input
    reviewInput.value = '';
    
    // Show modal
    detailsModal.classList.remove('hidden');
    setTimeout(() => {
        detailsModal.classList.remove('opacity-0');
        detailsContainer.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
    
    // Fetch and subscribe to reviews
    initReviewsSubscription(item.id);
}

function closeDetails() {
    activeDetailsGameId = null;
    if (unsubscribeReviews) {
        try {
            unsubscribeReviews();
        } catch (e) {
            console.warn("Unsubscribe reviews failed:", e);
        }
    }
    
    if (detailsModal) detailsModal.classList.add('opacity-0');
    if (detailsContainer) {
        detailsContainer.classList.remove('scale-100');
        detailsContainer.classList.add('scale-90');
    }
    
    setTimeout(() => {
        if (detailsModal) detailsModal.classList.add('hidden');
        if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
            document.body.style.overflow = '';
        }
    }, 500);
}

async function handleRating(type) {
    if (!activeDetailsGameId) return;
    
    const votedKey = `voted_${activeDetailsGameId}`;
    if (localStorage.getItem(votedKey)) {
        alert("TRANSMISSION ERROR: Feedback already recorded for this module in current cycle.");
        return;
    }
    
    try {
        const metricDoc = doc(db, 'game_metrics', activeDetailsGameId);
        await setDoc(metricDoc, {
            [type]: increment(1),
            lastUpdate: serverTimestamp()
        }, { merge: true });
        
        localStorage.setItem(votedKey, type);
        
        // Local UI update
        if (type === 'likes') {
            likeCount.textContent = (parseInt(likeCount.textContent) || 0) + 1;
            likeBtn.classList.add('bg-cyan-500', 'text-black');
        } else {
            dislikeCount.textContent = (parseInt(dislikeCount.textContent) || 0) + 1;
            dislikeBtn.classList.add('bg-red-500', 'text-white');
        }
    } catch (err) {
        console.error("Rating failed:", err);
    }
}

async function submitReview() {
    if (!activeDetailsGameId) return;
    const content = reviewInput.value.trim();
    if (!content) return;
    
    if (content.length < 3) {
        alert("PROTOCOL ERROR: Diagnostic report too concise.");
        return;
    }
    
    submitReviewBtn.disabled = true;
    submitReviewBtn.innerHTML = '<i class="bi bi-hourglass-split animate-spin"></i>';
    
    try {
        const role = localStorage.getItem('vp_chat_role') || 'client';
        const authorName = localStorage.getItem('vp_chat_name') || 'Anonymous Client';
        
        await addDoc(collection(db, 'game_reviews'), {
            gameId: activeDetailsGameId,
            authorName: authorName,
            authorRole: role,
            content: content,
            createdAt: serverTimestamp()
        });
        
        reviewInput.value = '';
    } catch (err) {
        console.error("Review submission failed:", err);
        alert("UPLINK FAILURE: Unable to transmit diagnostic data.");
    } finally {
        submitReviewBtn.disabled = false;
        submitReviewBtn.innerHTML = '<i class="bi bi-send-fill"></i>';
    }
}

function initReviewsSubscription(gameId) {
    if (unsubscribeReviews) unsubscribeReviews();
    
    const reviewsColl = collection(db, 'game_reviews');
    const q = query(
        reviewsColl, 
        where('gameId', '==', gameId), 
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    
    unsubscribeReviews = onSnapshot(q, (snapshot) => {
        if (!reviewsList) return;
        reviewsList.innerHTML = '';
        
        if (snapshot.empty) {
            reviewsList.innerHTML = `<div class="text-center py-10 text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Awaiting sector feedback...</div>`;
            return;
        }
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const time = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Recent';
            const isCeoReview = data.authorRole === 'ceo';
            const currentUserRole = localStorage.getItem('vp_chat_role');
            const canDelete = currentUserRole === 'ceo';
            
            const reviewEl = document.createElement('div');
            reviewEl.className = "p-4 bg-white/5 border border-white/5 rounded-2xl animate-in fade-in slide-in-from-bottom-1 duration-300 group/review";
            reviewEl.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black ${isCeoReview ? 'text-indigo-400' : 'text-cyan-400'} uppercase tracking-widest">${data.authorName}</span>
                        ${isCeoReview ? '<span class="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-widest">CEO</span>' : ''}
                    </div>
                    <span class="text-[9px] font-mono text-zinc-600 uppercase font-bold">${time}</span>
                </div>
                <p class="text-zinc-300 text-xs italic leading-relaxed">"${data.content}"</p>
                ${canDelete ? `
                    <div class="mt-3 pt-3 border-t border-white/5 opacity-0 group-hover/review:opacity-100 transition-opacity">
                        <button class="delete-review-btn text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1.5 uppercase font-black text-[9px] tracking-widest" data-id="${docSnap.id}">
                            <i class="bi bi-trash"></i>
                            Terminate Report
                        </button>
                    </div>
                ` : ''}
            `;

            if (canDelete) {
                const deleteBtn = reviewEl.querySelector('.delete-review-btn');
                if (deleteBtn) {
                    deleteBtn.onclick = async () => {
                        if (confirm("PROTOCOL: TERMINATE THIS CITIZEN REPORT?")) {
                            try {
                                deleteBtn.disabled = true;
                                deleteBtn.textContent = "TERMINATING...";
                                await deleteDoc(doc(db, 'game_reviews', docSnap.id));
                                // onSnapshot will carry out the removal visually
                            } catch (err) {
                                console.error("Report termination failed:", err);
                                alert("TERMINATION FAILED: " + err.message);
                                deleteBtn.disabled = false;
                                deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Terminate Report';
                            }
                        }
                    };
                }
            }

            reviewsList.appendChild(reviewEl);
        });
    }, (err) => {
        console.warn("Reviews sync failed (likely missing index):", err);
        if (reviewsList) {
            reviewsList.innerHTML = `<div class="text-center py-10 text-zinc-600 font-mono text-[10px] uppercase tracking-widest opacity-50 italic">Chronology Sync Incomplete [Index Required]</div>`;
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
