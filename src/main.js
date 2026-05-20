// main.js - Vanilla JS Logic for MediaVault
let allEntries = [];
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

async function init() {
    try {
        console.log('Fetching entries.json...');
        // Try fetching from root first
        let response = await fetch('./entries.json');
        
        // If that fails, try public folder (common for raw repository hosting)
        if (!response.ok) {
            console.log('Root entries.json not found, trying public/entries.json...');
            response = await fetch('./public/entries.json');
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allEntries = await response.json();
        console.log('Entries loaded:', allEntries);
        renderCategories();
        renderItems();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to load entries:', error);
        itemsGrid.innerHTML = `<div class="col-span-full py-20 text-center text-zinc-500">Error loading content (entries.json). Please verify the file exists in the correct location.</div>`;
    }
}

function renderCategories() {
    const categories = ['All', ...new Set(allEntries.map(e => e.category))];
    
    // Clear existing buttons (except the label)
    const label = categoriesNav.querySelector('div');
    categoriesNav.innerHTML = '';
    categoriesNav.appendChild(label);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold transition-all border ${
            currentCategory === category 
            ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' 
            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
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
        const matchesCategory = currentCategory === 'All' || item.category === currentCategory;
        const matchesSearch = item.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                             item.description.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        itemsGrid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="inline-block p-6 bg-zinc-900 rounded-3xl border border-dashed border-zinc-700">
                    <svg class="w-12 h-12 text-zinc-700 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <h3 class="text-xl font-bold text-zinc-300">No content found</h3>
                    <p class="text-zinc-500 mt-2">Try a different search term or category.</p>
                </div>
            </div>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = "group relative bg-zinc-900 rounded-xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-cyan-500/50 transition-all shadow-xl hover:-translate-y-1";
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden">
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div class="bg-cyan-500 p-3 rounded-full shadow-lg shadow-cyan-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-mono text-cyan-400 px-2 py-1 bg-cyan-400/10 rounded uppercase tracking-wider">${item.category}</span>
                </div>
                <h3 class="text-zinc-100 font-bold text-lg group-hover:text-cyan-400 transition-colors">${item.title}</h3>
                <p class="text-zinc-400 text-sm line-clamp-2 mt-1">${item.description}</p>
            </div>
        `;
        card.onclick = () => openPlayer(item);
        itemsGrid.appendChild(card);
    });
}

function openPlayer(item) {
    playerTitle.textContent = item.title;
    playerCategory.textContent = item.category;
    gameIframe.src = item.iframeUrl;
    playerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePlayer() {
    playerOverlay.classList.add('hidden');
    gameIframe.src = '';
    document.body.style.overflow = '';
}

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderItems();
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

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePlayer();
    });
}

init();
