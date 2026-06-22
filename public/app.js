gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", async () => {
    // Dismiss Preloader
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.remove('loading');
            initAnimations(); // Start animations only after load
        }, 1000);
    }, 1500);

    initCursor();
    initAudio();
    await fetchStaticData();
    await fetchGuestbookWall();
});

// Custom Cursor
function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    window.addEventListener('mousemove', (e) => {
        dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`;
        outline.style.left = `${e.clientX}px`; outline.style.top = `${e.clientY}px`;
    });
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest('button, a, input, textarea, .tilt-card, .chakra-node')) {
            document.body.classList.add('cursor-hover');
        } else {
            document.body.classList.remove('cursor-hover');
        }
    });
}

function initAudio() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    let isPlaying = false;
    
    // Set a peaceful, low volume
    music.volume = 0.3; 

    btn.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            btn.innerHTML = '▶';
            isPlaying = false;
        } else {
            // Modern browsers require a Promise to play audio
            let playPromise = music.play();
            
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Audio successfully started
                    btn.innerHTML = '⏸';
                    isPlaying = true;
                })
                .catch(error => {
                    // Audio failed to start (usually file missing or browser blocked)
                    console.error("Audio playback failed:", error);
                    alert("Audio file not found. Make sure bg-music.mp3 is inside your public folder!");
                });
            }
        }
    });
}

// 3D Tilt Effect Math
function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            card.style.transition = `transform 0.5s ease`; // Smooth reset
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = `none`; // Remove transition during active hover
        });
    });
}

// Fetch and Render Data
async function fetchStaticData() {
    const res = await fetch('/api/data');
    const data = await res.json();
    renderSymbols(data.symbols);
    renderChakras(data.chakras);
    renderDeities(data.deities);
    renderTimeline(data.texts);
    renderGurus(data.gurus); // <-- Corrected capitalization!
    initTiltEffect(); // Initialize 3D effects on newly created cards
}
function renderGurus(gurus) {
    const container = document.getElementById('gurus-container');
    gurus.forEach(guru => {
        const div = document.createElement('div');
        div.className = 'guru-card tilt-card glass-panel rounded-3xl overflow-hidden border border-white/5 hover:border-saffron/40 flex flex-col md:flex-row group shadow-lg shadow-black/50';
        
        div.innerHTML = `
            <div class="md:w-2/5 h-64 md:h-auto relative overflow-hidden img-zoom-container bg-black">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent to-night opacity-0 md:opacity-100 z-10"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-night to-transparent opacity-100 md:opacity-0 z-10"></div>
                <img src="${guru.img}" alt="${guru.name}" class="w-full h-full object-cover object-top filter sepia-[0.3] brightness-90">
            </div>
            <div class="p-8 md:w-3/5 relative z-20 flex flex-col justify-center tilt-content">
                <span class="text-xs text-saffron uppercase tracking-widest font-bold mb-2">${guru.title}</span>
                <h3 class="text-3xl font-serif text-marigold mb-4">${guru.name}</h3>
                <p class="text-sm text-gray-300 leading-relaxed mb-6 font-light">${guru.philosophy}</p>
                <div class="border-l-2 border-vermilion pl-4 relative">
                    <span class="text-3xl text-vermilion/20 absolute -top-4 -left-2 font-serif">"</span>
                    <p class="text-md text-gray-400 italic">"${guru.quote}"</p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}
// NEW: Render Sacred Symbols
function renderSymbols(symbols) {
    const container = document.getElementById('symbols-container');
    symbols.forEach(symbol => {
        const div = document.createElement('div');
        div.className = 'tilt-card glass-panel rounded-3xl overflow-hidden border border-saffron/20 relative cursor-pointer flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(244,187,68,0.3)] hover:border-saffron/60 group';
        
        div.innerHTML = `
            <div class="h-64 img-zoom-container relative w-full">
                <div class="absolute inset-0 bg-gradient-to-t from-night to-transparent z-10"></div>
                <img src="${symbol.img}" class="w-full h-full object-cover filter brightness-75">
                <div class="absolute top-4 right-4 z-20 text-4xl text-marigold drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] font-sans tilt-content">
                    ${symbol.sanskrit}
                </div>
            </div>
            <div class="p-8 relative z-20 bg-night flex-1 flex flex-col justify-center tilt-content -mt-10">
                <h3 class="text-3xl font-serif text-marigold mb-4">${symbol.name}</h3>
                <p class="text-gray-300 leading-relaxed text-lg">${symbol.meaning}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderDeities(deities) {
    const container = document.getElementById('deity-gallery');
    deities.forEach(deity => {
        const card = document.createElement('div');
        card.className = 'tilt-card glass-panel rounded-2xl overflow-hidden relative border border-white/10 hover:border-saffron/60';
        card.innerHTML = `
            <div class="h-80 img-zoom-container relative">
                <div class="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent z-10"></div>
                <img src="${deity.img}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-0">
            </div>
            <div class="p-8 relative z-20 -mt-16 tilt-content">
                <h3 class="text-3xl font-serif text-marigold mb-2">${deity.name}</h3>
                <p class="text-gray-400 leading-relaxed">${deity.desc}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderChakras(chakras) {
    const container = document.getElementById('chakra-container');
    container.innerHTML = ''; // Clear out the old tiny dots
    
    // Add layout styling to the main container
    container.className = "flex flex-wrap justify-center gap-8 relative z-10";

    chakras.forEach((chakra) => {
        const div = document.createElement('div');
        // Redesigned: Larger glass cards, proper padding, flex layout
        div.className = 'chakra-card glass-panel p-8 rounded-3xl w-72 border border-white/5 relative overflow-hidden group cursor-pointer flex flex-col items-center text-center shadow-lg';
        
        // Active lighting effect on hover via JS
        div.addEventListener('mouseenter', () => {
            div.style.borderColor = chakra.color;
            div.style.boxShadow = `0 15px 40px -10px ${chakra.color}aa`;
        });
        div.addEventListener('mouseleave', () => {
            div.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            div.style.boxShadow = 'none';
        });

        div.innerHTML = `
            <!-- Background ambient glow that reveals on hover -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-10 blur-3xl transition-opacity duration-700 group-hover:opacity-40 pointer-events-none" style="background-color: ${chakra.color}"></div>
            
            <!-- The Radiant Orb -->
            <div class="w-24 h-24 rounded-full mb-6 relative flex items-center justify-center chakra-orb z-10" style="background: radial-gradient(circle at 30% 30%, #ffffff, ${chakra.color}); box-shadow: 0 0 30px ${chakra.color}80">
                <!-- Ping ring effect -->
                <div class="w-full h-full rounded-full border-2 absolute animate-ping opacity-30" style="border-color: ${chakra.color}"></div>
            </div>
            
            <!-- Text Content -->
            <div class="relative z-10 flex-1 flex flex-col">
                <h3 class="text-2xl font-serif font-bold mb-3 tracking-wide drop-shadow-md" style="color: ${chakra.color}; text-shadow: 0 0 15px ${chakra.color}80">${chakra.name}</h3>
                <p class="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">${chakra.desc}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderTimeline(texts) {
    const container = document.getElementById('timeline-container');
    texts.forEach(text => {
        const div = document.createElement('div');
        div.className = 'mb-12 pl-10 relative timeline-item glass-panel p-6 rounded-r-2xl border-y border-r border-white/5 hover:border-saffron/30 transition-colors';
        div.innerHTML = `
            <div class="absolute -left-[9px] top-8 w-4 h-4 rounded-full bg-saffron border-4 border-night shadow-[0_0_10px_rgba(244,187,68,0.8)]"></div>
            <span class="text-sm text-vermilion font-bold tracking-wider uppercase">${text.year}</span>
            <h3 class="text-2xl font-serif text-marigold mt-1 mb-2">${text.title}</h3>
            <p class="text-gray-400">${text.desc}</p>
        `;
        container.appendChild(div);
    });
}

// Guestbook API Handling
async function fetchGuestbookWall() {
    const res = await fetch('/api/guestbook');
    const entries = await res.json();
    const wall = document.getElementById('guestbook-wall');
    wall.innerHTML = ''; 

    entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-6 rounded-2xl border border-white/5 relative entry-card transition-all hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(255,215,0,0.1)]';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h4 class="text-lg font-serif text-saffron">${entry.name}</h4>
                <span class="text-xs text-gray-500">${entry.date}</span>
            </div>
            <p class="text-gray-300 leading-relaxed mb-4 italic">"${entry.message}"</p>
            <button onclick="likeEntry(${entry.id}, this)" class="flex items-center gap-2 text-sm text-marigold/70 hover:text-vermilion transition-colors">
                <span>🙏</span> <span class="like-count">${entry.likes} Blessings</span>
            </button>
        `;
        wall.appendChild(card);
    });
}

document.getElementById('guestbook-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Transmitting...';
    
    try {
        await fetch('/api/guestbook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('gb-name').value,
                message: document.getElementById('gb-message').value
            })
        });
        e.target.reset();
        await fetchGuestbookWall();
    } catch (err) {
        alert('Failed to submit.');
    } finally {
        btn.textContent = 'Offer to the Universe';
    }
});

