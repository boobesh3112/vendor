import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseEnter = () => {
      setIsHidden(false);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .interactive');
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Ring trailing logic
  useEffect(() => {
    let animationFrameId;
    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        // Ease value: higher is faster, lower is smoother trailing
        const ease = 0.15;
        return {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease,
        };
      });
      animationFrameId = requestAnimationFrame(updateTrail);
    };

    animationFrameId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  if (isHidden) return null;

  return (
    <>
      {/* Outer Ring */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovered ? '48px' : '24px',
          height: isHovered ? '48px' : '24px',
          borderRadius: '50%',
          border: isHovered ? '2px solid rgba(236, 72, 153, 0.8)' : '2px solid rgba(6, 182, 212, 0.6)',
          background: isHovered ? 'rgba(236, 72, 153, 0.05)' : 'none',
          boxShadow: isHovered ? '0 0 15px rgba(236, 72, 153, 0.5)' : '0 0 8px rgba(6, 182, 212, 0.2)',
          transform: `translate3d(${trail.x - (isHovered ? 24 : 12)}px, ${trail.y - (isHovered ? 24 : 12)}px, 0)`,
          transition: 'width 0.25s ease-out, height 0.25s ease-out, border-color 0.25s, background-color 0.25s, box-shadow 0.25s',
          pointerEvents: 'none',
          zIndex: 10000,
        }}
      />
      {/* Inner Dot */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isHovered ? '#ec4899' : '#06b6d4',
          boxShadow: isHovered ? '0 0 10px #ec4899' : '0 0 6px #06b6d4',
          transform: `translate3d(${position.x - 3}px, ${position.y - 3}px, 0)`,
          pointerEvents: 'none',
          zIndex: 10001,
        }}
      />
    </>
  );
}
