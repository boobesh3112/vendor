import { useRef, useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, BarChart3, Receipt, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

const DOCK_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vendors', label: 'Vendors', icon: Users },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'invoices', label: 'Invoices', icon: Receipt }
];

export default function IOSDock({ activeTab, setActiveTab }) {
  const dockRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [bouncingId, setBouncingId] = useState(null);
  const [isMuted, setIsMuted] = useState(soundEngine.getMute());
  
  // Track scales for each item
  const [scales, setScales] = useState(DOCK_ITEMS.map(() => 1));

  const handleMouseMove = (e) => {
    if (!dockRef.current) return;
    const dockRect = dockRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Proximity threshold (pixels)
    const proximity = 150;
    const maxScale = 1.6;

    const children = dockRef.current.children;
    const newScales = Array.from(children).map((child, idx) => {
      const rect = child.getBoundingClientRect();
      const childX = rect.left + rect.width / 2;
      const childY = rect.top + rect.height / 2;
      
      const distance = Math.hypot(mouseX - childX, mouseY - childY);
      
      if (distance < proximity) {
        // Gaussian distribution scaling
        const factor = 1 - distance / proximity;
        return 1 + (maxScale - 1) * Math.pow(factor, 2);
      }
      return 1;
    });

    setScales(newScales);
  };

  const handleMouseLeave = () => {
    setScales(DOCK_ITEMS.map(() => 1));
    setHoveredIdx(null);
  };

  const handleItemClick = (id) => {
    soundEngine.playClick();
    setActiveTab(id);
    setBouncingId(id);
    setTimeout(() => {
      setBouncingId(null);
    }, 1000); // Stop bouncing after 1s
  };

  const toggleSound = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    soundEngine.setMute(newState);
    if (!newState) {
      setTimeout(() => soundEngine.playClick(), 50);
    }
  };

  const handleIconHover = (idx) => {
    if (hoveredIdx !== idx) {
      soundEngine.playHover();
      setHoveredIdx(idx);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        pointerEvents: 'auto'
      }}
    >
      {/* Label Tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            top: '-45px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {hoveredIdx === DOCK_ITEMS.length ? 'Toggle Sounds' : DOCK_ITEMS[hoveredIdx].label}
        </div>
      )}

      {/* Dock Bar */}
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          padding: '10px 16px',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          height: '68px',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        {DOCK_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isBouncing = bouncingId === item.id;
          const currentScale = scales[idx] || 1;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => handleIconHover(idx)}
              className="interactive"
              style={{
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '0',
                margin: '0',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: `scale(${currentScale}) translateY(${isBouncing ? '-12px' : '0px'})`,
                transformOrigin: 'bottom center',
                transition: isBouncing 
                  ? 'transform 0.15s ease-out' 
                  : 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s',
                boxShadow: isActive ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none',
                color: isActive ? '#22d3ee' : '#94a3b8',
                position: 'relative'
              }}
            >
              <Icon size={22} style={{ transition: 'color 0.2s' }} />
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#22d3ee',
                    boxShadow: '0 0 6px #22d3ee'
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.15)', alignSelf: 'center' }} />

        {/* Sound FX Mute Toggle Button */}
        <button
          onClick={toggleSound}
          onMouseEnter={() => handleIconHover(DOCK_ITEMS.length)}
          className="interactive"
          style={{
            background: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: isMuted ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: `scale(${scales[DOCK_ITEMS.length] || 1})`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s',
            color: isMuted ? '#ef4444' : '#10b981'
          }}
        >
          {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      </div>
    </div>
  );
}
