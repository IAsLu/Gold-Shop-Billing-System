import { useRef, useEffect } from 'react';

export default function DynamicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dots = [];
    const spacing = 50; // Space between dots
    const mouseRadius = 150;
    
    const initDots = () => {
      dots.length = 0;
      const cols = Math.ceil(window.innerWidth / spacing) + 1;
      const rows = Math.ceil(window.innerHeight / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          dots.push({
            x: x,
            y: y,
            originX: x,
            originY: y,
            size: 1.5 + Math.random() * 2,
            color: `rgba(99, 102, 241, ${0.1 + Math.random() * 0.3})`,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2, // For idle floating
            speed: 0.02 + Math.random() * 0.05
          });
        }
      }
    };

    const mouse = { x: null, y: null };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        // Idle floating movement
        dot.phase += dot.speed;
        const idleX = Math.cos(dot.phase) * 10;
        const idleY = Math.sin(dot.phase) * 10;
        
        const targetX = dot.originX + idleX;
        const targetY = dot.originY + idleY;

        // Interaction with mouse
        if (mouse.x !== null) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            dot.vx -= Math.cos(angle) * force * 5;
            dot.vy -= Math.sin(angle) * force * 5;
          }
        }

        // Return to origin/target force
        const dxTarget = targetX - dot.x;
        const dyTarget = targetY - dot.y;
        dot.vx += dxTarget * 0.05;
        dot.vy += dyTarget * 0.05;

        // Friction
        dot.vx *= 0.92;
        dot.vy *= 0.92;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        
        // Optional: Very subtle connection lines for modern look
        if (mouse.x !== null) {
            const dx = mouse.x - dot.x;
            const dy = mouse.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(dot.x, dot.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance/100)})`;
                ctx.stroke();
            }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    handleResize();
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 1, 
        pointerEvents: 'none' 
      }} 
    />
  );
}
