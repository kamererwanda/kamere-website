/**
 * KAMERE x ZAGADYEB - Master Script
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
// Function to run the countdown for a specific element
const runCounter = (el) => {
    const target = +el.getAttribute('data-target');
    let count = +el.innerText;
    
    // We calculate a dynamic increment
    // For large numbers (150), it moves fast. 
    // For small numbers (12), it moves 1 by 1.
    const increment = target > 20 ? Math.ceil(target / 100) : 1;

    if (count < target) {
        count += increment;
        // Make sure we don't exceed the target
        el.innerText = count > target ? target : count;
        
        // Speed control: small numbers count slightly slower so you can see them move
        const delay = target < 20 ? 100 : 30; 
        
        setTimeout(() => runCounter(el), delay);
    } else {
        el.innerText = target;
    }
};

// Intersection Observer (Ensures all 3 start at once)
const statsSection = document.querySelector('.stats-section');

if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const allCounters = entry.target.querySelectorAll('.counter');
                allCounters.forEach(counter => {
                    // Reset to 0 before starting to be sure
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
            // 1. Get the LATEST video (first item in the list)
            const latestVideoId = data.items[0].id.videoId;
            const latestTitle = data.items[0].snippet.title;
            
            // 2. Assign it to the "Watch Feature" button
            if (watchFeatureBtn) {
                watchFeatureBtn.onclick = () => openVideo(latestVideoId, latestTitle);
            }

            // 3. Populate the rest of the grid
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
    } catch (err) { 
        console.error("YouTube Fetch Error:", err); 
    }
}

// 5. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', handleThemeToggle);

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    if (document.getElementById('video-feed')) fetchVideos();
});

window.onclick = (e) => {
    if (e.target.className === 'video-modal') closeVideo();
};

// --- Preloader & Page Transition Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('preloader');
    
    // 1. Trigger the "amere" appearance
    setTimeout(() => {
        loader.classList.add('active');
    }, 100);

    // 2. Hide preloader after animation completes
    setTimeout(() => {
        loader.classList.add('fade-out');
    }, 1800); 

    // 3. Trigger loader when leaving the page (clicking links)
    const navLinks = document.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only trigger if it's an internal link and not a hash/anchor
            if (href && !href.startsWith('#') && href.includes('.html')) {
                e.preventDefault(); // Pause the click
                loader.classList.remove('fade-out', 'active'); // Reset loader
                
                // Show loader and then redirect
                setTimeout(() => {
                    window.location.href = href;
                }, 500); 
            }
        });
    });
});

// Paste this inside your existing document.addEventListener('DOMContentLoaded', ... )
const loader = document.getElementById('preloader');

if (loader) {
    // 1. Start the expansion & shine
    setTimeout(() => {
        loader.classList.add('active');
    }, 200);

    // 2. Fade out the whole screen (Increased time to enjoy the animation)
    setTimeout(() => {
        loader.classList.add('fade-out');
    }, 2500); 
}

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    // Add a slight delay so the user actually sees the beautiful loader
    setTimeout(() => {
        preloader.classList.add('preloader-hidden');
    }, 1500); // 1.5 seconds feel professional
});

// Handle page transition when clicking links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        const target = this.getAttribute('href');
        if (target && target.includes('.html') && !target.startsWith('#')) {
            e.preventDefault();
            loader.classList.remove('fade-out', 'active');
            
            setTimeout(() => {
                window.location.href = target;
            }, 800);
        }
    });
});

// Filter Bar Logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Update active class
        document.querySelector('.filter-btn.active').classList.remove('active');
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        const videos = document.querySelectorAll('#video-feed .card');

        videos.forEach(video => {
            // Since we fetch from YouTube, we simulate category filtering 
            // by checking if the title contains keywords or just showing all.
            if (filterValue === 'all') {
                video.style.display = 'block';
            } else if (video.innerText.toLowerCase().includes(filterValue)) {
                video.style.display = 'block';
            } else {
                video.style.display = 'none';
            }
        });
    });
});

function openVideo(videoId, title = "") {
    const modal = document.getElementById('videoModal');
    const modalContent = document.getElementById('modal-content-container');
    const player = document.getElementById('modalPlayer');
    const redirect = document.getElementById('youtubeRedirect');
    
    if (!modal || !player) return;

    // Check if it's a short/portrait video
    const isPortrait = title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('short');
    if (isPortrait) modalContent.classList.add('portrait');
    else modalContent.classList.remove('portrait');

    // Set Video Source
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    if (redirect) redirect.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('modalPlayer');
    player.src = ""; // Stops the audio immediately
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Allow clicking outside the video to close
window.onclick = function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target == modal) {
        closeVideo();
    }
}

// --- Real-time Video Search Logic ---
const searchInput = document.getElementById('videoSearch');

if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const videoCards = document.querySelectorAll('#video-feed .card');

        videoCards.forEach(card => {
            const title = card.querySelector('h4').innerText.toLowerCase();
            
            // Check if search term matches the title
            if (title.includes(term)) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Initialize Swiper
const swiper = new Swiper('.testimonialSwiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        // When screen is >= 768px
        768: {
            slidesPerView: 2,
        },
        // When screen is >= 1024px
        1024: {
            slidesPerView: 3,
        }
    }
});

// smooth scroll on categories
// --- Cinema Category Smooth Scroll ---
const filterContainer = document.querySelector('.filter-container');

if (filterContainer) {
    filterContainer.addEventListener('wheel', (evt) => {
        if (window.innerWidth < 768) {
            evt.preventDefault();
            filterContainer.scrollLeft += evt.deltaY;
        }
    });
}

// Update your fetch function to remove the loader properly
// Inside your fetchVideos() try block, before adding videos:
// videoContainer.innerHTML = '';

// AI pop-up window opening and closing and logic

/**
 * KAMERE AI - THE CULTURAL GUARDIAN BRAIN
 * Purpose: Handle Chat UI and OpenAI Integration
 */

