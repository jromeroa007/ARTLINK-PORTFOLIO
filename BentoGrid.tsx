"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ProjectCard from "./ProjectCard";

/* ═══════ DATA ═══════ */
const TILES = [
  { id: "tile-01", image: "/tile-01.png", tx: -10, ty: -10, tz: -100, ex: -40, ey: -40, width: "280px", height: "180px" },
  { id: "tile-02", image: "/tile-02.png", tx: 10, ty: -20, tz: 80, ex: 0, ey: -50, width: "280px", height: "180px" },
  { id: "tile-03", image: "/tile-03.png", tx: 30, ty: -12, tz: -40, ex: 40, ey: -40, width: "280px", height: "180px" },
  { id: "tile-04", image: "/tile-04.png", tx: -8, ty: 3, tz: 50, ex: -50, ey: 0, width: "280px", height: "180px" },
  { id: "tile-06", image: "/tile-06.png", tx: 11, ty: 0, tz: -100, ex: 0, ey: -10, width: "280px", height: "180px" },
  { id: "tile-05", image: "/tile-05.png", tx: 26, ty: 10, tz: 30, ex: 50, ey: 0, width: "280px", height: "180px" },
  { id: "tile-07", image: "/tile-07.png", tx: -12, ty: 27, tz: -60, ex: -40, ey: 40, width: "280px", height: "180px" },
  { id: "tile-08", image: "/tile-08.png", tx: 8, ty: 20, tz: 40, ex: 0, ey: 50, width: "280px", height: "180px" },
  { id: "tile-09", image: "/tile-09.png", tx: 28, ty: 25, tz: -20, ex: 40, ey: 40, width: "280px", height: "180px" },
];

const CAROUSEL_DATA = [
  { id: "m0", image: "/art-gastro.png", title: "GASTRONÓMICA", subtitle: "Experiencias Culinarias", desc: "Creamos experiencias gastronómicas inmersivas que van más allá del paladar. Desde la conceptualización de marcas culinarias hasta la producción de eventos exclusivos.", stats: { projects: "47", reach: "2.3M", awards: "12" }, gallery: ["/art-gastro.png", "/art-scenic.png", "/art-sound.png"], angleOffset: 0 },
  { id: "m1", image: "/art-scenic.png", title: "ESCÉNICA", subtitle: "Performance & Teatro", desc: "Colaboramos con directores, coreógrafos y artistas visuales para diseñar experiencias en vivo que desafían los límites del espacio convencional.", stats: { projects: "35", reach: "1.8M", awards: "9" }, gallery: ["/art-scenic.png", "/art-fashion.png", "/art-gastro.png"], angleOffset: (1/8)*Math.PI*2 },
  { id: "m2", image: "/art-sound.png", title: "SONORA", subtitle: "Diseño de Sonido", desc: "Nuestro laboratorio sonoro diseña paisajes auditivos que transforman espacios, marcas y experiencias. Identidades sonoras e instalaciones acústicas inmersivas.", stats: { projects: "62", reach: "5.1M", awards: "18" }, gallery: ["/art-sound.png", "/art-digital.png", "/art-architecture.png"], angleOffset: (2/8)*Math.PI*2 },
  { id: "m3", image: "/art-digital.png", title: "DIGITAL", subtitle: "Tecnología Creativa", desc: "Realidad aumentada, instalaciones interactivas, plataformas web inmersivas — empujamos los límites de lo posible en el mundo virtual.", stats: { projects: "89", reach: "12M", awards: "24" }, gallery: ["/art-digital.png", "/art-sound.png", "/art-fashion.png"], angleOffset: (3/8)*Math.PI*2 },
  { id: "m4", image: "/art-fashion.png", title: "MODA", subtitle: "Fashion & Estilo", desc: "Dirigimos campañas, editoriales y desfiles que han redefinido el panorama fashion en la región con visión de futuro.", stats: { projects: "53", reach: "8.4M", awards: "15" }, gallery: ["/art-fashion.png", "/art-scenic.png", "/art-architecture.png"], angleOffset: (4/8)*Math.PI*2 },
  { id: "m5", image: "/art-architecture.png", title: "ESPACIAL", subtitle: "Arquitectura & Diseño", desc: "Reimaginamos lobbies, galerías, pop-ups y experiencias arquitectónicas efímeras con materiales nobles y tecnología de punta.", stats: { projects: "28", reach: "3.7M", awards: "11" }, gallery: ["/art-architecture.png", "/art-gastro.png", "/art-digital.png"], angleOffset: (5/8)*Math.PI*2 },
  { id: "m6", image: "/art-gastro.png", title: "BRANDING", subtitle: "Identidad de Marca", desc: "Desarrollamos identidades visuales, estrategias de comunicación y experiencias de marca que crean conexiones auténticas.", stats: { projects: "74", reach: "15M", awards: "21" }, gallery: ["/art-gastro.png", "/art-fashion.png", "/art-scenic.png"], angleOffset: (6/8)*Math.PI*2 },
  { id: "m7", image: "/art-scenic.png", title: "AUDIOVISUAL", subtitle: "Cine & Video", desc: "Documentales premiados, cortometrajes experimentales, campañas publicitarias cinematográficas — cada frame genera impacto.", stats: { projects: "41", reach: "9.2M", awards: "16" }, gallery: ["/art-scenic.png", "/art-sound.png", "/art-digital.png"], angleOffset: (7/8)*Math.PI*2 },
];

