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

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Not throwing here to allow the app to continue without crashing hard if possible, 
  // but logging it clearly for the agent to see.
}

const FALLBACK_IMAGE = '/src/assets/images/game_placeholder_vault_1780278911383.png';

const MENU_MUSIC = [
    { type: 'youtube', id: 'oSufECsSYxQ', title: 'Sinking Town Tung Tung Tung Sahur', artist: 'Tung Tung Tung Sahur' },
    { type: 'youtube', id: 'eZtMtL2-vI4', title: 'John Pork is Calling ...', artist: 'Viral Meme' },
    { type: 'youtube', id: 'aSGeQA5eRqw', title: 'TIKI TIKI (Slowed)', artist: 'Kali Uchis' }
];
let currentMusicIndex = 0;
let spotifyIframe;
let isMusicPlaying = true;

function updateMusicPlayer() {
    if (!spotifyIframe) return;
    const track = MENU_MUSIC[currentMusicIndex];
    let trackId = track.id;

    // Update Text UI
    const titleEl = document.getElementById('audio-title');
    const artistEl = document.getElementById('audio-artist');
    const progressBar = document.getElementById('audio-progress');
    const timeLabel = document.getElementById('audio-time-label');
    
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (timeLabel) timeLabel.textContent = `0:00 / 3:30`;
    
    // Reset progress bar animation
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        setTimeout(() => {
            // Animate over a typical 3.5 minute song (210s)
            progressBar.style.transition = 'width 210000ms linear';
            progressBar.style.width = '100%';
        }, 100);
    }
    
    // Support full URLs if provided
    if (trackId.includes('spotify.com/')) {
        const match = trackId.match(/(track|album|playlist)\/([a-zA-Z0-9]+)/);
        if (match) {
            spotifyIframe.setAttribute('allow', 'autoplay; encrypted-media');
            spotifyIframe.src = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0&autoplay=1`;
            return;
        }
    }

    // YouTube fallback with JS API enabled for control
    spotifyIframe.setAttribute('allow', 'autoplay; encrypted-media');
    spotifyIframe.src = `https://www.youtube.com/embed/${trackId}?autoplay=1&mute=0&rel=0&enablejsapi=1&origin=${window.location.origin}`;
}

// Global seeker state
let currentSeekPosition = 0;

function sendAudioCommand(command, args = []) {
    if (!spotifyIframe || !spotifyIframe.contentWindow) return;
    try {
        spotifyIframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: command,
            args: args
        }), '*');
    } catch (e) {
        console.warn("Audio Signal Error:", e);
    }
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
    "title": "Soundboards V1",
    "iframeUrl": "https://soundbuttonspro.com/",
    "thumbnail": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    "categories": ["Utility", "Fun"],
    "description": "Access a variety of instant sounds and soundboard buttons for ultimate fun and reactions."
  },
  {
    "id": "soundboard-guys",
    "title": "Soundboard Guys V2",
    "iframeUrl": "https://soundboardguys.com/",
    "thumbnail": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
    "categories": ["Utility", "Fun"],
    "description": "The alternative massive collection of memes, vine thuds, and viral sound effect buttons."
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
  },
  {
    "id": "omoggle",
    "title": "Omoggle",
    "iframeUrl": "https://y.demo.lhyang.org/https://omogglegame.com/",
    "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScU-H2wo7NEm6BT0QjxqLuThNrCF6tu6bYwA&s",
    "categories": ["Fun", "Arcade", "Trending Games"],
    "description": "Experience the classic Boggle-style word search game with a modern social twist!"
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
let unsubscribeNotifications = null;
let unsubscribeSessions = null;

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
        if (typeof fn === 'function') fn();
    } catch (e) {
        console.error(`Sub-system failure [${name}]:`, e);
    }
}

let unsubscribeBlock = null;
function checkBlockedStatus() {
    const user = auth.currentUser;
    const uid = user ? user.uid : localStorage.getItem('vp_anon_id');
    if (!uid) return;

    if (unsubscribeBlock) unsubscribeBlock();

    unsubscribeBlock = onSnapshot(doc(db, 'banned_clients', uid), (docSnap) => {
        if (docSnap.exists()) {
            document.body.innerHTML = `
                <div class="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-12 text-center">
                    <div class="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/30 mb-12 animate-pulse">
                        <i class="bi bi-slash-circle text-red-500 text-6xl"></i>
                    </div>
                    <h1 class="text-white text-5xl font-black uppercase italic tracking-tighter mb-4">Access Terminated</h1>
                    <p class="text-zinc-600 font-mono text-xs uppercase tracking-[0.4em] mb-12">Handshake Revoked by Master Control</p>
                    <div class="p-8 bg-zinc-900 border border-red-500/20 rounded-[2rem] max-w-md">
                         <p class="text-zinc-400 text-sm font-medium leading-relaxed italic">"Your session token has been invalidated. If you believe this is an error, contact technical support."</p>
                    </div>
                </div>
            `;
            // Block further interactions
            window.stop();
        }
    });
}

