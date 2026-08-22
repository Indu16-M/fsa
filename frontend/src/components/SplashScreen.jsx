import React, { useEffect, useState } from 'react';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.5s ease',
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? 'none' : 'all'
      }}
    >
      <div
        style={{
          width: '110px',
          height: '110px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
          marginBottom: '1.5rem',
          animation: 'pulse 1.8s infinite ease-in-out'
        }}
      >
        <UtensilsCrossed size={56} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
        ShareBite
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '1.05rem', marginBottom: '2.5rem' }}>
        <Sparkles size={18} /> "Every Meal Matters"
      </div>

      {/* Loading Animation Line */}
      <div style={{ width: '160px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '60%',
            backgroundColor: '#10b981',
            borderRadius: '99px',
            animation: 'loadingProgress 1.8s infinite ease-in-out'
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes loadingProgress {
          0% { left: -60%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
