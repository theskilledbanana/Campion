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
    deleteDoc,
    writeBatch
} from 'firebase/firestore';
import { 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    signOut
} from 'firebase/auth';

const ALLOWED_DEVS = []; // Strictly using passcode for CEO access as requested

const FALLBACK_IMAGE = '/src/assets/images/game_placeholder_vault_1780278911383.png';

const MENU_MUSIC = [
    { id: '4MQ904y8jLUC1ZYgPPJ8KP', title: 'Space Song', artist: 'Beach House' },
    { id: '0Z24rpGOYfgpcs48Ix0WwP', title: "YEBBA's Heartbreak", artist: 'Drake' },
    { id: '4lXsvpjLhG7YqEehJFqpKV', title: 'Passionfruit', artist: 'Drake' }
];
let currentMusicIndex = 0;
let spotifyIframe;

function updateMusicPlayer() {
    if (!spotifyIframe) return;
    const track = MENU_MUSIC[currentMusicIndex];
    let trackId = track.id;
    
    // Support full URLs if provided
    if (trackId.includes('spotify.com/')) {
        const match = trackId.match(/(track|album|playlist)\/([a-zA-Z0-9]+)/);
        if (match) {
            spotifyIframe.src = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0&autoplay=1`;
            return;
        }
    }
    
    spotifyIframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`;
}

const allEntries = [
  {
    "id": "eggy-car",
    "title": "Eggy Car",
    "iframeUrl": "https://y.demo.lhyang.org/https://eggycargame.cc/embed/eggy-car_en.embed",
    "thumbnail": "/src/assets/images/eggy_car_thumbnail_1780278958742.png",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Drive a car with an egg in it as far as you can without breaking the egg."
  },
  {
    "id": "gunspin",
    "title": "GunSpin",
    "iframeUrl": "https://xg4321.github.io/gunspin-gnmathport/",
    "thumbnail": "https://media.indiedb.com/images/games/1/79/78131/ao_gunspin-cover.jpg",
    "categories": ["Action", "Skill", "Shooter"],
    "description": "GunSpin is a high-octane skill game where you use the power of your shots to keep your momentum and reach new distances."
  },
  {
    "id": "soundboard-buttons",
    "title": "Soundboards",
    "iframeUrl": "https://soundbuttonspro.com/",
    "thumbnail": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    "categories": ["Utility", "Fun"],
    "description": "Access a variety of instant sounds and soundboard buttons for ultimate fun and reactions."
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
    "thumbnail": "/src/assets/images/bitlife_thumb_1780279258036.png",
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
    "thumbnail": "/src/assets/images/geometry_dash_thumb_1780279184298.png",
    "categories": ["Skill", "Trending Games"],
    "description": "Jump, fly, and flip your way through dangerous passages and spiky obstacles in this high-intensity rhythm-based action platformer."
  },
  {
    "id": "slope",
    "title": "Slope",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-26",
    "thumbnail": "/src/assets/images/slope_thumb_1780279221714.png",
    "categories": ["Skill", "Trending Games"],
    "description": "Test your reflexes in this high-speed obstacle course. Navigate through a shifting neon world where one wrong move ends the run."
  },
  {
    "id": "indian-truck-driving-simulator",
    "title": "Indian Truck Driving Simulator",
    "iframeUrl": "https://oshkii.github.io/indiantruckdrivingsimulator-webport/",
    "thumbnail": "/src/assets/images/generic_driving_thumb_1780279303494.png",
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
    "thumbnail": "/src/assets/images/generic_driving_thumb_1780279303494.png",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Escape the law in this high-octane driving game. Navigate through dense traffic, avoid police roadblocks, and prove your skills behind the wheel in a race for freedom."
  },
  {
    "id": "basketball-stars",
    "title": "Basketball Stars",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-3",
    "thumbnail": "/src/assets/images/generic_sports_thumb_1780279320047.png",
    "categories": ["Sports", "Trending Games", "2 Player"],
    "description": "Shoot hoops and play as a legend in this competitive basketball game. Master your shots, steals, and blocks to dominate the court in single-player or 2-player modes.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "golf-orbit",
    "title": "Golf Orbit",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2123",
    "thumbnail": "/src/assets/images/generic_sports_thumb_1780279320047.png",
    "categories": ["Sports", "Skill", "Arcade"],
    "description": "Launch your golf ball into the stratosphere! Master the perfect swing to send your ball orbiting through space in this addictive timing-based arcade game."
  },
  {
    "id": "moto-x3m",
    "title": "Moto X3M",
    "iframeUrl": "https://lesson126.github.io/lesson305/lesson-332",
    "thumbnail": "/src/assets/images/generic_driving_thumb_1780279303494.png",
    "categories": ["Driving", "Skill", "Trending Games"],
    "description": "Master the art of motorcycle stunts in this high-speed physics-based racer. Navigate through challenging obstacle courses and beat the clock.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "geometry-dash-wave",
    "title": "Geometry Dash Wave",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2119",
    "thumbnail": "/src/assets/images/geometry_dash_thumb_1780279184298.png",
    "categories": ["Skill", "Trending Games"],
    "description": "Master the wave form in this intense high-speed precision challenge. Navigate the zig-zag corridors with absolute timing.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "stickman-hook",
    "title": "Stickman Hook",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-28",
    "thumbnail": "/src/assets/images/stickman_hook_thumb_1780279355460.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "Swing like a spider! Master the physics of the hook and rope to navigate through challenging levels in this addictive skill-based platformer.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },

  {
    "id": "among-us",
    "title": "Among Us",
    "iframeUrl": "https://lesson126.github.io/lesson302/lesson-1",
    "thumbnail": "/src/assets/images/among_us_thumb_1780279373395.png",
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
    "thumbnail": "/src/assets/images/flappy_bird_thumb_1780279202809.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "The viral flight sensation. Tap to flap your way through a treacherous landscape of pipes in this deceptively simple but incredibly challenging arcade classic.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "level-devil",
    "title": "Level Devil",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2107",
    "thumbnail": "/src/assets/images/level_devil_thumb_1780279390279.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "A brutally difficult platformer where the levels are designed to trick you. Master the art of anticipation and reflexes to navigate through treacherous traps.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "real-cars-epic-stunts",
    "title": "Real Cars Epic Stunts",
    "iframeUrl": "https://lesson126.github.io/lesson83/lesson-2161",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL2DtDh5Uw5i8j8HxFn4qUynCEMfTe-RUgkw&s",
    "categories": ["Driving", "Arcade", "Trending Games"],
    "description": "Perform impossible maneuvers in high-performance vehicles. Master the physics of speed and rotation to execute the ultimate stunt sequence.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "vex-8",
    "title": "Vex 8",
    "iframeUrl": "https://lesson126.github.io/lesson306/lesson-216",
    "thumbnail": "/src/assets/images/vex_thumb_1780279237211.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "The latest installment in the legendary platformer series. Master new mechanics, tackle treacherous levels, and prove your parkour prowess in this high-octane skill challenge.",
    "customStyles": "width: 480px; height: 800px; max-width: 100%; max-height: 100%;"
  },
  {
    "id": "infinite-craft",
    "title": "Infinite Craft Game",
    "iframeUrl": "https://y.demo.lhyang.org/https://infinitecraft-game.io/infinite-craft-game.embed",
    "thumbnail": "/src/assets/images/infinite_craft_thumb_1780279409975.png",
    "categories": ["Skill", "Arcade", "Trending Games"],
    "description": "Combine basic elements—Fire, Water, Earth, and Air—to discover anything from dinosaurs to entire universes in this limitless crafting sandbox."
  },
  {
    "id": "fake-stake",
    "title": "Fake Stake",
    "iframeUrl": "https://y.demo.lhyang.org/https://www.fakestakes.com/mines",
    "thumbnail": "https://miro.medium.com/v2/resize:fit:1400/1*FsH3TsmM0Av7DpEu6NUM_w.png",
    "categories": ["Skill", "Fun"],
    "description": "Experience the thrill of strategic mining in this interactive game."
  },
  {
    "id": "drift-hunters",
    "title": "Drift Hunters",
    "iframeUrl": "https://gibbat2.github.io/Games/games/drifthunters/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlqotnzSNoLX7RcBPtwTsbNuXR2_qc62oVzg&s",
    "categories": ["Racing", "Skill"],
    "description": "The ultimate browser-based drifting simulator. Customize your car, hit the tracks, and master the art of the drift in this high-fidelity racing experience."
  },

  {
    "id": "chrome-dino",
    "title": "Dino Game",
    "iframeUrl": "https://only-game.github.io/projects/chrome-dino/index.html",
    "thumbnail": "https://www.coolmathgames.com/sites/default/files/styles/mobile_game_image/public/DinoGame_OG-logo.jpg.webp?itok=fCn4IdZB",
    "categories": ["Skill", "Fun"],
    "description": "The legendary endless runner. Dodge cactus and pterodactyls in this high-speed survival challenge."
  },
  {
    "id": "blackjack",
    "title": "Blackjack",
    "iframeUrl": "https://gibbat2.github.io/Games/games/blackjack/",
    "thumbnail": "https://arenacloud.cdn.arkadiumhosted.com/arenaxstorage-blob/arenax-games/BlackJack/0.62/build/resources/assets/thumbs/thumb2x.jpg",
    "categories": ["Skill", "Fun"],
    "description": "The classic casino card game. Test your strategy and luck to beat the dealer and reach 21."
  },
  {
    "id": "pvz",
    "title": "Plants vs Zombies",
    "iframeUrl": "https://y.demo.lhyang.org/https://pvz.ee/iframe.php",
    "thumbnail": "/src/assets/images/pvz_thumb_new_1780279453636.png",
    "categories": ["Strategy", "Fun"],
    "description": "Defend your home from a zombie invasion! Plant a variety of powerful plants to stop the undead horde in this classic tower defense game."
  },
  {
    "id": "doodle-jump",
    "title": "Doodle Jump",
    "iframeUrl": "https://only-game.github.io/projects/doodle-jump/index.html",
    "thumbnail": "/src/assets/images/doodle_jump_thumb_new_1780279437582.png",
    "categories": ["Skill", "Fun"],
    "description": "Jump from platform to platform, avoiding monsters and obstacles as you climb higher and higher in this addictive vertical jumper."
  },
  {
    "id": "baseball-bros",
    "title": "Baseball Bros",
    "iframeUrl": "https://y.demo.lhyang.org/https://baseballbros.io/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnPsW1dDDFaNek8XIZfnwITQE8Ep-ERAY5rQ&s",
    "categories": ["Sports", "Fun"],
    "description": "Step up to the plate and hit home runs in this competitive baseball game!"
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
let reviewsList, voteUpBtn, voteDownBtn;
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

// Helper to trigger the scare
function triggerJohnPorkScare(method, customMsg = null, subCaption = null) {
    if (document.querySelector('.john-pork-active-scare')) return;

    const mainText = customMsg || "John Pork is watching";
    const secondaryText = subCaption || "HE IS ALWAYS WATCHING // YOU CANNOT ESCAPE";

    const scared = document.createElement('div');
    scared.className = 'john-pork-active-scare fixed inset-0 z-[99999] bg-black overflow-y-auto overflow-x-hidden p-6 md:p-10 cursor-default select-none';
    scared.innerHTML = `
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent)] animate-pulse pointer-events-none"></div>
        
        <div class="flex flex-col items-center justify-center min-h-full max-w-2xl w-full mx-auto relative z-10">
            <div class="relative group pointer-events-none mb-8 md:mb-12 flex items-center justify-center w-full">
                <div class="absolute -inset-10 md:-inset-20 bg-cyan-500/20 blur-3xl opacity-50 transition-opacity"></div>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHiqgp9hbtVyjykpf-PJf6yy2n6WdglOha1Q&s" class="max-w-full max-h-[50vh] object-contain rounded-3xl border-8 border-cyan-500 grayscale brightness-150 contrast-125 animate-float shadow-[0_0_100px_rgba(0,255,255,0.4)]" referrerpolicy="no-referrer">
            </div>

            <div class="text-center pointer-events-none mb-12 md:mb-16 w-full">
                <h2 class="text-cyan-400 font-black text-4xl md:text-7xl uppercase italic tracking-tighter animate-rainbow-text mb-4 leading-tight">${mainText}</h2>
                <p class="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] mb-8 animate-pulse italic">${secondaryText}</p>
                <div class="flex items-center justify-center gap-4">
                    <p class="text-zinc-600 font-mono text-[10px] md:text-xs uppercase tracking-[0.5em]">PROTOCOL_${method}</p>
                    <div class="h-1 w-1 rounded-full bg-cyan-500 animate-ping"></div>
                </div>
            </div>

            <button id="close-pork" class="px-8 py-4 md:px-10 md:py-5 bg-white text-black font-black uppercase text-xs md:text-sm rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] relative z-10 shrink-0">I accept the monitoring</button>
        </div>
    `;
    document.body.appendChild(scared);
    
    const closeBtn = scared.querySelector('#close-pork');
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        scared.classList.add('opacity-0', 'pointer-events-none', 'transition-all', 'duration-700');
        setTimeout(() => scared.remove(), 700);
    };
}

function init() {
    // [SYSTEM HEARTBEAT] Uplink synchronized for GitHub export.
    console.log("VaultPortal [UPLINK ACTIVE] Initializing System Core...");
    applyTheme();
    saveUserData();
    
    // Initialize UI Selectors
    const closeObserver = document.getElementById('close-observer');
    if (closeObserver) {
        closeObserver.onclick = (e) => {
            e.stopPropagation();
            triggerJohnPorkScare("ESCAPE_ATTEMPT", "WHY ARE YOU TRYING TO ESCAPE ME?", "I SEE EVERYTHING // SESSION LOCK ENGAGED");
        };
    }
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

    // Music Player Initialization
    spotifyIframe = document.getElementById('spotify-iframe');
    const prevTrackBtn = document.getElementById('prev-track');
    const nextTrackBtn = document.getElementById('next-track');

    if (prevTrackBtn) {
        prevTrackBtn.onclick = () => {
            currentMusicIndex = (currentMusicIndex - 1 + MENU_MUSIC.length) % MENU_MUSIC.length;
            updateMusicPlayer();
        };
    }
    if (nextTrackBtn) {
        nextTrackBtn.onclick = () => {
            currentMusicIndex = (currentMusicIndex + 1) % MENU_MUSIC.length;
            updateMusicPlayer();
        };
    }
    
    // Initial load
    updateMusicPlayer();
    
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
    voteUpBtn = null;
    voteDownBtn = null;

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

    // CEO Panel Buttons
    const clearReportsBtn = document.getElementById('clear-reports-btn');
    const clearLogsBtn = document.getElementById('clear-logs-btn');
    const unrevokeAllBtn = document.getElementById('unrevoke-all-btn');
    const closeMasterPanelBtn = document.getElementById('close-master-panel');
    const masterControlBtn = document.getElementById('master-control-btn');
    const manualRevokeBtn = document.getElementById('manual-revoke-btn');
    const manualRevokeInput = document.getElementById('manual-revoke-id');

    if (manualRevokeBtn && manualRevokeInput) {
        manualRevokeBtn.onclick = async () => {
            const authorId = manualRevokeInput.value.trim();
            if (!authorId) {
                alert("ERROR: NO CLIENT ID PROVIDED.");
                return;
            }

            const currentUserRole = localStorage.getItem('vp_chat_role');
            if (currentUserRole !== 'ceo') {
                alert("ACCESS DENIED: ONLY THE CEO MAY REVOKE HANDSHAKES.");
                return;
            }

            if (confirm(`PROTOCOL: REVOKE ACCESS FOR CLIENT [${authorId}]?`)) {
                try {
                    const passcode = localStorage.getItem('vp_chat_passcode');
                    if (passcode !== '0304') {
                        alert("REVOCATION ABORTED: INVALID CEO SESSION.");
                        return;
                    }

                    await setDoc(doc(db, 'banned_clients', authorId), {
                        status: 'banned',
                        bannedAt: serverTimestamp(),
                        bannedBy: 'CEO (MANUAL)',
                        passcode: passcode
                    });
                    manualRevokeInput.value = '';
                    alert("CLIENT TERMINATED. HANDSHAKE REVOKED.");
                } catch (err) {
                    console.error("Manual revoke failed:", err);
                    alert(`REVOKE ERROR: ${err.message}`);
                }
            }
        };
    }

    if (clearReportsBtn) clearReportsBtn.classList.add('hidden');
    if (clearLogsBtn) clearLogsBtn.onclick = () => {
        const currentUserRole = localStorage.getItem('vp_chat_role');
        if (currentUserRole !== 'ceo') {
            alert("ACCESS DENIED: ONLY THE CEO MAY PURGE SYSTEM LOGS.");
            return;
        }
        purgeCollection('forum_messages', 'CHAT LOGS');
    };
    if (unrevokeAllBtn) unrevokeAllBtn.onclick = unrevokeAllHandshakes;
    if (masterControlBtn) {
        masterControlBtn.onclick = async () => {
            const panel = document.getElementById('ceo-master-panel');
            if (panel && !panel.classList.contains('hidden')) {
                panel.classList.add('hidden');
                return;
            }

            const code = prompt("ENTER MASTER AUTHORIZATION CODE:")?.trim() || "";
            const upperCode = code.toUpperCase();
            
            const isCeo = code === '0304';
            const isSupplier = code === '9871';
            const isOgDev = code === '3421';
            const isExeDev = code === '0007';
            const isDeveloper = code === '0981';
            const isMarlon = code === '8765';
            const isByrnesey = code === '7771';
            const isUpTheBlues = upperCode === 'UP THE BLUES';
            
            if (isCeo || isSupplier || isOgDev || isExeDev || isMarlon || isDeveloper || isByrnesey || isUpTheBlues) {
                let role = 'staff';
                let name = 'STAFF';
                let rank = '2';

                if (isCeo) {
                    role = 'ceo';
                    name = 'CEO';
                    rank = '1';
            } else if (isExeDev) {
                role = 'exe_dev';
                name = 'EXECUTIVE DEV';
                rank = '1';
            } else if (isSupplier) {
                role = 'supplier';
                name = 'FAT GAME SUPPLIER';
                rank = '1';
            } else if (isOgDev) {
                role = 'og_dev';
                name = 'OG DEV';
                rank = '1';
            } else if (isDeveloper) {
                role = 'developer';
                name = 'DEVELOPER';
                rank = '3';
            } else if (isMarlon) {
                role = 'og_dev';
                name = 'MARLON';
                rank = '1';
            } else if (isByrnesey) {
                role = 'mod';
                name = 'BYRNESEY';
                rank = '2';
            } else if (isUpTheBlues) {
                role = 'mod';
                name = 'UP THE BLUES STAFF';
                rank = '2';
            }

                localStorage.setItem('vp_chat_role', role);
                localStorage.setItem('vp_chat_name', name);
                localStorage.setItem('vp_chat_rank', rank);
                localStorage.setItem('vp_chat_authorized', 'true');
                localStorage.setItem('vp_chat_passcode', code);
                
                if (panel) panel.classList.remove('hidden');

                // Differentiate UI in the panel if needed
                const clearLogsBtn = document.getElementById('clear-logs-btn');
                const unrevokeAllBtn = document.getElementById('unrevoke-all-btn');
                if (clearLogsBtn) {
                    if (isCeo) {
                        clearLogsBtn.classList.remove('hidden');
                    } else {
                        clearLogsBtn.classList.add('hidden');
                    }
                }
                if (unrevokeAllBtn) {
                    if (isCeo) {
                        unrevokeAllBtn.classList.remove('hidden');
                    } else {
                        unrevokeAllBtn.classList.add('hidden');
                    }
                }
                
                // Sync to Firestore immediately
                let user = auth.currentUser;
                if (!user) {
                    try {
                        console.log("Master Authorization: Establishing Secure Bridge...");
                        // Use silent anonymous auth to avoid domain/popup errors; rule updates allow operations
                        await signInAnonymously(auth);
                        user = auth.currentUser;
                    } catch (authErr) {
                        console.warn("Master Secure Bridge (Anon) failed:", authErr);
                    }
                }
                
                if (user) {
                    try {
                        const syncData = {
                            role: role,
                            name: name,
                            status: 'active',
                            passcode: code,
                            updatedAt: serverTimestamp()
                        };
                        await setDoc(doc(db, 'authorized_users', user.uid), syncData, { merge: true });
                        console.log("Master Link Synchronized [UID: " + user.uid + "]");
                    } catch (e) {
                        console.error("Master Link Sync Failed:", e);
                    }
                }
            } else if (code) {
                alert("ACCESS DENIED: INVALID AUTHORIZATION PAYLOAD");
            }
        };
    }
    if (closeMasterPanelBtn) closeMasterPanelBtn.onclick = () => {
        const panel = document.getElementById('ceo-master-panel');
        if (panel) panel.classList.add('hidden');
    };

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

        // Global Ban Check
        const uplinkId = localStorage.getItem('vp_uplink_id');
        if (uplinkId && db) {
            getDoc(doc(db, 'banned_clients', uplinkId)).then(docSnap => {
                if (docSnap.exists()) {
                    console.error("CRITICAL: CLIENT UNTRUSTED. TERMINATING SESSION.");
                    // Effectively kill the app
                    document.body.innerHTML = `
                        <div class="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-10 text-center">
                            <i class="bi bi-shield-slash text-red-500 text-6xl mb-8 animate-pulse"></i>
                            <h1 class="text-white text-5xl font-black uppercase italic tracking-tighter mb-4">ACCESS REVOKED</h1>
                            <p class="text-zinc-500 text-sm font-mono uppercase tracking-[0.2em] max-w-lg leading-relaxed mb-12">The secure link with Client [${uplinkId}] has been terminated by terminal authority.</p>
                            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-12">
                                <span class="text-[10px] font-mono text-red-400 uppercase tracking-widest leading-none">IDENTITY_BANNED_BY_CEO</span>
                            </div>
                            <p class="text-zinc-600 text-[8px] font-black uppercase tracking-widest animate-flicker">Connection Lost // Handshake Failed</p>
                        </div>
                    `;
                    document.body.style.overflow = 'hidden';
                }
            }).catch(e => console.warn("Ban check error:", e));
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
    
    // Toggle disconnect button based on session state
    const disconnectBtn = document.getElementById('terminal-session-disconnect');
    if (disconnectBtn) {
        if (localStorage.getItem('vp_chat_authorized') === 'true') {
            disconnectBtn.classList.remove('hidden');
        } else {
            disconnectBtn.classList.add('hidden');
        }
    }

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
    const code = terminalPassInput?.value?.trim();
    if (!code) return;

    const currentRole = localStorage.getItem('vp_chat_role');
    const isAuthorizedLocal = localStorage.getItem('vp_chat_authorized') === 'true';

    // SPECIAL CEO COMMAND: PURGE CITIZEN REPORTS (Legacy command - removed)
    if (code.toUpperCase() === 'PURGE' && currentRole === 'ceo' && isAuthorizedLocal) {
        if (terminalStatusLog) terminalStatusLog.textContent = 'PROTOCOL: INITIATING DESTRUCTION...';
        setTimeout(() => {
            if (terminalStatusLog) terminalStatusLog.textContent = 'PURGE COMMAND DEPRECATED. USE MASTER CONTROL UI.';
        }, 1000);
        return;
    }

    const isCeo = code === '0304';
    const isSupplier = code === '9871';
    const isOgDev = code === '3421';
    const isExeDev = code === '0007';
    const isDeveloper = code === '0981';
    const isMarlon = code === '8765';
    const isByrnesey = code === '7771';
    const isUpTheBlues = code.toUpperCase() === 'UP THE BLUES';

    if (code.toUpperCase() === 'JOHNPORK') {
        if (terminalStatusLog) terminalStatusLog.textContent = 'LOCATING SUBJECT... JOHN PORK IS WATCHING';
        setTimeout(() => {
            triggerJohnPorkScare("TERMINAL_UPLINK");
            closeDevTerminal();
        }, 1000);
        return;
    }

    if (isCeo || isSupplier || isOgDev || isExeDev || isMarlon || isDeveloper || isByrnesey || isUpTheBlues) {
        try {
            if (terminalStatusLog) terminalStatusLog.textContent = 'VALIDATING PROTOCOL...';
            
            let role = 'staff';
            let name = 'Staff';
            let rank = '2';

            if (isCeo) {
                role = 'ceo';
                name = 'CEO';
                rank = '1';
            } else if (isOgDev) {
                role = 'og_dev';
                name = 'OG DEV';
                rank = '1';
            } else if (isExeDev) {
                role = 'exe_dev';
                name = 'EXECUTIVE DEV';
                rank = '1';
            } else if (isMarlon) {
                role = 'og_dev';
                name = 'MARLON';
                rank = '1';
            } else if (isSupplier) {
                role = 'supplier';
                name = 'FAT GAME SUPPLIER';
                rank = '1';
            } else if (isDeveloper) {
                role = 'developer';
                name = 'DEVELOPER';
                rank = '3';
            } else if (isByrnesey) {
                role = 'mod';
                name = 'BYRNESEY';
                rank = '2';
            } else if (isUpTheBlues) {
                role = 'mod';
                name = 'UP THE BLUES STAFF';
                rank = '2';
            }

            localStorage.setItem('vp_chat_role', role);
            localStorage.setItem('vp_chat_name', name);
            localStorage.setItem('vp_chat_rank', rank);
            localStorage.setItem('vp_chat_passcode', code);
            localStorage.setItem('vp_chat_authorized', 'true');
            
            if (!localStorage.getItem('vp_uplink_id')) {
                localStorage.setItem('vp_uplink_id', 'client-' + Math.random().toString(36).substring(2, 15));
            }

            // Sync all special roles to Firestore to prevent session drift and role hijacking
            if (isCeo || isDeveloper || isExeDev || isOgDev || isSupplier || isByrnesey) {
                if (terminalStatusLog) terminalStatusLog.textContent = `ESTABLISHING ${role.toUpperCase()} LINK...`;
                try {
                    let sessionUser = auth.currentUser;
                    if (!sessionUser) {
                        try {
                            const cred = await signInAnonymously(auth);
                            sessionUser = cred.user;
                        } catch (authErr) {
                            console.warn("Auth sync restricted:", authErr);
                        }
                    }
    
                    if (sessionUser) {
                        const syncData = {
                            role: role,
                            name: name,
                            status: 'active',
                            passcode: code,
                            updatedAt: serverTimestamp()
                        };
                        await setDoc(doc(db, 'authorized_users', sessionUser.uid), syncData, { merge: true });
                        console.log(`${role.toUpperCase()} Link Synchronized [UID: ${sessionUser.uid}]`);
                        if (terminalStatusLog) terminalStatusLog.textContent = `${role.toUpperCase()} LINK ACTIVE. UPLINK RESTORED.`;
                    }
                } catch (dbErr) {
                    console.error(`${role.toUpperCase()} Sync failed:`, dbErr);
                }
            }
            
            if (terminalStatusLog) terminalStatusLog.textContent = 'PROTOCOL ACCEPTED. UPLINK ACTIVE.';
            
            setTimeout(() => {
                closeDevTerminal();
                updateForumAuthUI();
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

        let authorId = localStorage.getItem('vp_uplink_id');
        if (!authorId) {
            authorId = 'client-' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('vp_uplink_id', authorId);
        }

        const bannedDoc = await getDoc(doc(db, 'banned_clients', authorId));
        if (bannedDoc.exists()) {
            alert("ACCESS REVOKED: You have been blocked from the network.");
            location.reload(); 
            return;
        }

        const role = localStorage.getItem('vp_chat_role') || 'guest';
        const storedPasscode = localStorage.getItem('vp_chat_passcode');

        const storedName = localStorage.getItem('vp_chat_name');
        const rank = localStorage.getItem('vp_chat_rank') || (role === 'ceo' ? 'RANK OWNER (JOHN PORK IS WATCHING)' : (['developer', 'dev'].includes(role) ? '3' : (['supplier', 'og_dev', 'exe_dev'].includes(role) ? '1' : '2')));
        let name = storedName || 'Guest';
        
        if (!storedName || (storedName === 'STAFF' && role !== 'guest_staff')) {
            if (role === 'ceo') name = 'CEO';
            else if (role === 'supplier') name = 'FAT GAME SUPPLIER';
            else if (role === 'og_dev') name = 'OG DEV';
            else if (role === 'exe_dev') name = 'EXECUTIVE DEV';
            else if (role === 'developer' || role === 'dev') name = 'DEVELOPER';
            else if (role === 'mod') {
                if (storedPasscode === '7771') name = 'BYRNESEY';
                else if (storedPasscode && storedPasscode.toUpperCase() === 'UP THE BLUES') name = 'UP THE BLUES STAFF';
                else name = 'STAFF MOD';
            }
        }
        
        const passcode = localStorage.getItem('vp_chat_passcode');
        const finalAuthorId = authorId;

        await addDoc(collection(db, 'forum_messages'), {
            content,
            authorId: finalAuthorId,
            firebaseUid: auth.currentUser?.uid || null,
            authorName: name,
            authorRole: role,
            authorRank: rank,
            authorPhoto: role === 'ceo' ? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHiqgp9hbtVyjykpf-PJf6yy2n6WdglOha1Q&s' : (name === 'MARLON' ? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJdZ9F-vwMdSWpO6JtQkTW0hRMpJXJ225HGA&s' : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`),
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
        // Do NOT signOut, just drop local elevation
        updateForumAuthUI();
        alert("TERMINAL DISCONNECTED. LOCAL PROTOCOLS OFFLINE.");
    }
}

async function unrevokeAllHandshakes() {
    const currentUserRole = localStorage.getItem('vp_chat_role');
    if (currentUserRole !== 'ceo') {
        alert("ACCESS DENIED: ONLY THE CEO MAY RESTORE ALL HANDSHAKES.");
        return;
    }

    if (!confirm("PROTOCOL: RESTORE ALL SYSTEM HANDSHAKES? \nThis will unrevoke EVERY blacklisted client and reset access statuses.")) return;

    try {
        // 1. Clear banned_clients
        const bannedSnap = await getDocs(collection(db, 'banned_clients'));
        const batch = writeBatch(db);
        bannedSnap.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        // 2. Clear status in authorized_users
        const q = query(collection(db, 'authorized_users'), where('status', '==', 'banned'));
        const bannedUsersSnap = await getDocs(q);
        bannedUsersSnap.forEach((doc) => {
            batch.update(doc.ref, { status: 'active', updatedAt: serverTimestamp() });
        });

        await batch.commit();
        alert("SYSTEM PURGE COMPLETE: ALL HANDSHAKES RESTORED.");
        location.reload();
    } catch (err) {
        console.error("Global unrevoke failed:", err);
        alert(`PROTOCOL FAILURE: ${err.message}`);
    }
}

async function purgeCollection(collectionName, label) {
    const currentUserRole = localStorage.getItem('vp_chat_role');
    if (currentUserRole !== 'ceo') {
        alert("CRITICAL ERROR: ACCESS VIOLATION. ONLY THE CEO MAY INITIATE A FULL PURGE.");
        return;
    }

    if (!confirm(`CRITICAL PROTOCOL: PURGE ALL ${label}? This operation is irreversible.`)) return;
    
    let user = auth.currentUser;
    if (!user) {
        try {
            await signInAnonymously(auth);
            user = auth.currentUser;
        } catch (e) {
            console.error("Purge auth failed:", e);
        }
    }

    if (!user) {
        alert("SECURITY ERROR: UNABLE TO ESTABLISH IDENTITY FOR PURGE.");
        return;
    }

    const statusLog = document.getElementById('terminal-status-log');
    if (statusLog) statusLog.textContent = `INITIATING PURGE: ${label}...`;
    
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        if (snapshot.empty) {
            if (statusLog) statusLog.textContent = `PURGE ABORTED: ${label} VOID.`;
            alert(`NOTICE: No ${label} found to delete.`);
            return;
        }

        const docs = snapshot.docs;
        let count = 0;
        
        // Firestore batches are limited to 500 operations.
        // We iterate in chunks of 500.
        for (let i = 0; i < docs.length; i += 500) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + 500);
            chunk.forEach(d => {
                batch.delete(d.ref);
                count++;
            });
            await batch.commit();
            if (statusLog) statusLog.textContent = `PURGE IN PROGRESS: ${count}/${docs.length}...`;
        }

        console.log(`${label} Purged: ${count} documents removed.`);
        if (statusLog) statusLog.textContent = `PURGE COMPLETE: ${count} ${label} REMOVED.`;
        
        // Final verification for user
        alert(`SUCCESS: ${count} ${label} have been cleared from the terminal.`);
        
    } catch (err) {
        console.error(`${label} Purge failed:`, err);
        if (statusLog) statusLog.textContent = `ERROR: ${err.code}`;
        alert(`PERMISSION DENIED: Unable to purge ${label}. Core rejected request. [${err.code}]`);
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
            promptText.textContent = isBanned ? "SESSION TERMINATED // ACCESS REVOKED BY CEO // JOHN PORK IS WATCHING" : "OFFICIAL UPLINK ACCESS REQUIRED TO POST // JOHN PORK IS WATCHING";
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
            const val = e.target.value.toLowerCase();
            
            // Standard Search
            currentSearch = val;
            renderRecentlyPlayed();
            renderItems();

            // John Pork Search Trigger (Number 4)
            if (val === 'johnpork' || val === 'john pork' || val === 'where is he') {
                triggerJohnPorkScare("SEARCH_RECOVERY");
                e.target.value = '';
                currentSearch = '';
                renderItems();
            }

            // System Hint Trigger
            if (val === 'hint' || val === 'easter egg' || val === 'egg') {
                showSystemHints();
                e.target.value = '';
                currentSearch = '';
                renderItems();
            }
        });
    }

    function showSystemHints() {
        const toast = document.createElement('div');
        toast.className = "fixed bottom-8 right-8 z-[200] bg-zinc-950 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl max-w-xs animate-in slide-in-from-right duration-500 backdrop-blur-xl";
        toast.innerHTML = `
            <div class="flex items-center gap-4 mb-3">
                <i class="bi bi-lightbulb-fill text-cyan-400"></i>
                <h4 class="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">System Handshake</h4>
            </div>
            <ul class="text-[10px] text-zinc-400 font-mono space-y-2 uppercase tracking-wider">
                <li>• Alt + P: The Hidden Console</li>
                <li>• Terminal Code: 'JOHNPORK'</li>
                <li>• Triple click the Portal title</li>
                <li>• He watches from the top right</li>
                <li>• Search for 'John Pork'</li>
                <li>• Konami: ↑↑↓↓←→←→BA</li>
                <li>• 7 rapid clicks on 'Surprise'</li>
                <li>• Double click the Baud Ticker</li>
                <li>• Just type 'pork' on keyboard</li>
            </ul>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
            setTimeout(() => toast.remove(), 500);
        }, 10000);
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
    if (voteUpBtn) voteUpBtn.onclick = () => submitVoteReport('up');
    if (voteDownBtn) voteDownBtn.onclick = () => submitVoteReport('down');
    
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
    const terminalSessionDisconnectBtn = document.getElementById('terminal-session-disconnect');
    if (terminalSessionDisconnectBtn) terminalSessionDisconnectBtn.onclick = async () => {
        await logoutTerminal();
        closeDevTerminal();
    };
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

    // No review input anymore

    // Forum
    const forumBtn = document.getElementById('forum-btn');
    if (forumBtn) forumBtn.onclick = openForumModal;
    if (closeForumBtn) closeForumBtn.onclick = closeForumModal;
    if (sendForumMsgBtn) sendForumMsgBtn.onclick = postForumMessage;

    // Master Control Logic
    const masterControlBtn = document.getElementById('master-control-btn');
    const masterPanel = document.getElementById('ceo-master-panel');
    const closeMasterBtn = document.getElementById('close-master-panel');

    // Developer Login (Integrated into Terminal logic usually, but keep for UI compatibility)
    const terminalLogoutBtn = document.getElementById('terminal-logout-btn');
    if (terminalLogoutBtn) terminalLogoutBtn.onclick = logoutTerminal;

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

    const devLoginBtnElement = document.getElementById('dev-login-btn');
    if (devLoginBtnElement) devLoginBtnElement.onclick = () => {
        const code = prompt("ENTER AUTHORIZATION PASSCODE:")?.trim() || "";
        const uc = code.toUpperCase();
        if (code === '0304' || code === '9871' || code === '3421' || code === '0007' || code === '8765' || code === '0981' || code === '7771' || uc === 'UP THE BLUES') {
            if (terminalPassInput) terminalPassInput.value = code;
            handleTerminalAuth();
        } else if (code) {
            alert("PROTOCOL ERROR: INVALID PASSCODE.");
        }
    };

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

    // Special Triggers
    const systemTicker = document.getElementById('system-ticker');
    if (systemTicker) {
        systemTicker.style.cursor = 'help';
        systemTicker.ondblclick = () => triggerJohnPorkScare("BAUD_OVERFLOW");
    }

    const topEgg = document.getElementById('pork-easter-egg-1');
    if (topEgg) {
        topEgg.onclick = (e) => {
            e.preventDefault();
            triggerJohnPorkScare("CORNER_UPLINK");
        };
    }

    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
        let clickCount = 0;
        let lastClick = 0;
        mainTitle.style.cursor = 'help';
        mainTitle.onclick = () => {
            const now = Date.now();
            if (now - lastClick < 600) {
                clickCount++;
            } else {
                clickCount = 1;
            }
            lastClick = now;
            if (clickCount >= 3) {
                clickCount = 0;
                triggerJohnPorkScare("TRIPLE_OVERRIDE");
            }
        };
    }

    if (surpriseBtn) {
        let scCount = 0;
        surpriseBtn.addEventListener('click', (e) => {
            scCount++;
            if (scCount >= 7) {
                scCount = 0;
                triggerJohnPorkScare("SURPRISE_PROTOCOL");
            }
            setTimeout(() => { scCount = 0; }, 3000);
        });
    }

    // Typing 'pork' anywhere
    let porkSequence = '';
    let konamiIndex = 0;
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', (e) => {
        // Alt + P for terminal
        if (e.altKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            openDevTerminal();
            return;
        }

        // Skip if typing in an input or textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Pork sequence
        porkSequence += e.key.toLowerCase();
        if (porkSequence.endsWith('pork')) {
            triggerJohnPorkScare("PORK_HANDSHAKE");
            porkSequence = '';
        }
        if (porkSequence.length > 10) porkSequence = porkSequence.substring(1);

        // Konami code
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                triggerJohnPorkScare("KONAMI_UPLINK");
            }
        } else {
            konamiIndex = 0;
        }
    });

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
        const storedPasscode = localStorage.getItem('vp_chat_passcode');

        // Legacy check for decommissioned sessions (disabled as it's active again)
        if (storedRole === 'developer' || storedPasscode === '0981' || storedPasscode === '7771' || storedRole === 'dev') {
            console.log("Special staff session active.");
        }

        const isAuthorizedLocal = localStorage.getItem('vp_chat_authorized') === 'true';
        const isCeoEmail = user && (user.email === "jackcampell608@gmail.com");
        
        // Auto-authorize if using a verified CEO email AND current passcode is correct
        if (isCeoEmail && storedPasscode === '0304') {
            const currentRole = localStorage.getItem('vp_chat_role');
            if (currentRole !== 'ceo') {
                console.log("Verified CEO Identity detected. Promoting to CEO status...");
                const name = user.email === "jackcampell608@gmail.com" ? "JACK CAMPELL" : "MANDY MCGREGOR";
                localStorage.setItem('vp_chat_role', 'ceo');
                localStorage.setItem('vp_chat_authorized', 'true');
                localStorage.setItem('vp_chat_name', name);
                localStorage.setItem('vp_chat_passcode', '0304');
            }
        }

        const isAuthorized = localStorage.getItem('vp_chat_authorized') === 'true';
        const currentRole = localStorage.getItem('vp_chat_role');
        const currentName = localStorage.getItem('vp_chat_name') || 'STAFF';

        // Ensure staff status is synced if authenticated
        if (user && isAuthorized && (currentRole === 'ceo' || currentRole === 'exe_dev' || currentRole === 'developer' || currentRole === 'mod' || currentRole === 'supplier' || currentRole === 'og_dev' || currentRole === 'staff')) {
            try {
                await setDoc(doc(db, 'authorized_users', user.uid), {
                    role: currentRole,
                    name: currentName,
                    status: 'active',
                    passcode: storedPasscode || (currentRole === 'ceo' ? '0304' : (currentRole === 'developer' ? '0981' : (currentRole === 'mod' ? '7771' : (currentRole === 'supplier' ? '9871' : '0007')))),
                    updatedAt: serverTimestamp()
                }, { merge: true });
            } catch (syncErr) {
                console.error("Auth State sync failed:", syncErr);
            }
        }
        
        if (!user && isAuthorized && storedRole === 'ceo') {
            console.log("CEO session active but unauthenticated. Manual Sync Required for Admin Tools.");
        } else if (user && isAuthorized && storedRole === 'ceo') {
            try {
                // Force sync periodically
                const passcode = localStorage.getItem('vp_chat_passcode') || '0304';
                const syncData = {
                    role: 'ceo',
                    status: 'active',
                    passcode: passcode,
                    updatedAt: serverTimestamp()
                };

                await setDoc(doc(db, 'authorized_users', user.uid), syncData, { merge: true });
                console.log("CEO Pulse Synced [UID: " + user.uid + "]");
            } catch (err) {
                console.warn("Pulse Link failed. ERROR: auth/admin-restricted-operation means you MUST enable Anonymous Auth in Firebase Console.");
                if (err.code === 'auth/admin-restricted-operation') {
                    alert("FIREBASE PERMISSION ERROR: Anonymous Authentication is DISABLED. Handshake rejected. Admin must enable it for CEO Mode functions.");
                } else {
                    console.log("CEO Pulse Sync pending auth permissions...");
                }
            }
        }
        updateForumAuthUI(user);
    });

    const googleAdminBtn = document.getElementById('google-admin-login');
    if (googleAdminBtn) {
        googleAdminBtn.onclick = async () => {
            const provider = new GoogleAuthProvider();
            try {
                // Attempt identity sync
                await signInWithPopup(auth, provider);
            } catch (err) {
                if (err.code === 'auth/unauthorized-domain') {
                    const currentDomain = window.location.hostname;
                    alert(`VERIFICATION ERROR: Domain Not Authorized.\n\nTo enable this button:\n1. Open Firebase Console\n2. Authentication > Settings > Authorized Domains\n3. Add this domain: ${currentDomain}\n\nUntil then, use the local terminal code 0304 for standard admin tools.`);
                } else {
                    alert(`SYNC ERROR: ${err.message}`);
                }
            }
        };
    }
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
    
    // Generate background noise logs
    const logContainer = document.getElementById('disclaimer-logs');
    if (logContainer) {
        logContainer.innerHTML = '';
        const commands = [
            'LOAD_MODULE: VAULT_CORE', 'SYNC_AUTH: GATEWAY_01', 'HEX_DUMP: 0x77AF',
            'ENCRYPT_SESSION: TRUE', 'ESTABLISH_BRIDGE: SUCCESS', 'LATENCY: 12ms',
            'RECOVERY_POINT: SET', 'OVERRIDE_AUTH: BYPASSED', 'GHOST_PROTOCOL: ACTIVE',
            'WIPE_TRACES: PENDING', 'KERNEL_HOOK: ATTACHED', 'DIST_SYNC: COMPLETED',
            'BYTE_MAP: 010110', 'TRACERT_SEQ: 9811', 'IP_REVERSE: PROXIED'
        ];
        for (let i = 0; i < 400; i++) {
            const span = document.createElement('span');
            span.className = 'opacity-50';
            span.textContent = commands[Math.floor(Math.random() * commands.length)];
            logContainer.appendChild(span);
        }
    }

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
    }, 1000);
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
    
    nav.innerHTML = '';
    const categoriesList = ['All', 'Favorites ⭐', ...sortedCategories];
    
    // Update Active Title
    const activeHeader = getEl('active-category-title');
    if (activeHeader) activeHeader.textContent = currentCategory === 'All' ? 'Central Archive' : currentCategory;

    categoriesList.forEach(category => {
        const btn = document.createElement('button');
        const isActive = currentCategory === category;
        
        // Responsive Sidebar & Row Styling
        btn.className = `flex-shrink-0 lg:w-full flex items-center justify-between px-6 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border group ${
            isActive 
            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] lg:scale-[1.05] z-10' 
            : 'bg-zinc-900/40 lg:bg-transparent text-zinc-500 border-white/5 lg:border-transparent hover:bg-white/5 hover:text-zinc-300 hover:border-white/10'
        }`;
        
        const count = category === 'All' 
            ? entries.length 
            : category === 'Favorites ⭐' 
                ? userData.favorites.length 
                : entries.filter(e => (e.categories || []).includes(category)).length;

        btn.innerHTML = `
            <span>${category}</span>
            <span class="${isActive ? 'text-black/50' : 'text-zinc-700'} font-mono text-[8px]">${count}</span>
        `;

        btn.onclick = () => {
            currentCategory = category;
            renderCategories();
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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



function renderItems() {
    const grid = getEl('items-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const term = (currentSearch || '').toLowerCase().trim();
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
        const cats = (item.categories || []).join(' ').toLowerCase();
        const matchesSearch = title.includes(term) || desc.includes(term) || cats.includes(term);
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
                    <button onclick="document.getElementById('search-input').value=''; document.getElementById('search-input').dispatchEvent(new Event('input'));" class="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors">Reset Query</button>
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
                <div class="absolute inset-0 flex items-center justify-center bg-zinc-900 overflow-hidden hidden">
                    <span class="text-4xl font-black text-zinc-800 uppercase tracking-tighter opacity-50">${(item.title || '?').charAt(0)}</span>
                </div>
                <img src="${item.thumbnail || FALLBACK_IMAGE}" 
                     alt="${item.title || 'Untitled'}" 
                     class="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110 group-hover:blur-md z-10" 
                     referrerpolicy="no-referrer"
                     onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.previousElementSibling.classList.remove('hidden');">
                
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
                <div class="absolute inset-0 flex items-center justify-center bg-zinc-900 hidden">
                    <span class="text-3xl font-black text-zinc-800 uppercase tracking-tighter opacity-50">${(item.title || '?').charAt(0)}</span>
                </div>
                <img src="${item.thumbnail || FALLBACK_IMAGE}" 
                     alt="${item.title || 'Game'}" 
                     class="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110 group-hover:blur-md z-10" 
                     referrerpolicy="no-referrer"
                     onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.previousElementSibling.classList.remove('hidden');">
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-60 z-20"></div>
                
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
            notify.className = "fixed top-0 left-0 right-0 z-[100] bg-rose-600 border-b border-rose-400 p-6 flex flex-col items-center justify-center gap-4 transition-transform duration-700 shadow-[0_0_50px_rgba(225,29,72,0.5)] -translate-y-full";
            msg.className = "text-white text-xl font-black text-center uppercase tracking-widest leading-tight";
            msg.innerHTML = `SYSTEM NOTICE:<br>UPON ENTERING THE GAME, YOU WILL BE ASKED FOR A PASSWORD. <br>IT IS <span class="bg-white text-rose-600 px-4 py-1 rounded-lg ml-2 font-black text-2xl shadow-xl">123</span>`;
            
            close.className = "bg-white text-rose-600 px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl";
            close.textContent = "I UNDERSTAND - LAUNCH GAME";
            
            notify.classList.remove('-translate-y-full');
            notify.classList.add('translate-y-0');
            
            // Pulse the notification for visibility
            notify.classList.add('animate-pulse');
            setTimeout(() => notify.classList.remove('animate-pulse'), 3000);

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
    
    // Mute menu music when playing
    if (spotifyIframe) {
        spotifyIframe.src = 'about:blank';
    }

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
    
    // Restore menu music when returning
    updateMusicPlayer();
    
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
        const syncCeo = (user) => {
            if (!user) return;
            setDoc(doc(db, 'authorized_users', user.uid), {
                role: 'ceo',
                status: 'active',
                updatedAt: serverTimestamp()
            }, { merge: true }).catch(err => console.warn("Master Link Sync failed:", err));
        };

        if (auth.currentUser) {
            syncCeo(auth.currentUser);
        } else {
            signInAnonymously(auth)
                .then(cred => syncCeo(cred.user))
                .catch(err => {
                    if (err.code !== 'auth/admin-restricted-operation') {
                        console.error("Initial Master Link refresh failed:", err);
                    }
                });
        }
    }

    unsubscribeForum = onSnapshot(messagesQuery, async (snapshot) => {
        const authorId = localStorage.getItem('vp_uplink_id');
        if (authorId) {
            try {
                const bannedDoc = await getDoc(doc(db, 'banned_clients', authorId));
                if (bannedDoc.exists()) {
                    forumMessagesView.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20 text-center">
                            <i class="bi bi-shield-slash text-red-500 text-4xl mb-4"></i>
                            <h3 class="text-white font-bold uppercase italic tracking-tighter">ACCESS REVOKED</h3>
                            <p class="text-zinc-500 text-xs mt-2 px-10">Your handshake with the secure relay has been terminated by the CEO.</p>
                            <div class="mt-8 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <span class="text-[9px] font-mono text-red-400 uppercase tracking-widest">CLIENT_TERMINATED_BY_AUTHORITY</span>
                            </div>
                        </div>
                    `;
                    const input = document.getElementById('forum-msg-input');
                    const btn = document.getElementById('send-forum-msg');
                    if (input) input.disabled = true;
                    if (btn) btn.disabled = true;
                    return;
                }
            } catch (err) {
                console.warn("Banned list check failed:", err);
            }
        }

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
            const isMsgCeo = msg.authorRole === 'ceo';
            const isMsgSupplier = msg.authorRole === 'supplier';
            const isMsgOgDev = msg.authorRole === 'og_dev';
            const isMsgExeDev = msg.authorRole === 'exe_dev';
            const isMsgDev = msg.authorRole === 'developer' || msg.authorRole === 'dev';
            const isMsgMod = msg.authorRole === 'mod';
            const isOwnMsg = msg.authorId === (localStorage.getItem('vp_uplink_id'));
            
            // Only the CEO can delete or revoke
            const canDelete = currentUserRole === 'ceo';
            const canRevoke = currentUserRole === 'ceo' && !isMsgCeo;
            const isMsgMarlon = msg.authorName === 'MARLON';
            
            // Check if this specific author is already revoked (this is expensive in a loop, but we do it for the UI)
            const isAlreadyRevoked = false; // We will handle this via a separate state or just offer the toggle

            msgEl.className = `flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 group/msg`;
            msgEl.innerHTML = `
                <img src="${isMsgCeo ? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHiqgp9hbtVyjykpf-PJf6yy2n6WdglOha1Q&s' : (isMsgMarlon ? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJdZ9F-vwMdSWpO6JtQkTW0hRMpJXJ225HGA&s' : (msg.authorPhoto || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + (msg.authorRole || 'guest')))}" class="w-10 h-10 rounded-xl border border-white/5 flex-shrink-0" referrerpolicy="no-referrer">
                <div class="flex flex-col items-start max-w-[80%] relative">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-black ${isMsgCeo ? 'animate-rainbow' : (isMsgSupplier ? 'animate-rainbow' : (isMsgOgDev ? 'text-emerald-400' : (isMsgExeDev ? 'text-rose-400' : (isMsgDev ? 'text-cyan-400' : (isMsgMod ? 'text-amber-400' : 'text-white')))))} uppercase italic leading-none">${isMsgCeo ? 'CEO' : msg.authorName}</span>
                        ${(isMsgCeo || isMsgSupplier) ? `<span class="text-[8px] animate-rainbow font-black uppercase tracking-widest">${isMsgCeo ? 'RANK OWNER (JOHN PORK IS WATCHING)' : 'RANK ' + (msg.authorRank || '1')}</span>` : (msg.authorRank ? `<span class="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">RANK ${msg.authorRank}</span>` : '<span class="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">RANK 2</span>')}
                        <span class="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">${date}</span>
                    </div>
                    <div class="bg-indigo-500/10 text-zinc-200 rounded-2xl p-4 text-sm leading-relaxed border border-indigo-500/20 relative group/msg-content">
                        ${msg.content}
                        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 empty:hidden">
                            ${canDelete ? `
                                <button class="delete-msg-btn text-zinc-500 hover:text-red-400 flex items-center gap-1.5 transition-colors" data-id="${docSnap.id}">
                                    <i class="bi bi-trash"></i>
                                    <span class="text-[9px] font-black uppercase tracking-widest">Purge Log</span>
                                </button>
                            ` : ''}
                            ${canRevoke ? `
                                <button class="revoke-access-btn text-zinc-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors" data-authorid="${msg.authorId}">
                                    <i class="bi bi-person-x"></i>
                                    <span class="text-[9px] font-black uppercase tracking-widest">Revoke</span>
                                </button>
                                <button class="unrevoke-access-btn text-zinc-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors" data-authorid="${msg.authorId}">
                                    <i class="bi bi-person-check"></i>
                                    <span class="text-[9px] font-black uppercase tracking-widest">Restore</span>
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
            const currentUserRole = localStorage.getItem('vp_chat_role');
            const isCeo = currentUserRole === 'ceo';

            if (!isCeo) {
                alert("ACCESS DENIED: ONLY THE CEO MAY PURGE LOGS.");
                return;
            }

            if (confirm("PROTOCOL: DELETE THIS LOG FROM THE GRID?")) {
                try {
                    // Pre-verification: Check if User Identity is established
                    if (!auth.currentUser) {
                        try {
                            await signInAnonymously(auth);
                        } catch (err) {
                            if (err.code === 'auth/admin-restricted-operation') {
                                throw new Error("Anonymous Auth is DISABLED. Go to Firebase Console > Authentication > Sign-in method and ENABLE 'Anonymous' to use admin purging.");
                            }
                            throw err;
                        }
                    }
                    
                    await deleteDoc(doc(db, 'forum_messages', msgId));
                    alert("LOG PURGED SUCCESSFULLY.");
                } catch (err) {
                    console.error("Deletion failed:", err);
                    alert(`DELETION ERROR: ${err.message || 'SYSTEM REJECTION'}`);
                }
            }
        };
    });

    document.querySelectorAll('.revoke-access-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const authorId = btn.getAttribute('data-authorid');
            const currentUserRole = localStorage.getItem('vp_chat_role');
            const isCeo = currentUserRole === 'ceo';

            if (!isCeo) {
                alert("ACCESS DENIED: ONLY THE CEO MAY REVOKE HANDSHAKES.");
                return;
            }

            if (confirm(`PROTOCOL: REVOKE ACCESS FOR CLIENT [${authorId.substring(0, 15)}]?`)) {
                try {
                    let passcode = localStorage.getItem('vp_chat_passcode');
                    if (!passcode) {
                        passcode = prompt("SECURITY HANDSHAKE REQUIRED: RE-ENTER CEO PASSCODE TO AUTHORIZE REVOCATION:");
                    }
                    
                    if (!passcode || passcode !== '0304') {
                        alert("REVOCATION ABORTED: INVALID OR MISSING AUTHORIZATION.");
                        return;
                    }

                    let user = auth.currentUser;
                    if (!user) {
                        try {
                            await signInAnonymously(auth);
                        } catch (authErr) {
                            if (authErr.code !== 'auth/admin-restricted-operation') {
                                throw authErr;
                            }
                            console.warn("Secure Bridge (Anon) restricted, proceeding with local authorization only.");
                        }
                    }
                    
                    await setDoc(doc(db, 'banned_clients', authorId), {
                        status: 'banned',
                        bannedAt: serverTimestamp(),
                        bannedBy: 'CEO',
                        passcode: passcode // Satisfy Firestore security rules
                    });
                    alert("CLIENT TERMINATED. HANDSHAKE REVOKED.");
                } catch (err) {
                    console.error("Revoke failed:", err);
                    alert(`REVOKE ERROR [${err.code}]: ${err.code === 'permission-denied' ? 'SYSTEM REJECTION (Banned list write denied)' : 'Secure Bridge rejected termination request.'}`);
                }
            }
        };
    });

    document.querySelectorAll('.unrevoke-access-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const authorId = btn.getAttribute('data-authorid');
            const currentUserRole = localStorage.getItem('vp_chat_role');
            const isCeo = currentUserRole === 'ceo';

            if (!isCeo) {
                alert("ACCESS DENIED: ONLY THE CEO MAY RESTORE HANDSHAKES.");
                return;
            }

            if (confirm(`PROTOCOL: RESTORE ACCESS FOR CLIENT [${authorId.substring(0, 15)}]?`)) {
                try {
                    let passcode = localStorage.getItem('vp_chat_passcode');
                    if (!passcode) {
                        passcode = prompt("SECURITY HANDSHAKE REQUIRED: RE-ENTER CEO PASSCODE TO AUTHORIZE RESTORATION:");
                    }
                    
                    if (!passcode || passcode !== '0304') {
                        alert("RESTORATION ABORTED: INVALID OR MISSING AUTHORIZATION.");
                        return;
                    }

                    await deleteDoc(doc(db, 'banned_clients', authorId));
                    alert("CLIENT HANDSHAKE RESTORED. ACCESS GRANTED.");
                } catch (err) {
                    console.error("Restore failed:", err);
                    alert(`RESTORE ERROR: ${err.message || 'SYSTEM REJECTION'}`);
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
    detailsImg.referrerPolicy = "no-referrer";
    const initialsPlaceholder = document.createElement('div');
    initialsPlaceholder.className = "absolute inset-0 flex items-center justify-center bg-zinc-900 text-6xl font-black text-zinc-800 uppercase hidden";
    initialsPlaceholder.textContent = (item.title || '?').charAt(0);
    
    const imgContainer = detailsImg.parentElement;
    if (imgContainer) {
        // Ensure container is relative and clear previous placeholders
        imgContainer.style.position = 'relative';
        const oldP = imgContainer.querySelector('.details-placeholder');
        if (oldP) oldP.remove();
        initialsPlaceholder.classList.add('details-placeholder');
        imgContainer.prepend(initialsPlaceholder);
    }

    detailsImg.style.display = 'block';
    detailsImg.onerror = function() {
        this.onerror = null;
        this.src = FALLBACK_IMAGE;
        if (initialsPlaceholder) initialsPlaceholder.classList.remove('hidden');
    };
    detailsImg.src = item.thumbnail || FALLBACK_IMAGE;
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
    
    // Reset modal state
    detailsModal.classList.remove('hidden');
    setTimeout(() => {
        detailsModal.classList.remove('opacity-0');
        detailsContainer.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeDetails() {
    activeDetailsGameId = null;
    
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