function startSessionHeartbeat() {
    let isUpdatingHeartbeat = false;
    const updateHeartbeat = async () => {
        if (isUpdatingHeartbeat) return;
        isUpdatingHeartbeat = true;

        const user = auth.currentUser;
        const uid = user ? user.uid : (localStorage.getItem('vp_anon_id') || 'client_' + Math.random().toString(36).substr(2, 9));
        const activeGame = allEntries.find(e => e.id === currentGameId);
        
        if (!localStorage.getItem('vp_anon_id')) localStorage.setItem('vp_anon_id', uid);

        let screenshot = null;
        let debugStatus = "Idle";
        
        // Only try to capture if the tab is visible to save resources and avoid stale shots
        if (document.visibilityState === 'visible') {
            if (typeof html2canvas !== 'undefined') {
                try {
                    debugStatus = "Capturing...";
                    const canvas = await html2canvas(document.body, {
                        scale: 0.15, 
                        logging: false,
                        useCORS: true,
                        allowTaint: false,
                        timeout: 3000, // Faster timeout
                        onclone: (clonedDoc) => {
                            // Fix for html2canvas failing on oklch() colors (common in Tailwind v4)
                            const style = clonedDoc.createElement('style');
                            style.innerHTML = `
                                * { 
                                    border-color: rgba(255, 255, 255, 0.1) !important; 
                                    outline-color: rgba(255, 255, 255, 0.1) !important;
                                }
                                body { background-color: #050508 !important; }
                                [class*="bg-cyan-"], [class*="text-cyan-"], [class*="border-cyan-"] {
                                    color: #22d3ee !important;
                                    background-color: #22d3ee !important;
                                    border-color: #22d3ee !important;
                                }
                                [class*="bg-black"], [class*="bg-zinc-"] {
                                    background-color: #0c0c0e !important;
                                }
                                /* Force color-mix and oklch fallbacks if the browser clone supports them but html2canvas doesn't */
                                :root {
                                    --color-cyan-500: #22d3ee !important;
                                }
                            `;
                            clonedDoc.head.appendChild(style);
                        },
                        ignoreElements: (el) => {
                            const id = el.id;
                            const tag = el.tagName;
                            return id === 'ceo-master-panel' || 
                                   id === 'monitoring-modal' || 
                                   id === 'inspection-overlay' ||
                                   id === 'big-notification' ||
                                   id === 'top-notification' ||
                                   id === 'pork-easter-egg-1' ||
                                   el.classList?.contains('no-monitor') ||
                                   tag === 'SCRIPT' || tag === 'STYLE' ||
                                   (tag === 'IFRAME' && el.src && !el.src.includes(window.location.hostname));
                        }
                    });
                    if (canvas) {
                        screenshot = canvas.toDataURL('image/jpeg', 0.2); // Lower quality for speed
                        debugStatus = "Success";
                    }
                } catch (e) {
                    console.warn("[Overseer] Heartbeat snapshot skipped:", e.message);
                    debugStatus = "Snapshot Error";
                }
            } else {
                debugStatus = "Lib Missing";
            }
        } else {
            debugStatus = "Tab Background";
        }

        const sessionData = {
            uid: uid,
            email: user?.email || 'Guest Client',
            username: userData.username || (user?.displayName || 'Guest User'),
            lastPath: window.location.pathname,
            currentGameId: currentGameId || 'Dashboard',
            activeGameTitle: activeGame ? activeGame.title : 'Portal Shell',
            activeGameThumb: activeGame ? activeGame.thumbnail : null,
            isPlaying: !!currentGameId,
            lastSeen: serverTimestamp(),
            role: localStorage.getItem('vp_chat_role') || 'guest',
            debugStatus: debugStatus,
            tabActive: document.visibilityState === 'visible',
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        if (screenshot) {
            sessionData.screenPreview = screenshot;
        }

        try {
            await setDoc(doc(db, 'sessions', uid), sessionData, { merge: true });
        } catch (e) {
            console.warn("[Overseer] Heartbeat persistence failed:", e.message);
        } finally {
            isUpdatingHeartbeat = false;
        }
    };

    updateHeartbeat(); 
    setInterval(updateHeartbeat, 10000); // Slightly more frequent
    setInterval(checkBlockedStatus, 30000);
}

function listenForNotifications() {
    const user = auth.currentUser;
    const uid = user ? user.uid : localStorage.getItem('vp_anon_id');
    if (!uid) return;

    if (unsubscribeNotifications) unsubscribeNotifications();
    
    const q = query(collection(db, 'notifications'), where('targetUid', '==', uid), orderBy('timestamp', 'desc'), limit(1));
    unsubscribeNotifications = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                const now = Date.now();
                const msgTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now();
                
                // Only show if message is recent (within 5 mins)
                if (now - msgTime < 300000) {
                    showGlobalPopup(data.message, data.from || "SYSTEM");
                }
            }
        });
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
    });
}

function showGlobalPopup(message, from) {
    const popup = document.createElement('div');
    popup.className = "fixed top-24 left-1/2 -translate-x-1/2 z-[3000] bg-zinc-950/90 border-2 border-cyan-500 rounded-3xl p-8 shadow-[0_0_100px_rgba(34,211,238,0.4)] backdrop-blur-2xl max-w-md w-full animate-in zoom-in-95 duration-300";
    popup.innerHTML = `
        <div class="flex flex-col items-center text-center gap-6">
            <div class="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center border-2 border-cyan-500/30 animate-pulse">
                <i class="bi bi-broadcast text-cyan-400 text-3xl"></i>
            </div>
            <div>
                <h3 class="text-xs font-black text-cyan-400 uppercase tracking-[0.4em] mb-2 italic">Priority Transmission from ${from}</h3>
                <p class="text-white text-lg font-bold leading-relaxed">${message}</p>
            </div>
            <button class="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95">Acknowledge</button>
        </div>
    `;
    document.body.appendChild(popup);
    popup.querySelector('button').onclick = () => {
        popup.classList.add('animate-out', 'fade-out', 'zoom-out-95');
        setTimeout(() => popup.remove(), 300);
    };
}

