"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CurlingGame({ onWin }: { onWin: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stoneRef = useRef<HTMLDivElement>(null);
  const trajectoryRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<"playing" | "moving" | "won">("playing");
  
  // Game refs for high frequency updates without re-renders
  const gameInfo = useRef({
    width: 0,
    height: 0,
    stoneRadius: 50,
    target: { x: 0, y: 0, radius: 125 },
    stone: { x: 0, y: 0, vx: 0, vy: 0, isDragging: false },
    startMouse: { x: 0, y: 0 },
    currentMouse: { x: 0, y: 0 }
  });

  useEffect(() => {
    const handleResize = () => {
      gameInfo.current.width = window.innerWidth;
      gameInfo.current.height = window.innerHeight;
      gameInfo.current.target = {
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.2,
        radius: 125
      };
      
      if (gameState !== "won" && gameState !== "moving") {
        gameInfo.current.stone.x = window.innerWidth / 2;
        gameInfo.current.stone.y = window.innerHeight * 0.85;
      }
      updateStoneUI();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gameState]);

  const updateStoneUI = () => {
    if (stoneRef.current) {
      stoneRef.current.style.transform = `translate3d(${
        gameInfo.current.stone.x - gameInfo.current.stoneRadius
      }px, ${gameInfo.current.stone.y - gameInfo.current.stoneRadius}px, 0)`;
    }
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const dragStart = (e: MouseEvent | Touch) => {
      if (gameState !== "playing") return;
      const rect = stoneRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const stoneCenterX = rect.left + rect.width / 2;
      const stoneCenterY = rect.top + rect.height / 2;
      const clientX = 'clientX' in e ? (e as MouseEvent).clientX : (e as Touch).clientX;
      const clientY = 'clientY' in e ? (e as MouseEvent).clientY : (e as Touch).clientY;
      
      const distToMouse = Math.hypot(clientX - stoneCenterX, clientY - stoneCenterY);
      
      if (distToMouse < 100) {
        gameInfo.current.stone.isDragging = true;
        gameInfo.current.startMouse = { x: clientX, y: clientY };
        gameInfo.current.currentMouse = { x: clientX, y: clientY };
      }
    };

    const dragMove = (e: MouseEvent | Touch) => {
      if (!gameInfo.current.stone.isDragging) return;
      
      const clientX = 'clientX' in e ? (e as MouseEvent).clientX : (e as Touch).clientX;
      const clientY = 'clientY' in e ? (e as MouseEvent).clientY : (e as Touch).clientY;
      gameInfo.current.currentMouse = { x: clientX, y: clientY };
      
      const dx = clientX - gameInfo.current.startMouse.x;
      const dy = clientY - gameInfo.current.startMouse.x;
      const dist = Math.hypot(clientX - gameInfo.current.startMouse.x, clientY - gameInfo.current.startMouse.y);
      
      if (trajectoryRef.current) {
        trajectoryRef.current.style.display = 'block';
        trajectoryRef.current.style.left = `${gameInfo.current.stone.x}px`;
        trajectoryRef.current.style.top = `${gameInfo.current.stone.y}px`;
        trajectoryRef.current.style.height = `${Math.min(dist * 2, 300)}px`;
        
        let angle = Math.atan2(clientY - gameInfo.current.startMouse.y, clientX - gameInfo.current.startMouse.x) - Math.PI / 2;
        trajectoryRef.current.style.transform = `rotate(${angle}rad)`;
      }
    };

    const dragEnd = () => {
      if (!gameInfo.current.stone.isDragging) return;
      gameInfo.current.stone.isDragging = false;
      
      if (trajectoryRef.current) {
        trajectoryRef.current.style.display = 'none';
      }
      
      const dx = gameInfo.current.startMouse.x - gameInfo.current.currentMouse.x;
      const dy = gameInfo.current.startMouse.y - gameInfo.current.currentMouse.y;
      
      gameInfo.current.stone.vx = dx * 0.12; 
      gameInfo.current.stone.vy = dy * 0.12; 
      
      const maxV = 35;
      const speed = Math.hypot(gameInfo.current.stone.vx, gameInfo.current.stone.vy);
      if (speed > maxV) {
        gameInfo.current.stone.vx = (gameInfo.current.stone.vx / speed) * maxV;
        gameInfo.current.stone.vy = (gameInfo.current.stone.vy / speed) * maxV;
      }

      if (speed > 2) {
        setGameState("moving");
      }
    };

    const mousedown = (e: MouseEvent) => dragStart(e);
    const mousemove = (e: MouseEvent) => dragMove(e);
    const mouseup = () => dragEnd();
    
    const touchstart = (e: TouchEvent) => dragStart(e.touches[0]);
    const touchmove = (e: TouchEvent) => {
        if(gameInfo.current.stone.isDragging) e.preventDefault();
        dragMove(e.touches[0]);
    }
    const touchend = () => dragEnd();

    window.addEventListener("mousedown", mousedown);
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("touchstart", touchstart, { passive: false });
    window.addEventListener("touchmove", touchmove, { passive: false });
    window.addEventListener("touchend", touchend);

    return () => {
      window.removeEventListener("mousedown", mousedown);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("touchstart", touchstart);
      window.removeEventListener("touchmove", touchmove);
      window.removeEventListener("touchend", touchend);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "moving") return;

    let animationFrameId: number;

    const loop = () => {
      const { stone, width, height, stoneRadius, target } = gameInfo.current;
      
      stone.x += stone.vx;
      stone.y += stone.vy;

      stone.vx *= 0.985;
      stone.vy *= 0.985;

      if (stone.x - stoneRadius < 0) {
        stone.x = stoneRadius; stone.vx *= -0.7;
      } else if (stone.x + stoneRadius > width) {
        stone.x = width - stoneRadius; stone.vx *= -0.7;
      }

      if (stone.y - stoneRadius < 0) {
        stone.y = stoneRadius; stone.vy *= -0.7;
      } else if (stone.y + stoneRadius > height) {
        stone.y = height - stoneRadius; stone.vy *= -0.7;
      }

      updateStoneUI();

      const speed = Math.hypot(stone.vx, stone.vy);
      
      if (speed < 0.2) {
        stone.vx = 0; stone.vy = 0;
        
        const dist = Math.hypot(stone.x - target.x, stone.y - target.y);
        if (dist < target.radius) {
          setGameState("won");
          onWin();
        } else {
          setTimeout(() => {
            stone.x = width / 2;
            stone.y = height * 0.85;
            updateStoneUI();
            setGameState("playing");
          }, 1000);
        }
      } else {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, onWin]);

  return (
    <AnimatePresence>
      {(gameState === "playing" || gameState === "moving") && (
        <motion.section
          key="game-section"
          initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1, pointerEvents: "none" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-10 overflow-hidden bg-black"
        >
          <div 
            className="absolute inset-0 z-0 opacity-30 select-none pointer-events-none" 
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1549488344-93afb9c1d1fa?q=80&w=2000&auto=format&fit=crop')",
              backgroundPosition: "center",
              backgroundSize: "cover",
              mixBlendMode: "luminosity" 
            }}
          />
          
          <div className="absolute top-[5%] w-full text-center z-20 pointer-events-none" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <h1 className="font-semibold text-3xl tracking-[0.4rem] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">
              LANZA PARA ENTRAR
            </h1>
            <p className="text-xl text-gray-400 font-light">
              Arrastra la piedra hacia atrás y suelta para darle al centro.
            </p>
          </div>

          <div className="absolute inset-0 w-full h-full perspective-[800px] z-[5] overflow-hidden">
            <div 
              ref={trackRef} 
              className="absolute inset-0 preserve-3d origin-bottom"
              style={{ transform: "rotateX(60deg) translateY(-20vh) translateZ(-100px)" }}
            >
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-white/5 border-2 border-accent/50 flex justify-center items-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute rounded-full w-[150px] h-[150px] border-2 border-white/20" />
                <div className="absolute rounded-full w-[50px] h-[50px] bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
              </div>
              
              <div 
                ref={stoneRef} 
                className="absolute w-[100px] h-[100px] preserve-3d cursor-grab active:cursor-grabbing z-10 flex justify-center items-center"
              >
                {/* Simulated shadow on the track to ground it */}
                <div className="absolute top-1/2 left-1/2 w-full h-[60%] -translate-x-1/2 -translate-y-1/2 bg-black/80 blur-md rounded-[50%] opacity-60 translate-z-[1px]" />
                
                {/* Image standing upward to counter the 60deg track rotation */}
                <img 
                  src="/curling-stone.png" 
                  alt="Curling Stone" 
                  className="absolute w-[160%] h-[160%] object-contain pointer-events-none drop-shadow-2xl transition-transform"
                  style={{ 
                    // Counteract the track's rotateX(60deg) so it appears 3D and upright 
                    transform: "rotateX(-60deg) translateY(-25px) translateZ(20px)" 
                  }}
                />
              </div>
              
              <div 
                ref={trajectoryRef} 
                className="absolute w-[4px] h-0 bg-gradient-to-t from-white/80 to-transparent origin-bottom hidden z-[5] rounded-sm"
              />
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
