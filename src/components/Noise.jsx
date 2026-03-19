import { useRef, useEffect } from 'react';
import './Noise.css';

const Noise = ({
  patternRefreshInterval = 2,
}) => {
  const grainRef = useRef(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let frame = 0;
    let animationId;
    let observer;

    const resize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    const drawGrain = () => {
      if (!canvas || canvas.width === 0 || canvas.height === 0) return;
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Generates high-contrast noise to texture the multiplied text
      // Reduced transparency to look structurally solid but textured
      for (let i = 0; i < data.length; i += 4) {
        const val = 40 + Math.random() * 215; 
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 120 + Math.random() * 100;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    if (window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        resize();
        drawGrain();
      });
      if (canvas.parentElement) {
        observer.observe(canvas.parentElement);
      }
    } else {
      window.addEventListener('resize', resize);
    }

    resize();
    loop();

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternRefreshInterval]);

  return (
    <canvas 
      className="noise-overlay" 
      ref={grainRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        objectFit: 'cover'
      }} 
    />
  );
};

export default Noise;
