"use client";

import React from "react";

export default function MarqueeTicker() {
  const tickerItems = [
    { text: "CRISPY BONELESS CHICHICK", highlight: "100% Fillet Segar" },
    { text: "YUZU LEMON DINGIN", highlight: "Segar & Dingin" },
    { text: "KENTANG CRINKLE GURIH", highlight: "Renyah Maksimal" },
    { text: "PAKET HEMAT KOMPLIT", highlight: "Hemat s/d Rp 6.000" },
    { text: "SAUS KEJU CREAMY", highlight: "Add-on Pilihan" },
    { text: "SIAP ANTAR AREA KAMPUS", highlight: "Praktis Saat Nugas" },
    { text: "NEKOFROST BOOTH", highlight: "Crispy Bite, Big Happiness" },
  ];

  // Duplicate items twice to ensure endless looping
  const combinedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full overflow-hidden bg-[#1E447C] text-white py-2.5 rounded-2xl shadow-sm border border-[#325D98] relative select-none">
      {/* Soft edge blur fades */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1E447C] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1E447C] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-6 text-xs sm:text-sm font-bold tracking-wide">
        {combinedItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="text-[#F1EDE1]">{item.text}</span>
            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EBA9B5] text-[#1E447C]">
              {item.highlight}
            </span>
            <span className="text-white/30 text-xs ml-3">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