function initMonitoring() {
    const list = document.getElementById('live-monitor-grid');
    const countEl = document.getElementById('active-users-count');
    
    if (!list) return;

    if (unsubscribeSessions) unsubscribeSessions();

    const q = query(collection(db, 'sessions'), orderBy('lastSeen', 'desc'), limit(40));
    unsubscribeSessions = onSnapshot(q, (snapshot) => {
        list.innerHTML = '';
        const currentUid = auth.currentUser ? auth.currentUser.uid : localStorage.getItem('vp_anon_id');
        let onlineCount = 0;
        const now = Date.now();
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const lastSeen = data.lastSeen?.toMillis ? data.lastSeen.toMillis() : now;
            const isOnline = (now - lastSeen) < 90000; // 90 second cutoff
            const isSelf = data.uid === currentUid;
            
            if ((now - lastSeen) > 3600000) return; // Hide sessions older than 1 hour
            if (isOnline) onlineCount++;

            const statusColor = isOnline ? 'bg-cyan-500' : 'bg-zinc-700';
            const statusText = isOnline ? 'Uplink Active' : 'Signal Lost';

            const card = document.createElement('div');
            card.className = `group relative flex flex-col bg-zinc-950 border rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] ${isSelf ? 'border-cyan-500/40 shadow-[0_0_40px_-10px_rgba(34,211,238,0.2)]' : 'border-white/5 hover:border-white/20'}`;
            
            card.innerHTML = `
                <!-- Header -->
                <div class="p-6 flex items-center justify-between bg-zinc-900/30">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-cyan-400 transition-colors">
                            <i class="bi ${isSelf ? 'bi-shield-lock-fill' : 'bi-person-fill'} text-xl"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-sm font-black text-white uppercase italic tracking-tighter truncate">${data.username || 'Unknown Citizen'} ${isSelf ? '<span class="text-xs text-cyan-500"> (HOST)</span>' : ''}</h4>
                            <p class="text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate opacity-60">${data.email || 'Handshake Protocol Active'}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        ${!isSelf ? `
                            <button onclick="sendGlobalMessage('${data.uid}')" class="w-9 h-9 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-black flex items-center justify-center transition-all"><i class="bi bi-chat-dots"></i></button>
                            <button onclick="blockUser('${data.uid}')" class="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all"><i class="bi bi-slash-circle"></i></button>
                        ` : ''}
                    </div>
                </div>

                <!-- Preview Area -->
                <div class="relative aspect-video bg-zinc-900 overflow-hidden group/screen cursor-zoom-in p-2" onclick="viewUserScreen('${data.uid}')">
                    <div class="absolute inset-0 border-[10px] border-zinc-900 z-10 pointer-events-none"></div>
                    ${data.screenPreview ? 
                        `<img src="${data.screenPreview}" class="w-full h-full object-contain bg-black transition-all duration-700 group-hover:scale-105" style="object-position: top;">` : 
                        `<div class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center text-zinc-800">
                            ${data.activeGameThumb ? `<img src="${data.activeGameThumb}" class="absolute inset-0 w-full h-full object-cover opacity-10 blur-2xl">` : ''}
                            <div class="relative z-10 w-12 h-12 border-2 border-cyan-500/10 border-t-cyan-500/60 rounded-full animate-spin mb-4"></div>
                            <p class="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/40">${data.debugStatus || 'Awaiting Uplink'}</p>
                            ${data.activeGameTitle ? `<p class="relative z-10 text-[7px] text-zinc-700 font-mono mt-2 uppercase tracking-widest">Target is in: ${data.activeGameTitle}</p>` : ''}
                        </div>`
                    }
                    
                    <!-- Overlay Grid -->
                    <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    
                    <!-- Badge Overlays -->
                    <div class="absolute top-4 left-4 flex flex-col gap-2">
                        ${data.isPlaying ? `
                            <div class="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full scale-90 origin-left">
                                <div class="w-1 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                                <span class="text-[8px] font-black text-white uppercase tracking-widest">${data.activeGameTitle}</span>
                            </div>
                        ` : `
                            <div class="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full scale-90 origin-left">
                                <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
                                <span class="text-[8px] font-black text-white uppercase tracking-widest italic">Shell Browser</span>
                            </div>
                        `}
                    </div>

                    <div class="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 scale-90 origin-right">
                        <div class="w-1.5 h-1.5 rounded-full ${statusColor} ${isOnline ? 'animate-pulse' : ''}"></div>
                        <span class="text-[7px] font-black text-white uppercase tracking-widest">${statusText}</span>
                    </div>

                    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
                        <div class="flex items-end justify-between">
                            <div class="flex flex-col">
                                <span class="text-[7px] font-mono text-zinc-500 uppercase tracking-widest opacity-60">Handshake: ${data.uid.slice(0,8).toUpperCase()}</span>
                                <span class="text-[8px] font-black text-cyan-400 uppercase tracking-widest mt-0.5">${data.viewport ? `${data.viewport.width}x${data.viewport.height} RES` : 'AUTO_RES'}</span>
                            </div>
                            <div class="text-right">
                                <p class="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">${isOnline ? 'Latency: 24ms' : 'Last Relay: ' + new Date(lastSeen).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inspect Button -->
                <button onclick="viewUserScreen('${data.uid}')" class="m-6 mt-4 py-4 bg-zinc-900 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                    <i class="bi bi-eye-fill transition-transform group-hover/btn:scale-125"></i>
                    <span>Inspect Node Viewport</span>
                </button>
            `;
            list.appendChild(card);
        });

        if (countEl) {
            countEl.innerHTML = `<span class="text-cyan-400">${onlineCount}</span> Nodes Active`;
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sessions');
    });
}