export default function BentoGrid() {
  // Lógica de Scroll Interna (0 a 1)
  const [scrollPhase, setScrollPhase] = useState(0);
  
  // Carrusel
  const [carouselAngle, setCarouselAngle] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showMarketing, setShowMarketing] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);

  const carouselAngleRef = useRef(0);
  const targetPhaseRef = useRef(0);
  const currentPhaseRef = useRef(0);
  
  const isActionOverlayOpenRef = useRef(false);
  useEffect(() => {
    isActionOverlayOpenRef.current = !!(showCategorias || selectedId);
  }, [showCategorias, selectedId]);

  useEffect(() => {
    setMounted(true);
    let raf: number;
    let isDragging = false;
    let startY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (isActionOverlayOpenRef.current) return;
      e.preventDefault();
      // Incrementar o decrementar el scrollPhase objetivo (0 a 4) permitiendo más espacio y footer
      targetPhaseRef.current = Math.min(4, Math.max(0, targetPhaseRef.current + e.deltaY * 0.001));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isActionOverlayOpenRef.current) return;
      isDragging = true;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isActionOverlayOpenRef.current) return;
      if (!isDragging) return;
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const delta = startY - currentY;
      targetPhaseRef.current = Math.min(4, Math.max(0, targetPhaseRef.current + delta * 0.002));
      startY = currentY;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    let targetMouseX = 0;
    let currentSpeed = 0.002;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 based on X screen position
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    };

    // Attach passive: false to allow preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousemove", handleGlobalMouseMove);

    const animate = () => {
      // Lerp for smooth scrolling
      currentPhaseRef.current += (targetPhaseRef.current - currentPhaseRef.current) * 0.1;
      setScrollPhase(currentPhaseRef.current);

      // Auto-rotation + Interactive Horizontal Mouse Scrutiny
      // By default it rotates at 0.002. If mouse is to far right, it goes up to ~0.015
      const targetSpeed = 0.002 + (targetMouseX * 0.015);
      
      // Smoothly interpolate the current speed toward the target speed
      currentSpeed += (targetSpeed - currentSpeed) * 0.04;
      
      carouselAngleRef.current += currentSpeed;
      setCarouselAngle(carouselAngleRef.current);

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const RADIUS = mounted ? Math.min(window.innerWidth * 0.35, 420) : 400;

  const renderFolder = useCallback((marco: typeof CAROUSEL_DATA[0], idx: number) => (
    <>
      <div style={{ position:'absolute', top:0, left:0, width:'14px', height:'100%', background:'linear-gradient(180deg, rgba(230,230,230,0.7) 0%, rgba(200,200,200,0.5) 100%)', borderRight:'1px solid rgba(200,200,200,0.35)', borderRadius:'3px 0 0 2px', zIndex:2 }}/>
      <div style={{ position:'absolute', top:0, left:'14px', right:0, height:'28px', background:'linear-gradient(180deg, rgba(245,245,245,0.6) 0%, rgba(235,235,235,0.15) 100%)', borderBottom:'1px solid rgba(200,200,200,0.4)', display:'flex', alignItems:'center', paddingLeft:'10px', zIndex:2 }}>
        <span style={{ fontFamily:'Helvetica, Arial, sans-serif', fontSize:'8px', letterSpacing:'0.22em', fontWeight:300, color:'rgba(50,50,50,0.6)', textTransform:'uppercase' }}>{marco.title}</span>
      </div>
      <div style={{ position:'absolute', top:'28px', left:'14px', right:'8px', bottom:'8px', overflow:'hidden', borderRadius:'1px', border:'1px solid rgba(200,200,200,0.25)' }}>
        <Image src={marco.image} alt={marco.title} fill priority={idx<4} sizes="320px" className="object-cover" />
      </div>
    </>
  ), []);

  if (!mounted) return <div className="h-screen w-full bg-[#f5f5f3]" />;

  // Calculamos la opacidad y posición del carrusel basado en scrollPhase
  const carouselProgress = Math.min(1, Math.max(0, scrollPhase - 0.5) * 2); // 0 a 1 en la 2da mitad del scroll
  const carouselOpacity = carouselProgress;
  const carouselY = 200 * (1 - carouselProgress); 
  const backgroundOpacity = 1 - Math.min(1, scrollPhase * 0.5);

  const manifestoProgress = Math.max(0, scrollPhase - 1); // 0 to 1
  const globalY = -(manifestoProgress * 100); // vh unit

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden bg-[#f5f5f3]">
      <div 
        className="relative w-full h-full"
        style={{ transform: `translateY(${globalY}vh)` }}
      >
        
        {/* VIEW 1: HERO & CAROUSEL (occupies full height of the moving container's first screen) */}
        <div className="relative w-full h-screen">
          {/* Background */}
          <div className="absolute top-0 w-full h-[135vh] pointer-events-none" style={{ opacity: backgroundOpacity }}>
            <Image src="/texture-bg.png" alt="" fill priority className="object-cover" />
          </div>

          {/* Menú de Navegación Lateral Fijo */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex flex-col items-end gap-6 select-none pointer-events-auto">
            <Image src="/artlink-logo.png" alt="ARTLINK" width={80} height={60} className="object-contain" priority />
            <nav className="flex flex-col items-end gap-3 pr-1">
              <button onClick={() => { targetPhaseRef.current = 0; setShowCategorias(false); setShowMarketing(false); }} className="font-sans font-extralight text-[10px] tracking-[0.2em] text-black/50 hover:text-black transition-colors duration-300">HOME</button>
              
              <div className="flex flex-col items-end">
                <button onClick={() => setShowMarketing(!showMarketing)} className="font-sans font-extralight text-[10px] tracking-[0.2em] text-black/50 hover:text-black transition-colors duration-300">MARKETING</button>
                <AnimatePresence>
                  {showMarketing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col items-end mt-2 gap-2 overflow-hidden border-r-2 border-black/10 pr-3">
                      <a href="#" className="font-sans font-light text-[9px] tracking-widest text-black/40 hover:text-black mt-2">BRANDING ESTRATÉGICO</a>
                      <a href="#" className="font-sans font-light text-[9px] tracking-widest text-black/40 hover:text-black">EXPERIENCIAS INMERSIVAS</a>
                      <a href="#" className="font-sans font-light text-[9px] tracking-widest text-black/40 hover:text-black">CAMPAÑAS PERFORMANCE</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => { setShowCategorias(true); setShowMarketing(false); }} className="font-sans font-extralight text-[10px] tracking-[0.2em] text-black/50 hover:text-black transition-colors duration-300">CATEGORÍAS</button>
              <button className="font-sans font-extralight text-[10px] tracking-[0.2em] text-black/50 hover:text-black transition-colors duration-300">TALENTOS</button>
              <button 
                onClick={() => { targetPhaseRef.current = 4; setShowCategorias(false); setShowMarketing(false); }} 
                className="font-sans font-extralight text-[10px] tracking-[0.2em] text-black/50 hover:text-black transition-colors duration-300"
              >
                CONTACTOS
              </button>
            </nav>
          </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '2000px' }}>
        
        {/* Phase 1: Mosaico Explosivo de Logos */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0 preserve-3d scale-[0.45] sm:scale-75 md:scale-100 pointer-events-none">
           <div className="absolute inset-0 w-0 h-0 preserve-3d">
              {TILES.map((tile, idx) => {
                const phase1Scroll = Math.min(1, scrollPhase * 2); // 0 a 1 en la 1ra mitad
                const tx = tile.tx + tile.ex * phase1Scroll;
                const ty = tile.ty + tile.ey * phase1Scroll;
                const tz = tile.tz + phase1Scroll * 350;
                const scale = 1 + phase1Scroll * 0.8;
                const opacity = Math.max(0, 1 - phase1Scroll * 1.5);
                
                if (opacity <= 0.01) return null;
                
                return (
                  <div key={tile.id}>
                    <ProjectCard {...tile} tx={tx} ty={ty} tz={tz} scale={scale} opacity={opacity} index={idx} />
                  </div>
                );
              })}
           </div>
        </div>

        {/* Phase 2: Carrusel Circular */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ perspective: '1800px', opacity: carouselOpacity, transform: `translateY(${carouselY}px)` }}
        >
           <div style={{
              position: 'relative', width: `${RADIUS * 2}px`, height: `${RADIUS * 2}px`,
              transformStyle: 'preserve-3d',
              transform: `rotateX(-12deg)`,
           }}>
              {CAROUSEL_DATA.map((marco, idx) => {
                const angle = marco.angleOffset + carouselAngle;
                const x = Math.cos(angle) * RADIUS;
                const z = Math.sin(angle) * RADIUS;
                const facingAngle = (-angle * 180 / Math.PI) + 90;
                const depthOpacity = 0.4 + 0.6 * ((z + RADIUS) / (RADIUS * 2));
                const isHovered = hoveredId === marco.id;

                return (
                  <div
                    key={marco.id}
                    onMouseEnter={() => setHoveredId(marco.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(marco.id)}
                    className="absolute cursor-pointer pointer-events-auto"
                    style={{
                      width: 'min(70vw, 260px)', height: 'min(95vw, 360px)',
                      left: '50%', top: '50%',
                      opacity: depthOpacity * carouselOpacity,
                      transform: `translate(-50%,-50%) translate3d(${x}px, ${isHovered ? -35 : 0}px, ${z}px) rotateY(${facingAngle}deg)`,
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.4s cubic-bezier(0.2,1,0.3,1), box-shadow 0.4s ease',
                      zIndex: Math.round(z + RADIUS),
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(245,245,245,0.10) 60%, rgba(250,250,250,0.18) 100%)',
                      backdropFilter: 'blur(6px) saturate(1.1)', WebkitBackdropFilter: 'blur(6px) saturate(1.1)',
                      border: '1px solid rgba(255,255,255,0.55)', borderTop: '1px solid rgba(255,255,255,0.8)', borderLeft: '1px solid rgba(255,255,255,0.7)',
                      borderRadius: '3px 3px 2px 2px',
                      boxShadow: isHovered
                        ? '5px 7px 0 rgba(200,200,200,0.55), 0 35px 70px rgba(0,0,0,0.25)'
                        : '4px 5px 0 rgba(210,210,210,0.5), 0 20px 45px rgba(0,0,0,0.18)',
                    }}
                  >
                    {renderFolder(marco, idx)}
                  </div>
                );
              })}
           </div>
        </div>

      </div>
      </div>
      
        {/* VIEW 2: MANIFESTO (Scrolls into view as globalY pushes everything UP) */}
        <div className="relative w-full min-h-screen bg-[#f5f5f3] flex flex-col justify-center px-8 md:px-20 border-t border-black/10 mt-[35vh]">
          <div className="max-w-5xl">
             <span className="text-[10px] tracking-[0.5em] font-light text-black/35 uppercase block mb-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Manifiesto</span>
             <h1 className="text-5xl md:text-[7rem] font-extralight text-black/90 leading-[0.95] tracking-tight mb-16" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
               ARTLINK es el puente<br />entre <em className="font-light italic">el arte</em> y<br /><em className="font-light italic">las marcas</em>.
             </h1>
             <div className="flex flex-col md:flex-row gap-12 md:gap-24 mt-12">
               <p className="flex-1 text-sm font-light leading-[2.1] text-black/50" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                 Fundada en 2018, ARTLINK nació de la convicción de que las experiencias más memorables surgen cuando el arte y la estrategia se fusionan. Somos un colectivo multidisciplinario de creativos, estrategas, productores y artistas digitales que trabajan como un solo organismo.
               </p>
               <p className="flex-1 text-sm font-light leading-[2.1] text-black/50" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                 Con presencia en Ciudad de México, Bogotá, Buenos Aires y Miami, nuestro alcance es regional pero nuestra ambición es global. Cada proyecto es una oportunidad para redefinir los límites de lo posible en la intersección del arte, la tecnología y la comunicación.
               </p>
             </div>
          </div>
        </div>

        {/* VIEW 3: FOOTER */}
        <footer className="relative w-full bg-black text-white px-8 md:px-20 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
              <div className="flex-1">
                <Image src="/artlink-logo.png" alt="ARTLINK" width={90} height={68} className="object-contain invert mb-6" />
                <p className="text-xs font-light leading-[2] text-white/35 max-w-xs" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Donde el arte y las marcas convergen para crear experiencias que trascienden.</p>
              </div>
              <div className="flex flex-wrap gap-12 md:gap-24">
                <div>
                  <span className="text-[9px] tracking-[0.3em] uppercase text-white/25 block mb-5" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Navegación</span>
                  {["Home", "Marketing", "Categorías", "Talentos", "Contacto"].map(i => (
                    <a key={i} href="#" className="block text-xs font-light text-white/45 hover:text-white transition-colors mb-2.5" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{i}</a>
                  ))}
                </div>
                <div>
                  <span className="text-[9px] tracking-[0.3em] uppercase text-white/25 block mb-5" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Contacto</span>
                  <a href="mailto:hola@artlink.studio" className="block text-xs font-light text-white/45 hover:text-white transition-colors mb-2.5" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>hola@artlink.studio</a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8">
              <p className="text-[10px] text-white/20 uppercase tracking-widest mb-4 md:mb-0" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>© 2026 ARTLINK STUDIO</p>
              <div className="flex gap-6">
                {["Instagram", "Behance", "Vimeo", "LinkedIn"].map(social => (
                  <a key={social} href="#" className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{social}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* ═══════ DETAIL OVERLAY WITH ANIMATE PRESENCE ═══════ */}
      <AnimatePresence>
        {selectedId && (() => {
          const selectedMarco = CAROUSEL_DATA.find(m => m.id === selectedId);
          if (!selectedMarco) return null;
          return (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[100] flex pointer-events-auto"
            >
              <div 
                className="absolute inset-0 bg-[#e0e0de]/90 backdrop-blur-xl"
                onClick={() => setSelectedId(null)}
              />
              <div className="relative w-full h-full flex flex-col md:flex-row shadow-2xl">
                <div className="flex-1 relative overflow-hidden bg-black/5">
                  <Image src={selectedMarco.image} alt={selectedMarco.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button 
                    onClick={() => setSelectedId(null)} 
                    className="absolute top-8 left-8 text-white z-10 hover:opacity-70 transition-opacity"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  </button>
                </div>
                <div className="flex-[0.8] bg-[#f5f5f3] flex flex-col p-12 md:p-24 overflow-y-auto">
                  <span className="text-[10px] tracking-[0.4em] font-light text-black/40 mb-4">{selectedMarco.title}</span>
                  <h2 className="text-4xl md:text-5xl font-extralight text-black/90 mb-12" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{selectedMarco.subtitle}</h2>
                  <p className="text-sm font-light text-black/60 leading-[2.2] mb-16">{selectedMarco.desc}</p>
                  <div className="grid grid-cols-3 gap-8 mb-16">
                    <div>
                      <span className="block text-2xl font-light text-black mb-1">{selectedMarco.stats.projects}</span>
                      <span className="block text-[8px] tracking-[0.2em] font-light text-black/40 uppercase">Proyectos</span>
                    </div>
                    <div>
                      <span className="block text-2xl font-light text-black mb-1">{selectedMarco.stats.reach}</span>
                      <span className="block text-[8px] tracking-[0.2em] font-light text-black/40 uppercase">Alcance</span>
                    </div>
                    <div>
                      <span className="block text-2xl font-light text-black mb-1">{selectedMarco.stats.awards}</span>
                      <span className="block text-[8px] tracking-[0.2em] font-light text-black/40 uppercase">Premios</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-[10px] tracking-[0.4em] font-light text-black/40 mb-6 block">EXPLORAR</span>
                    <div className="flex gap-4">
                      {selectedMarco.gallery.map((img, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-sm overflow-hidden border border-black/10 hover:border-black/30 transition-colors cursor-pointer">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ═══════ CATEGORIAS FLAT GRID VIEW ═══════ */}
      <AnimatePresence>
        {showCategorias && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-[#f5f5f3] pt-32 pb-24 px-8 md:px-24 overflow-y-auto pointer-events-auto"
          >
             <button 
               onClick={() => setShowCategorias(false)} 
               className="fixed top-8 right-8 z-[70] p-4 group"
             >
               <span className="block text-[10px] tracking-widest text-black/50 group-hover:text-black transition-colors">CERRAR</span>
             </button>

             <h2 className="text-4xl md:text-5xl font-extralight text-black/90 mb-16 tracking-tight" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>CATEGORÍAS</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {CAROUSEL_DATA.map((marco, idx) => (
                 <div 
                   key={marco.id} 
                   className="group cursor-pointer relative overflow-hidden transition-transform hover:-translate-y-2"
                   onClick={() => setSelectedId(marco.id)}
                   style={{
                      height: 'min(85vw, 360px)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(245,245,245,0.15) 60%, rgba(250,250,250,0.2) 100%)',
                      backdropFilter: 'blur(6px) saturate(1.1)', WebkitBackdropFilter: 'blur(6px) saturate(1.1)',
                      border: '1px solid rgba(255,255,255,0.8)', borderTop: '1px solid #fff', borderLeft: '1px solid #fff',
                      borderRadius: '3px 3px 2px 2px',
                      boxShadow: '4px 5px 0 rgba(210,210,210,0.5), 0 20px 45px rgba(0,0,0,0.12)'
                   }}
                 >
                    {renderFolder(marco, idx)}
                 </div>
               ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
