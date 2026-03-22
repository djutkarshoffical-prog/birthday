"use strict";

// -------- LIVE CANVAS BACKGROUND (Nebula Starfield) -------- //
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: undefined, y: undefined };
let width, height;

const particleCount = 150;
const colors = ['#ff007f', '#7000ff', '#ffd700', '#ffffff', '#00d4ff'];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class NebulaParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1;
        this.glow = Math.random() * 15 + 5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;

        // Mouse Parallax Effect
        if (mouse.x !== undefined && mouse.y !== undefined) {
            let dx = mouse.x - width / 2;
            let dy = mouse.y - height / 2;
            this.x += dx * 0.005;
            this.y += dy * 0.005;
        }
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    resize();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new NebulaParticle());
    }
}

function animateParticles() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    // Nebula Glow
    if (mouse.x !== undefined && mouse.y !== undefined) {
        let grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400);
        grad.addColorStop(0, 'rgba(112, 0, 255, 0.15)');
        grad.addColorStop(1, 'rgba(5, 5, 16, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initParticles);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

initParticles();
animateParticles();


// -------- LOGIC & INTERACTIVITY -------- //

let isGiftOpened = false;
let shakeInterval;

const views = {
    intro: document.getElementById('intro-view'),
    cake: document.getElementById('cake-view'),
    gift: document.getElementById('gift-view'),
    reveal: document.getElementById('reveal-view')
};

function initIntro() {
    // Transition to cake phase after intro sequence
    setTimeout(() => {
        transitionTo(views.intro, views.cake);
    }, 9500);
}

window.blowCandles = function () {
    const flames = document.querySelectorAll('.flame');
    flames.forEach((f, idx) => {
        setTimeout(() => {
            f.classList.add('extinguished');
            // Smoke puff confetti
            confetti({
                particleCount: 10,
                spread: 30,
                origin: { x: 0.5, y: 0.4 },
                colors: ['#ffffff', '#cccccc'],
                gravity: 0.5,
                scalar: 0.5
            });
        }, idx * 200);
    });

    setTimeout(() => {
        transitionTo(views.cake, views.gift);
        initGiftPhase();
        fireHeartConfetti();
    }, 1500);
};

function initGiftPhase() {
    const giftEl = document.getElementById('gift-element');

    // Auto-shake box every few seconds to draw attention
    shakeInterval = setInterval(() => {
        if (!isGiftOpened) {
            giftEl.classList.add('shake');
            setTimeout(() => giftEl.classList.remove('shake'), 600);
        }
    }, 2500);
}

window.openGift = function () {
    if (isGiftOpened) return;
    isGiftOpened = true;

    // Play Background Music
    const music = document.getElementById('bg-music');
    if (music) {
        music.volume = 0.5; // Set a nice background volume level
        music.play().catch(error => console.log("Audio play failed:", error));
    }

    clearInterval(shakeInterval);
    const giftEl = document.getElementById('gift-element');
    const tapIndic = document.querySelector('.tap-indicator');

    if (tapIndic) tapIndic.style.opacity = '0';
    giftEl.classList.add('open');

    // Heart & Colorful Confetti Burst
    fireHeartConfetti();

    // Transition after lid flies off
    setTimeout(() => {
        transitionTo(views.gift, views.reveal);
        fireConfettiShower();
        startTypewriter();
        initMemoryBubbles();
    }, 1500);
};

window.resetApp = function () {
    window.location.reload();
};

function transitionTo(hideView, showView) {
    hideView.classList.remove('active');
    hideView.classList.add('hidden');

    setTimeout(() => {
        showView.classList.remove('hidden');
        showView.classList.add('active');
    }, 1000); // 1-second crossfade
}

function startTypewriter() {
    const greetingEl = document.querySelector('.greeting');
    if (!greetingEl) return;
    const text = greetingEl.innerText;
    greetingEl.innerHTML = '';
    greetingEl.style.opacity = '1';

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    greetingEl.appendChild(cursor);

    let i = 0;
    function type() {
        if (i < text.length) {
            cursor.before(text.charAt(i));
            i++;
            setTimeout(type, 100);
        } else {
            setTimeout(() => cursor.remove(), 2000);
        }
    }
    setTimeout(type, 1200); // Wait for transition
}

function initMemoryBubbles() {
    const container = document.createElement('div');
    container.className = 'bubble-container';
    document.getElementById('reveal-view').appendChild(container);

    const icons = ['❤️', '✨', '🎈', '🎁', '⭐', '🌸'];

    setInterval(() => {
        if (document.querySelectorAll('.bubble').length > 15) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 40 + 30;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 90}%`;
        bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
        bubble.innerText = icons[Math.floor(Math.random() * icons.length)];

        bubble.onclick = (e) => {
            e.stopPropagation();
            confetti({
                particleCount: 15,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                colors: [colors[Math.floor(Math.random() * colors.length)]],
                scalar: 0.7
            });
            bubble.remove();
        };

        container.appendChild(bubble);
        setTimeout(() => bubble.remove(), 10000);
    }, 2000);
}

// -------- CONFETTI FX -------- //

function fireHeartConfetti() {
    // A nice pop of pinkish/white hearts and circles
    const count = 300;
    const defaults = {
        origin: { y: 0.6 },
        colors: ['#ff477e', '#ff7096', '#ff9a9e', '#fecfef', '#ffffff']
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 30, startVelocity: 60 });
    fire(0.2, { spread: 80 });
    fire(0.35, { spread: 100, decay: 0.9, scalar: 0.8 });
    fire(0.1, { spread: 130, startVelocity: 30, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 140, startVelocity: 45 });
}

function fireConfettiShower() {
    const duration = 20 * 1000; // 20 seconds shower
    const animationEnd = Date.now() + duration;

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        // Gentle shower
        confetti({
            particleCount: 2,
            startVelocity: 0,
            ticks: 300,
            origin: { x: Math.random(), y: -0.1 },
            colors: ['#ff477e', '#ff7096', '#ffffff'],
            shapes: ['circle', 'square'],
            gravity: Math.random() * 0.4 + 0.4,
            scalar: Math.random() * 0.5 + 0.7,
            drift: Math.random() * 1.5 - 0.75 // Wavy effect
        });

        requestAnimationFrame(frame);
    }());
}

// Kick it off
document.addEventListener('DOMContentLoaded', () => {
    initIntro();
});
