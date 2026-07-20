import { useEffect, useRef } from 'react';

export default function ClickSpark() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 6 + 3;
        this.friction = 0.95;
        this.gravity = 0.15;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 65%)`; // Cyan/Blue shades
        if (Math.random() > 0.5) {
          this.color = `hsl(${Math.random() * 60 + 290}, 100%, 65%)`; // Purple/Magenta shades
        }
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      }

      update() {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.restore();
      }
    }

    const handleClick = (e) => {
      // Spawn 15-20 particles at click location
      const count = Math.floor(Math.random() * 10) + 15;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(e.clientX, e.clientY));
      }
    };

    window.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