async function likeEntry(id, btnElement) {
    const res = await fetch(`/api/guestbook/${id}/like`, { method: 'PUT' });
    const data = await res.json();
    if (data.success) {
        btnElement.querySelector('.like-count').textContent = `${data.likes} Blessings`;
        btnElement.classList.add('text-vermilion');
    }
}

// Cinematic Animations
function initAnimations() {
    // Parallax background slow move
    gsap.to('.parallax-bg', {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: "header", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.fromTo('.hero-title', { opacity: 0, scale: 0.9, y: 50 }, { opacity: 1, scale: 1, y: 0, duration: 2, ease: 'power4.out' });
    
    gsap.utils.toArray('.section-title').forEach(t => {
        gsap.from(t, { scrollTrigger: { trigger: t, start: "top 85%" }, opacity: 0, y: 40, duration: 1.5, ease: 'power3.out' });
    });
    gsap.from('.guru-card', { 
        scrollTrigger: { trigger: "#gurus-container", start: "top 80%" }, 
        opacity: 0, 
        y: 50, 
        stagger: 0.2, 
        duration: 1.2, 
        ease: 'power3.out' 
    });
    gsap.from('.video-reveal', { 
        scrollTrigger: { trigger: ".video-reveal", start: "top 80%" }, 
        opacity: 0, 
        scale: 0.9, 
        y: 40, 
        duration: 1.5, 
        ease: 'power4.out' 
    });

    // Staggered reveals
    gsap.from('.tilt-card', { scrollTrigger: { trigger: "#symbols-container", start: "top 75%" }, opacity: 0, y: 60, stagger: 0.2, duration: 1.2, ease: 'power2.out' });
    gsap.from('.chakra-node', { scrollTrigger: { trigger: "#chakra-container", start: "top 75%" }, opacity: 0, scale: 0.5, stagger: 0.1, duration: 1, ease: 'back.out(1.7)' });
    gsap.from('.timeline-item', { scrollTrigger: { trigger: "#timeline-container", start: "top 70%" }, opacity: 0, x: -50, stagger: 0.2, duration: 1, ease: 'power2.out' });
}