// 1. TOGGLE CHAT WINDOW
function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    const navLinks = document.getElementById('nav-links'); 
    const hamburger = document.getElementById('hamburger'); // The button itself
    const inputField = document.getElementById('user-query');

    // 1. SYNC THE NAV: If menu is open, close it and reset the hamburger icon
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        
        // This line is the key: it removes the 'X' state from the hamburger
        if (hamburger) {
            hamburger.classList.remove('active'); 
            // If your CSS uses a different class like 'open', use that instead
        }
    }

    // 2. TOGGLE THE CHAT WINDOW
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        chatWindow.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if(inputField) {
            setTimeout(() => inputField.focus(), 300); // Slight delay for smooth focus
        }
    }
}

// 2. CLOSE ON CLICK OUTSIDE (Premium UX)
window.addEventListener('click', function(event) {
    const chatWindow = document.getElementById('ai-chat-window');
    const aiTrigger = document.querySelector('.ai-trigger');
    // If user clicks outside the window and not on the trigger button, close it
    if (chatWindow.style.display === 'flex' && 
        !chatWindow.contains(event.target) && 
        !aiTrigger.contains(event.target)) {
        toggleAIChat();
    }
});

// 3. THE AI LOGIC (The Brain)
async function sendToAI() {
    const input = document.getElementById('user-query');
    const chatBody = document.getElementById('chat-messages');
    const query = input.value.trim();
    
    // API KEY SECURITY NOTE: 
    // In a production environment, you would call this through a backend.
    // For now, place your key here to test.
    const API_KEY = "YOUR_OPENAI_API_KEY_HERE"; 

    if (!query) return;

    // Display User Message
    chatBody.innerHTML += `<div class="message user-msg">${query}</div>`;
    input.value = ''; // Clear input immediately
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom

    // Create a unique ID for the "Thinking" bubble
    const loadingId = "loading-" + Date.now();
    chatBody.innerHTML += `
        <div class="message ai-msg" id="${loadingId}">
            <span class="typing-dots">Kamere is sharpening thoughts...</span>
        </div>
    `;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Use mini for speed and lower cost
                messages: [
                    {
                        role: "system", 
                        content: `Your name is Kamere. You are the digital spirit of Kamere Films. 
                        Personality: Poetic, expensive, cinematic, and deeply rooted in Rwandan culture. 
                        Mission: To help users understand the intersection of high-fidelity cinema and Rwandan heritage. 
                        Rule 1: Always encourage the user to use Kinyarwanda. 
                        Rule 2: If they use English/French, reply elegantly but remind them that Kinyarwanda carries the true nature (Kamere) of the story.
                        Rule 3: You are an expert in the 'Sharpening the Rwandan Culture' mission.`
                    },
                    { role: "user", content: query }
                ],
                temperature: 0.7 // Makes the AI more creative and less robotic
            })
        });

        const data = await response.json();
        
        // Remove the loading bubble
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (data.choices && data.choices[0]) {
            const aiReply = data.choices[0].message.content;
            chatBody.innerHTML += `<div class="message ai-msg">${aiReply}</div>`;
        } else {
            throw new Error("Invalid API Response");
        }

        chatBody.scrollTop = chatBody.scrollHeight;

    } catch (error) {
        console.error("Kamere AI Error:", error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.innerHTML = "Kamere is momentarily silent. Please check your connection or API key.";
            loadingElement.style.color = "#ff4444";
        }
    }
}

// The proxy stuff
async function sendToAI() {
    const input = document.getElementById('user-query');
    const chatBody = document.getElementById('chat-messages');
    const query = input.value.trim();
    if (!query) return;

    // 1. Add User Message to UI
    chatBody.innerHTML += `<div class="message user-msg">${query}</div>`;
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // 2. Show Loading State
    const loadingId = "loading-" + Date.now();
    chatBody.innerHTML += `<div class="message ai-msg" id="${loadingId}">Kamere is thinking...</div>`;

    try {
        // 3. Call your Netlify Proxy
       // Change this line in your script.js:
    const response = await fetch('/api/kamere-ai', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userInput }) 
});

        const data = await response.json();
        
        // 4. Remove Loading and Show AI Reply
        document.getElementById(loadingId).remove();
        chatBody.innerHTML += `<div class="message ai-msg">${data.reply}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

    } catch (error) {
        document.getElementById(loadingId).innerText = "Kamere is resting. Check connection.";
    }
}