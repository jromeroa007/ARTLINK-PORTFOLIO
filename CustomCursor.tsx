"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      // Detect if we are hovering over an interactive element (link, button or curling stone)
      const isInteractive = 
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.closest(".cursor-pointer") !== null ||
        target.closest(".cursor-grab") !== null;

      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-red-600 pointer-events-none z-[9999]"
        animate={{
          x: position.x - 8, // Center the 16px wide circle
          y: position.y - 8,
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 28,
          mass: 0.5,
        }}
      />
      {/* Outer subtle ring for hover state */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-red-600/50 pointer-events-none z-[9998]"
        animate={{
          x: position.x - 20, // Center the 40px wide circle
          y: position.y - 20,
          scale: isHovering ? 1.2 : 0,
          opacity: isHovering ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      />
    </>
  );
}