let activeInspectionUid = null;
let inspectionZoom = 1;
let unsubscribeInspection = null;

window.viewUserScreen = (uid) => {
    const overlay = document.getElementById('inspection-overlay');
    const img = document.getElementById('inspect-img');
    const nameEl = document.getElementById('inspect-name');
    if (!overlay || !img) return;

    if (unsubscribeInspection) unsubscribeInspection();
    activeInspectionUid = uid;

    unsubscribeInspection = onSnapshot(doc(db, 'sessions', uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            nameEl.innerText = `VIEWING: ${data.username.toUpperCase()}`;
            if (data.screenPreview) {
                img.src = data.screenPreview;
            }
        }
    });

    window.resetInspectZoom();
};

window.zoomInspect = (delta) => {
    const img = document.getElementById('inspect-img');
    inspectionZoom = Math.max(0.5, Math.min(3, inspectionZoom + delta));
    img.style.transform = `scale(${inspectionZoom})`;
};

window.resetInspectZoom = () => {
    const img = document.getElementById('inspect-img');
    inspectionZoom = 1;
    img.style.transform = `scale(1)`;
};

window.terminateInspectedUser = () => {
    if (activeInspectionUid && confirm("CONFIRM TERMINATION?")) {
        window.blockUser(activeInspectionUid);
        document.getElementById('close-inspection').click();
    }
};

window.sendGlobalMessage = async (uid) => {
    const msg = prompt("ENTER MESSAGE FOR USER:");
    if (!msg) return;
    try {
        await addDoc(collection(db, 'notifications'), {
            targetUid: uid,
            message: msg,
            from: "CEO MASTER CONTROL",
            timestamp: serverTimestamp()
        });
        alert("MESSAGE SENT TO UPLINK.");
    } catch (e) {
        alert("FAILED: " + e.message);
    }
};

window.blockUser = async (uid) => {
    if (confirm("PROTOCOL: PERMANENTLY BLOCK USER ACCESS?")) {
        try {
            await setDoc(doc(db, 'banned_clients', uid), {
                uid: uid,
                bannedAt: serverTimestamp(),
                reason: "CEO DISCRETION"
            });
            alert("USER TERMINATED.");
        } catch (e) {
            alert("FAILED: " + e.message);
        }
    }
};

