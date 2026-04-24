"use client";

import React from "react";
import Image from "next/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProjectCardProps {
  image?: string;
  tx: number;
  ty: number;
  tz: number;
  opacity?: number;
  scale?: number;
  index: number;
  width?: string;
  height?: string;
}

export default function ProjectCard({
  image,
  tx,
  ty,
  tz,
  opacity = 1,
  scale = 1,
  width = "320px",
  height = "220px"
}: ProjectCardProps) {
  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white flex flex-col overflow-hidden shadow-2xl"
      )}
      style={{
        width,
        height,
        opacity,
        transform: `translate3d(calc(-50% + ${tx}vw), calc(-50% + ${ty}vh), ${tz}px) scale(${scale})`,
        transformStyle: "preserve-3d"
      }}
    >
      {/* Main Image Content - Image already contains the ARTLINK header */}
      <div className="relative w-full h-full">
        {image && (
          <Image
            src={image}
            alt="Portfolio tile"
            fill
            priority
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}
