(() => {
    'use strict';
    const canvas = document.createElement('canvas');
    canvas.id = 'network-background';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1000, y: -1000 };
    let width, height, particles, frame = 0, previous = 0;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.min(75, Math.max(20, Math.floor(width * height / 18000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14
        }));
        draw(0);
    }

    function line(a, b, distance, limit, opacity) {
        if (distance >= limit) return;
        ctx.strokeStyle = `rgba(72, 151, 235, ${(1 - distance / limit) * opacity})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    function draw(delta) {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
            p.x = (p.x + p.vx * delta + width) % width;
            p.y = (p.y + p.vy * delta + height) % height;
        }
        particles.forEach((p, i) => {
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                line(p, q, Math.hypot(p.x - q.x, p.y - q.y), 155, 0.24);
            }
            if (!motion.matches) {
                line(p, pointer, Math.hypot(p.x - pointer.x, p.y - pointer.y), 190, 0.45);
            }
            ctx.fillStyle = 'rgba(118, 184, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function tick(time) {
        draw(previous ? Math.min((time - previous) / 1000, 0.05) : 0);
        previous = time;
        frame = requestAnimationFrame(tick);
    }
    function syncAnimation() {
        cancelAnimationFrame(frame);
        previous = 0;
        if (!motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
        else draw(0);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', event => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
    document.addEventListener('visibilitychange', syncAnimation);
    motion.addEventListener('change', syncAnimation);
    resize();
    syncAnimation();
})();