function toggleCleanUI() {
    document.body.classList.toggle('clean-ui-active');
    const isActive = document.body.classList.contains('clean-ui-active');
    localStorage.setItem('vp_clean_ui', isActive);
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
    
    // Check if user is blocked
    checkBlockedStatus();
    
    applyTheme();
    saveUserData();
    startSessionHeartbeat();
    listenForNotifications();

    const storedRole = localStorage.getItem('vp_chat_role');
    if (storedRole === 'ceo') {
        initMonitoring();
    }

    const toggleCleanUiBtn = document.getElementById('toggle-clean-ui');
    if (toggleCleanUiBtn) {
        toggleCleanUiBtn.onclick = toggleCleanUI;
        if (localStorage.getItem('vp_clean_ui') === 'true') {
            document.body.classList.add('clean-ui-active');
        }
    }
    
    // Initialize UI Selectors
    const monitoringModal = document.getElementById('monitoring-modal');
    const closeMonitoring = document.getElementById('close-monitoring');
    const monitorBtn = document.getElementById('monitor-feature-btn');
    const refreshMonitor = document.getElementById('refresh-monitor');

    if (monitorBtn) {
        monitorBtn.onclick = () => {
            monitoringModal.classList.remove('hidden');
            setTimeout(() => {
                monitoringModal.classList.remove('opacity-0');
                monitoringModal.firstElementChild.classList.remove('scale-95');
                monitoringModal.firstElementChild.classList.add('scale-100');
            }, 10);
            initMonitoring();
        };
    }

    if (closeMonitoring) {
        closeMonitoring.onclick = () => {
            monitoringModal.classList.add('opacity-0');
            monitoringModal.firstElementChild.classList.add('scale-95');
            monitoringModal.firstElementChild.classList.remove('scale-100');
            setTimeout(() => monitoringModal.classList.add('hidden'), 500);
        };
    }

    if (refreshMonitor) {
        refreshMonitor.onclick = () => {
            initMonitoring();
        };
    }

    const closeInspection = document.getElementById('close-inspection');
    if (closeInspection) {
        closeInspection.onclick = () => {
            const overlay = document.getElementById('inspection-overlay');
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 500);
            activeInspectionUid = null;
            if (unsubscribeInspection) {
                unsubscribeInspection();
                unsubscribeInspection = null;
            }
        };
    }

    if (storedRole === 'ceo' && monitorBtn) {
        monitorBtn.classList.remove('hidden');
    }

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
    updateSiteBtn = document.getElementById('updates-btn');
    const feedbackBtn = document.getElementById('feedback-btn');
    const requestBtn = document.getElementById('request-btn'); // If exists
    const musicFeatureBtn = document.getElementById('music-feature-btn');
    const panicBtn = document.getElementById('panic-mode-btn');
    const audioPanel = document.getElementById('audio-panel');
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
    const rewindBtn = document.getElementById('rewind-track');
    const fastForwardBtn = document.getElementById('fast-forward-track');
    const connectAudioBtn = document.getElementById('connect-audio-btn');
    const audioOverlay = document.getElementById('audio-overlay');
    const audioToggle = document.getElementById('audio-toggle');
    const audioToggleIcon = document.getElementById('audio-toggle-icon');

    // Feature Buttons Initialization
    if (updateSiteBtn) updateSiteBtn.onclick = openUpdateModal;
    if (feedbackBtn) {
        feedbackBtn.onclick = () => {
            window.location.href = "mailto:jackcampell608@gmail.com?subject=VaultPortal Feedback";
        };
    }
    if (panicBtn) panicBtn.onclick = toggleAcademicMode;

    if (musicFeatureBtn && audioPanel) {
        musicFeatureBtn.onclick = () => {
            audioPanel.classList.remove('hidden');
            audioPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            audioPanel.classList.add('ring-2', 'ring-cyan-500/50');
            setTimeout(() => audioPanel.classList.remove('ring-2', 'ring-cyan-500/50'), 2000);
        };
    }

    if (connectAudioBtn && audioOverlay) {
        connectAudioBtn.onmousedown = (e) => {
            e.preventDefault();
            audioOverlay.style.opacity = '0';
            setTimeout(() => {
                audioOverlay.style.display = 'none';
                updateMusicPlayer();
                isMusicPlaying = true;
                if (audioToggleIcon) audioToggleIcon.className = 'bi bi-pause-fill text-2xl';
            }, 700);
        };
    }

    if (audioToggle) {
        audioToggle.onclick = () => {
            isMusicPlaying = !isMusicPlaying;
            if (audioToggleIcon) {
                audioToggleIcon.className = isMusicPlaying ? 'bi bi-pause-fill text-2xl' : 'bi bi-play-fill text-2xl';
            }
            
            if (isMusicPlaying) {
                sendAudioCommand('playVideo');
            } else {
                sendAudioCommand('pauseVideo');
            }
        };
    }

    if (prevTrackBtn) {
        prevTrackBtn.onclick = () => {
            currentMusicIndex = (currentMusicIndex - 1 + MENU_MUSIC.length) % MENU_MUSIC.length;
            updateMusicPlayer();
            isMusicPlaying = true;
            currentSeekPosition = 0;
            if (audioToggleIcon) audioToggleIcon.className = 'bi bi-pause-fill text-2xl';
        };
    }
    
    if (nextTrackBtn) {
        nextTrackBtn.onclick = () => {
            currentMusicIndex = (currentMusicIndex + 1) % MENU_MUSIC.length;
            updateMusicPlayer();
            isMusicPlaying = true;
            currentSeekPosition = 0;
            if (audioToggleIcon) audioToggleIcon.className = 'bi bi-pause-fill text-2xl';
        };
    }

    if (rewindBtn) {
        rewindBtn.onclick = () => {
            currentSeekPosition = Math.max(0, currentSeekPosition - 10);
            sendAudioCommand('seekTo', [currentSeekPosition, true]);
            updateProgressBarVisual(currentSeekPosition / 210);
        };
    }

    if (fastForwardBtn) {
        fastForwardBtn.onclick = () => {
            currentSeekPosition = Math.min(210, currentSeekPosition + 10);
            sendAudioCommand('seekTo', [currentSeekPosition, true]);
            updateProgressBarVisual(currentSeekPosition / 210);
        };
    }

    function updateProgressBarVisual(percentage) {
        const progressBar = document.getElementById('audio-progress');
        const timeLabel = document.getElementById('audio-time-label');
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = (percentage * 100) + '%';
            
            const currentSecs = Math.floor(percentage * 210);
            const mins = Math.floor(currentSecs / 60);
            const secs = currentSecs % 60;
            if (timeLabel) timeLabel.textContent = `${mins}:${secs.toString().padStart(2, '0')} / 3:30`;

            setTimeout(() => {
                const remainingMs = Math.floor((1 - percentage) * 210000);
                progressBar.style.transition = `width ${remainingMs}ms linear`;
                progressBar.style.width = '100%';
            }, 50);
        }
    }

    const progressContainer = document.getElementById('audio-progress-container');
    if (progressContainer) {
        progressContainer.onclick = (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            currentSeekPosition = Math.floor(percentage * 210); 
            sendAudioCommand('seekTo', [currentSeekPosition, true]);
            updateProgressBarVisual(percentage);
        };
    }
    
    // Initial load - sync once connected
    if (!connectAudioBtn) {
        updateMusicPlayer();
    }
    
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
            const isBKirk = code === '0126';
            const isChambo = code === '2468';
            const isUpTheBlues = code === '4242' || upperCode === 'UP THE BLUES';
            
            if (isCeo || isSupplier || isOgDev || isExeDev || isMarlon || isDeveloper || isByrnesey || isBKirk || isChambo || isUpTheBlues) {
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
                } else if (isBKirk) {
                    role = 'junior_dev';
                    name = 'B. KIRK';
                    rank = '3';
                } else if (isChambo) {
                    role = 'senior_dev';
                    name = 'CHAMBO';
                    rank = '2';
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
                if (isCeo) initMonitoring();

                // Differentiate UI in the panel if needed
                const clearLogsBtn = document.getElementById('clear-logs-btn');
                const unrevokeAllBtn = document.getElementById('unrevoke-all-btn');
                const manualRevokeArea = document.getElementById('manual-revoke-btn')?.parentElement;

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
                if (manualRevokeArea) {
                    if (isCeo) {
                        manualRevokeArea.classList.remove('hidden');
                    } else {
                        manualRevokeArea.classList.add('hidden');
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
        safeCall(initNewsRelay, "NewsRelay");
        
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
    const isBKirk = code === '0126';
    const isChambo = code === '2468';
    const isUpTheBlues = code === '4242' || code.toUpperCase() === 'UP THE BLUES';

    if (code.toUpperCase() === 'JOHNPORK') {
        if (terminalStatusLog) terminalStatusLog.textContent = 'LOCATING SUBJECT... JOHN PORK IS WATCHING';
        setTimeout(() => {
            triggerJohnPorkScare("TERMINAL_UPLINK");
            closeDevTerminal();
        }, 1000);
        return;
    }

    if (isCeo || isSupplier || isOgDev || isExeDev || isMarlon || isDeveloper || isByrnesey || isBKirk || isChambo || isUpTheBlues) {
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
            } else if (isBKirk) {
                role = 'junior_dev';
                name = 'B. KIRK';
                rank = '3';
            } else if (isChambo) {
                role = 'senior_dev';
                name = 'CHAMBO';
                rank = '2';
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
            if (isCeo || isDeveloper || isExeDev || isOgDev || isSupplier || isByrnesey || isBKirk || isChambo || isUpTheBlues) {
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

function toggleAcademicMode() {
    const overlay = document.getElementById('academic-overlay');
    if (!overlay) return;
    
    const isHidden = overlay.classList.contains('hidden');
    if (isHidden) {
        overlay.classList.remove('hidden');
        document.title = "Year 7 Mathematics - Chapter 4 Review Packet";
        document.body.style.overflow = 'hidden';
        
        // PAUSE MUSIC for safety
        if (isMusicPlaying) {
            sendAudioCommand('pauseVideo');
            const audioToggleIcon = document.getElementById('audio-toggle-icon');
            if (audioToggleIcon) audioToggleIcon.className = 'bi bi-play-fill text-2xl';
            isMusicPlaying = false;
        }
    } else {
        overlay.classList.add('hidden');
        const cloakedTitle = localStorage.getItem('vp_cloaked_title');
        document.title = cloakedTitle || ORIGINAL_TITLE;
        if (!playerOverlay || playerOverlay.classList.contains('hidden')) {
            document.body.style.overflow = '';
        }
    }
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

    const role = localStorage.getItem('vp_chat_role') || 'guest';
    // Removed restriction to allow everyone with codes to enter logs
    
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
        const rank = localStorage.getItem('vp_chat_rank') || (role === 'ceo' ? 'RANK OWNER (JOHN PORK IS WATCHING)' : (['developer', 'dev', 'junior_dev'].includes(role) ? '3' : (['supplier', 'og_dev', 'exe_dev'].includes(role) ? '1' : '2')));
        let name = storedName || 'Guest';
        
        if (!storedName || (storedName === 'STAFF' && role !== 'guest_staff')) {
            if (role === 'ceo') name = 'CEO';
            else if (role === 'supplier') name = 'FAT GAME SUPPLIER';
            else if (role === 'og_dev') name = 'OG DEV';
            else if (role === 'exe_dev') name = 'EXECUTIVE DEV';
            else if (role === 'developer' || role === 'dev') name = 'DEVELOPER';
            else if (role === 'junior_dev') name = 'B. KIRK';
            else if (role === 'senior_dev') name = 'CHAMBO';
            else if (role === 'mod') {
                if (storedPasscode === '7771') name = 'BYRNESEY';
                else if (storedPasscode && (storedPasscode === '4242' || storedPasscode.toUpperCase() === 'UP THE BLUES')) name = 'UP THE BLUES STAFF';
                else if (storedPasscode === '2468') name = 'CHAMBO';
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

    // Academic Mode Toggle
    const academicOverlay = document.getElementById('academic-overlay');
    if (academicOverlay) {
        academicOverlay.onclick = (e) => {
            // Only toggle if clicking the main container or if they triple click
            // to prevent accidental closing while reading
            if (e.detail >= 3 || e.target === academicOverlay) {
                toggleAcademicMode();
            }
        };
    }

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
        if (code === '0304' || code === '9871' || code === '3421' || code === '0007' || code === '8765' || code === '0981' || code === '7771' || code === '0126' || code === '2468' || code === '4242' || uc === 'UP THE BLUES') {
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
        if (e.ctrlKey && e.key === 'q') {
            e.preventDefault();
            toggleAcademicMode();
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
        const isCeoEmail = user && (user.email === "jackcampell608@gmail.com" || user.email === "mandyfmcgregor@gmail.com");
        
        if (isCeoEmail) {
            const currentRole = localStorage.getItem('vp_chat_role');
            const name = user.email === "jackcampell608@gmail.com" ? "JACK CAMPELL" : "MANDY MCGREGOR";
            localStorage.setItem('vp_chat_role', 'ceo');
            localStorage.setItem('vp_chat_authorized', 'true');
            localStorage.setItem('vp_chat_name', name);
            
            const featureBtn = document.getElementById('monitor-feature-btn');
            if (featureBtn) featureBtn.classList.remove('hidden');
            
            const masterBtn = document.getElementById('master-control-btn');
            if (masterBtn) masterBtn.classList.remove('hidden');

            const logoutBtn = document.getElementById('terminal-logout-btn');
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            if (currentRole !== 'ceo') {
                console.log("Verified CEO Identity detected. Promoting to CEO status...");
                if (typeof initMonitoring === 'function') initMonitoring();
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

const CATEGORY_META = {
    'All': { icon: 'bi-grid-fill', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    'Trending Games': { icon: 'bi-fire', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    'Favorites ⭐': { icon: 'bi-star-fill', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    'Action': { icon: 'bi-lightning-fill', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    'Driving': { icon: 'bi-car-front-fill', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'Racing': { icon: 'bi-flag-fill', color: 'text-blue-500', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
    'Sports': { icon: 'bi-trophy-fill', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'Skill': { icon: 'bi-mortarboard-fill', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    'Simulation': { icon: 'bi-cpu-fill', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    'Arcade': { icon: 'bi-joystick', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    'Strategy': { icon: 'bi-chess-board', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'Multiplayer': { icon: 'bi-people-fill', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    'Utility': { icon: 'bi-tools', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    'Fun': { icon: 'bi-emoji-smile-fill', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    'Retro': { icon: 'bi-cassette-fill', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    '2 Player': { icon: 'bi-person-vcard-fill', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' }
};

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
    if (activeHeader) {
        if (currentCategory === 'All') {
            activeHeader.innerHTML = 'Central <span class="text-cyan-400">Archive</span>';
        } else if (currentCategory === 'Favorites ⭐') {
            activeHeader.innerHTML = 'Secure <span class="text-yellow-400">Bookmarks</span>';
        } else {
             activeHeader.innerHTML = `${currentCategory} <span class="text-cyan-400">Archive</span>`;
        }
    }

    categoriesList.forEach(category => {
        const meta = CATEGORY_META[category] || { icon: 'bi-tag-fill', color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-white/5' };
        const isActive = currentCategory === category;
        
        const count = category === 'All' 
            ? entries.length 
            : category === 'Favorites ⭐' 
                ? userData.favorites.length 
                : entries.filter(e => (e.categories || []).includes(category)).length;

        const btn = document.createElement('button');
        btn.className = `flex-shrink-0 lg:w-full flex items-center gap-4 px-6 lg:px-5 py-4 rounded-[1.8rem] transition-all duration-500 text-left group relative overflow-hidden ${
            isActive 
            ? `${meta.bg} ${meta.border} border shadow-[0_0_30px_-5px_rgba(34,211,238,0.2)]` 
            : 'bg-transparent text-zinc-500 border border-transparent hover:bg-white/5 hover:text-zinc-300'
        }`;
        
        btn.innerHTML = `
            <div class="relative z-10 p-2.5 rounded-2xl ${isActive ? `${meta.bg} ${meta.color} border ${meta.border}` : 'bg-zinc-900 text-zinc-500'} group-hover:scale-110 transition-transform duration-500">
                <i class="bi ${meta.icon} text-lg font-bold"></i>
            </div>
            <div class="relative z-10 flex flex-col min-w-0">
                <span class="text-[10px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} truncate">${category}</span>
                <span class="text-[7px] font-mono uppercase tracking-widest text-zinc-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">${count} Node(s)</span>
            </div>
            ${isActive ? `<div class="absolute right-5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>` : ''}
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
            <div class="col-span-full py-32 text-center flex flex-col items-center">
                <div class="inline-block p-12 bg-zinc-900/20 rounded-[4rem] border border-dashed border-white/10 backdrop-blur-sm animate-pulse">
                    <div class="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5 text-zinc-800">
                        <i class="bi bi-search text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-black text-white tracking-widest uppercase italic">Decryption Failure</h3>
                    <p class="text-zinc-500 mt-4 font-mono text-[10px] max-w-xs mx-auto tracking-widest uppercase">${emptyMsg}</p>
                    <button onclick="document.getElementById('search-input').value=''; currentSearch = ''; renderItems();" class="mt-10 px-8 py-3 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] transition-all active:scale-95">Reset Uplink</button>
                </div>
            </div>`;
        return;
    }

    filtered.forEach((item, index) => {
        if (!item || !item.id) return;
        
        const isFavorited = userData.favorites.includes(item.id);
        const metrics = gameMetrics[item.id] || { likes: 0, dislikes: 0 };
        const total = metrics.likes + metrics.dislikes;
        const ratingPct = total > 0 ? Math.round((metrics.likes / total) * 100) : 0;
        
        const card = document.createElement('div');
        card.className = "group relative flex flex-col bg-zinc-950 border border-white/5 rounded-[2.8rem] overflow-hidden hover:border-cyan-500/40 transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(0,0,30,0.8)] hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 hover:z-10";
        card.style.animationDelay = `${index * 40}ms`;
        
        card.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div class="relative w-full aspect-[16/10] overflow-hidden bg-zinc-950 group/thumb cursor-pointer border-b border-white/5" onclick="const g = allEntries.find(i=>i.id==='${item.id}'); if(g) openDetails(g)">
                <img 
                    src="${item.thumbnail || FALLBACK_IMAGE}" 
                    alt="${item.title}" 
                    class="w-full h-full object-contain p-8 group-hover:p-4 transition-all duration-1000 group-hover:scale-105 group-hover:brightness-110"
                    referrerpolicy="no-referrer"
                    onerror="this.src='${FALLBACK_IMAGE}'"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-all duration-700"></div>
                
                <!-- Badge Overlays -->
                <div class="absolute top-6 left-6 flex flex-col gap-2">
                    ${item.categories.slice(0, 1).map(cat => {
                        const meta = CATEGORY_META[cat] || { bg: 'bg-black/60', color: 'text-zinc-400' };
                        return `<span class="px-3 py-1 ${meta.bg} backdrop-blur-xl border border-white/10 rounded-full text-[7px] font-black uppercase tracking-widest ${meta.color} italic">${cat}</span>`;
                    }).join('')}
                    ${total > 0 ? `
                        <div class="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10">
                            <i class="bi bi-star-fill text-[8px] text-yellow-400"></i>
                            <span class="text-[8px] font-black text-white">${ratingPct}% Accuracy</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Favorite Toggle -->
                <button onclick="event.stopPropagation(); toggleFavorite(event, '${item.id}')" class="absolute top-6 right-6 w-11 h-11 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isFavorited ? 'text-rose-500 border-rose-500/30 bg-rose-500/10' : 'text-zinc-500 hover:text-white'}">
                    <i class="bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'} text-lg"></i>
                </button>

                <!-- Play Button Center Overlay -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                    <div class="w-18 h-18 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500 backdrop-blur-xl">
                        <i class="bi bi-play-circle-fill text-white text-4xl shadow-[0_0_20px_white]"></i>
                    </div>
                </div>
            </div>

            <div class="relative p-8 flex flex-col flex-1">
                <div class="flex-1 min-w-0 mb-6">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-cyan-500/50 shadow-[0_0_5px_cyan]"></div>
                        <span class="text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-black italic">INDEX_NODE_${item.id.slice(0,3).toUpperCase()}</span>
                    </div>
                    <h3 class="text-2xl font-black text-white uppercase italic tracking-tighter truncate group-hover:text-cyan-400 transition-colors duration-500">${item.title}</h3>
                    <p class="text-zinc-500 text-[11px] leading-relaxed font-medium mt-3 line-clamp-2 italic">
                        ${item.description}
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <button onclick="const g = allEntries.find(i=>i.id==='${item.id}'); if(g) openPlayer(g)" class="flex-1 py-4.5 bg-zinc-900 hover:bg-cyan-500 text-zinc-300 hover:text-black border border-white/5 hover:border-cyan-400 rounded-[1.4rem] transition-all duration-500 text-[9px] font-black uppercase tracking-[0.4em] shadow-lg active:scale-95 flex items-center justify-center gap-3 group/btn relative overflow-hidden">
                        <span class="relative z-10">Initial Uplink</span>
                        <i class="bi bi-chevron-right text-xs group-hover/btn:translate-x-1 transition-transform relative z-10"></i>
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shine"></div>
                    </button>
                    <button onclick="const g = allEntries.find(i=>i.id==='${item.id}'); if(g) openDetails(g)" class="w-14 py-4.5 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-[1.4rem] transition-all text-zinc-500 hover:text-white flex items-center justify-center active:scale-95">
                        <i class="bi bi-grid-3x3-gap-fill"></i>
                    </button>
                </div>
            </div>
        `;
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
            // We ensure that BYRNESEY (who is a mod) and DEVELOPER roles are also revocable
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
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'game_metrics');
    });
}

function initNewsRelay() {
    const relay = document.getElementById('relay-news');
    const text = document.getElementById('news-text');
    if (!relay || !text) return;

    // Pulse sequence for the news bar
    const systems = ["Archive Uplink", "Satellite Link", "Quantum Encryption", "Pork Protection"];
    let sysIdx = 0;
    
    const updateTicker = () => {
        if (text.textContent.includes('CRITICAL BROADCAST')) return; // Don't override broadcasts
        const sys = systems[sysIdx];
        text.innerHTML = `<span class="text-cyan-400 font-black">[OK]</span> ${sys.toUpperCase()} STATUS: <span class="text-white">SYNCHRONIZED</span> // <span class="text-cyan-400 font-black">[OK]</span> LATENCY: <span class="text-white">${(Math.random() * 20 + 5).toFixed(1)}MS</span> // MONITORING IN PROGRESS...`;
        sysIdx = (sysIdx + 1) % systems.length;
    };
    setInterval(updateTicker, 8000);

    // Show after initial sequence
    setTimeout(() => {
        relay.classList.remove('translate-y-full');
    }, 5000);

    // Listen for global messages to update marquee
    const q = query(collection(db, 'global_messages'), orderBy('createdAt', 'desc'), limit(1));
    onSnapshot(q, (snap) => {
        if (!snap.empty) {
            const data = snap.docs[0].data();
            text.innerHTML = `<span class="bg-rose-500 text-black px-2 py-0.5 rounded mr-3 animate-pulse">CRITICAL BROADCAST</span> <span class="text-rose-100 font-bold">${data.text.toUpperCase()}</span> // <span class="text-rose-400">AUTHORITY: ${data.from || 'SYSTEM'}</span> // UPLINK SECURE`;
            relay.classList.add('bg-rose-950/90', 'border-rose-500/30');
            setTimeout(() => {
                relay.classList.remove('bg-rose-950/90', 'border-rose-500/30');
                updateTicker();
            }, 10000);
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'global_messages');
    });
}
window.initNewsRelay = initNewsRelay;


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
    
    const launchBtn = document.getElementById('launch-from-details');
    if (launchBtn) {
        launchBtn.onclick = () => {
            closeDetails();
            handleGameRelay(item);
        };
    }

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
