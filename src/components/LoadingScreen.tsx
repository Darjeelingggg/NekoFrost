"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Menyiapkan booth NekoFrost...");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Prevent scrolling while loading screen is active
    document.body.style.overflow = "hidden";

    const duration = 1600; // total duration in ms
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step + (Math.random() * 2 - 0.5);
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = "";
    };
  }, []);

  // Update status text based on progress
  useEffect(() => {
    if (progress < 30) {
      setStatusText("Menyiapkan booth NekoFrost...");
    } else if (progress < 65) {
      setStatusText("Menggoreng chichick renyah...");
    } else if (progress < 90) {
      setStatusText("Meracik Yuzu Lemon dingin...");
    } else {
      setStatusText("Hampir siap...");
    }

    if (progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 300);

      const hideTimer = setTimeout(() => {
        setIsDone(true);
        document.body.style.overflow = "";
      }, 800);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [progress]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F1EDE1] transition-all duration-500 ease-out select-none ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#EBA9B5]/25 via-[#2B5EA9]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xs sm:max-w-sm w-full px-6">
        {/* Soft Mascot Glow Container */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-2">
          {/* Circular soft halo */}
          <div className="absolute inset-0 rounded-full bg-amber-100/50 blur-xl pointer-events-none" />

          {/* Logo Mascot with playful gentle float */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 animate-float-slow drop-shadow-[0_12px_24px_rgba(43,94,169,0.2)]">
            <Image
              src="/images/logo.png"
              alt="NekoFrost Mascot"
              fill
              sizes="(max-width: 640px) 112px, 144px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="relative h-10 w-36 sm:h-12 sm:w-44 mb-6">
          <Image
            src="/images/brand-text.png"
            alt="NekoFrost"
            fill
            sizes="176px"
            className="object-contain"
            priority
          />
        </div>

        {/* Progress Bar Container */}
        <div className="w-full">
          {/* Track */}
          <div className="w-full h-2 rounded-full bg-[#E4DEC9] overflow-hidden p-0.5 border border-[#D8D0BA] shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2B5EA9] via-[#E67E22] to-[#EBA9B5] transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          {/* Progress Meta Info (Left status, Right percentage) */}
          <div className="flex items-center justify-between mt-2.5 text-xs">
            <span className="text-[#67778E] font-medium tracking-tight">
              {statusText}
            </span>
            <span className="text-[#1E447C] font-black tracking-wider">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-[#8C9BAE] mt-6 tracking-wide font-medium">
          Crispy Bite, Big Happiness.
        </p>
      </div>
    </div>
  );
}
