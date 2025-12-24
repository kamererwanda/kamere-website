/**
 * KAMERE x ZAGADYEB - Master Script (Full Version - All Original Logic Preserved)
 */

// Initialize AOS Animations
AOS.init({
    duration: 1000,
    once: true
});

// 1. THEME MANAGEMENT
function applyTheme() {
    const savedTheme = localStorage.getItem('kamere-theme') || 'light';
    const isDark = savedTheme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerText = isDark ? "☀️ LIGHT MODE" : "🌙 DARK MODE";
}

function handleThemeToggle() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('kamere-theme', isDark ? 'dark' : 'light');
    applyTheme();
}

// 2. STATS COUNTER LOGIC
const runCounter = (el) => {
    const target = +el.getAttribute('data-target');
    let count = +el.innerText;
    const increment = target > 20 ? Math.ceil(target / 100) : 1;

    if (count < target) {
        count += increment;
        el.innerText = count > target ? target : count;
        const delay = target < 20 ? 100 : 30; 
        setTimeout(() => runCounter(el), delay);
    } else {
        el.innerText = target;
    }
};

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const allCounters = entry.target.querySelectorAll('.counter');
                allCounters.forEach(counter => {
                    counter.innerText = "0";
                    runCounter(counter);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
}

// 3. VIDEO MODAL LOGIC
function openVideo(videoId, title = "") {
    const modal = document.getElementById('videoModal');
    const modalContent = document.getElementById('modal-content-container');
    const player = document.getElementById('modalPlayer');
    const redirect = document.getElementById('youtubeRedirect');
    
    if (!modal || !player) return;

    const isPortrait = title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('short');
    if (isPortrait) modalContent.classList.add('portrait');
    else modalContent.classList.remove('portrait');

    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&color=white`;
    if (redirect) redirect.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('modalPlayer');
    if (player) player.src = ""; 
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
}

// 4. YOUTUBE API FETCHING
async function fetchVideos() {
    const videoContainer = document.getElementById('video-feed');
    const watchFeatureBtn = document.querySelector('.featured-cinema .btn');
    if (!videoContainer) return;

    const API_KEY = 'AIzaSyBb66pJ6Gk3xcAMTgkgxH8kPW9Xcw90n_0'; 
    const CHANNEL_ID = 'UCKPS6bbaQnlqOJrWKKq14tw';
    const URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;

    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const latestVideoId = data.items[0].id.videoId;
            const latestTitle = data.items[0].snippet.title;
            
            if (watchFeatureBtn) {
                watchFeatureBtn.onclick = () => openVideo(latestVideoId, latestTitle);
            }

            videoContainer.innerHTML = ''; 
            data.items.forEach(item => {
                const vId = item.id.videoId;
                const title = item.snippet.title;
                const thumb = item.snippet.thumbnails.high.url;
                
                const videoCard = document.createElement('div');
                videoCard.className = 'card';
                videoCard.setAttribute('data-aos', 'fade-up');
                videoCard.onclick = () => openVideo(vId, title);
                videoCard.innerHTML = `
                    <div class="video-thumbnail-container">
                        <img src="${thumb}">
                        <div class="custom-play-btn"></div>
                    </div>
                    <h4 style="margin-top:20px; font-size: 0.85rem; color: var(--accent);">${title}</h4>
                `;
                videoContainer.appendChild(videoCard);
            });
        }
    } catch (err) { console.error("YouTube Fetch Error:", err); }
}

// 5. INITIALIZATION & NAV ACTIONS (PRESERVING ALL YOUR LOGIC)
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', handleThemeToggle);

    // HAMBURGER NAV LOGIC
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    if (document.getElementById('video-feed')) fetchVideos();

    // PRELOADER & PAGE TRANSITIONS (THE SHINE LOGIC)
    const loader = document.getElementById('preloader');
    if (loader) {
        setTimeout(() => loader.classList.add('active'), 200);
        setTimeout(() => loader.classList.add('fade-out'), 2500);
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('preloader-hidden'), 1500);
        });
    }

    // INTERNAL LINK TRANSITION LOGIC
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && href.includes('.html')) {
                e.preventDefault();
                if (loader) {
                    loader.classList.remove('fade-out', 'active', 'preloader-hidden');
                    setTimeout(() => { window.location.href = href; }, 800);
                } else {
                    window.location.href = href;
                }
            }
        });
    });
});

// 6. FILTER & SEARCH LOGIC
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelector('.filter-btn.active').classList.remove('active');
        this.classList.add('active');
        const filterValue = this.getAttribute('data-filter');
        const videos = document.querySelectorAll('#video-feed .card');
        videos.forEach(video => {
            if (filterValue === 'all' || video.innerText.toLowerCase().includes(filterValue)) {
                video.style.display = 'block';
            } else {
                video.style.display = 'none';
            }
        });
    });
});

const searchInput = document.getElementById('videoSearch');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#video-feed .card').forEach(card => {
            const title = card.querySelector('h4').innerText.toLowerCase();
            card.style.display = title.includes(term) ? 'block' : 'none';
        });
    });
}

// 7. AI POP-UP & PROXY LOGIC (FIXED FOR VERCEL)
function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    const navLinks = document.getElementById('nav-links'); 
    const hamburger = document.getElementById('hamburger');
    const inputField = document.getElementById('user-query');

    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    }

    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        chatWindow.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if(inputField) setTimeout(() => inputField.focus(), 300);
    }
}

async function sendToAI() {
    const input = document.getElementById('user-query');
    const chatBody = document.getElementById('chat-messages');
    if (!input || !chatBody) return;
    const query = input.value.trim();
    if (!query) return;

    chatBody.innerHTML += `<div class="message user-msg">${query}</div>`;
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    const loadingId = "loading-" + Date.now();
    chatBody.innerHTML += `<div class="message ai-msg" id="${loadingId}">Kamere is thinking...</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch('/api/kamere-ai', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query }) 
        });
        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();
        chatBody.innerHTML += `<div class="message ai-msg">${data.reply || "Kamere is silent."}</div>`;
    } catch (error) {
        document.getElementById(loadingId).innerText = "Kamere is resting. Check connection.";
    }
    chatBody.scrollTop = chatBody.scrollHeight;
}

// 8. FINAL UI HELPERS (SMOOTH SCROLL & OUTSIDE CLICK)
const filterContainer = document.querySelector('.filter-container');
if (filterContainer) {
    filterContainer.addEventListener('wheel', (evt) => {
        if (window.innerWidth < 768) {
            evt.preventDefault();
            filterContainer.scrollLeft += evt.deltaY;
        }
    });
}

window.onclick = (e) => {
    const videoModal = document.getElementById('videoModal');
    const chatWindow = document.getElementById('ai-chat-window');
    const aiTrigger = document.querySelector('.ai-trigger');
    if (e.target === videoModal) closeVideo();
    if (chatWindow && chatWindow.style.display === 'flex' && 
        !chatWindow.contains(e.target) && aiTrigger && !aiTrigger.contains(e.target)) {
        toggleAIChat();
    }
};

// --- Swiper Testimonial Initialization ---
const testimonialSwiper = new Swiper(".testimonialSwiper", {
    slidesPerView: 1,       // Show one testimonial at a time
    spaceBetween: 30,      // Space between slides
    loop: true,            // Infinite loop
    autoplay: {
        delay: 5000,       // Slide every 5 seconds
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        // When the screen is 768px or wider (Tablets/Laptops)
        768: {
            slidesPerView: 2,
        },
        // When the screen is 1024px or wider (Desktops)
        1024: {
            slidesPerView: 3,
        }
    }
});
