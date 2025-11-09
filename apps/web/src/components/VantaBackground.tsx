import { useEffect, useRef } from 'react';

interface VantaBackgroundProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function VantaBackground({ children }: VantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.async = true;
    document.body.appendChild(threeScript);

    threeScript.onload = () => {
      // Load Vanta.js WAVES
      const vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';
      vantaScript.async = true;
      document.body.appendChild(vantaScript);

      vantaScript.onload = () => {
        if (!vantaEffect.current && vantaRef.current && window.VANTA) {
          try {
            vantaEffect.current = window.VANTA.WAVES({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color: 0x0,
              shininess: 30,
              waveHeight: 15,
              waveSpeed: 1,
              zoom: 1
            });
            console.log('✅ Vanta WAVES initialized successfully');
          } catch (error) {
            console.error('❌ Vanta initialization error:', error);
          }
        }
      };
    };

    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
          vantaEffect.current = null;
        } catch (error) {
          console.error('Error destroying Vanta:', error);
        }
      }
    };
  }, []);

  return (
    <>
      {/* Vanta Background Layer */}
      <div 
        ref={vantaRef} 
        className="fixed inset-0 w-full h-full" 
        style={{ 
          zIndex: 0,
          backgroundColor: '#000000'
        }} 
      />
      
      {/* Content Layer */}
      <div className="relative w-full h-full" style={{ zIndex: 1 }}>
        {children}
      </div>
    </>
  );
}
