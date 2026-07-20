import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.pageYOffset / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initially
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        zIndex: 10002,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          width: `${scrollProgress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #06b6d4 0%, #ec4899 50%, #8b5cf6 100%)',
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.8), 0 0 5px rgba(236, 72, 153, 0.5)',
          transition: 'width 0.1s ease-out'
        }}
      />
    </div>
  );
}
