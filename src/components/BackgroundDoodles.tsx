"use client";

import React from "react";

export default function BackgroundDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Subtle ambient lighting without emoji stickers */}
      <div className="absolute top-[15%] left-[5%] w-72 h-72 rounded-full bg-[#2B5EA9]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[50%] right-[5%] w-80 h-80 rounded-full bg-[#EBA9B5]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-[85%] left-[8%] w-72 h-72 rounded-full bg-[#2B5EA9]/5 blur-3xl pointer-events-none" />
    </div>
  );
}
