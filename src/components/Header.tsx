"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const { cartCount, setIsCartOpen, setIsOrderHistoryOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#F1EDE1]/95 backdrop-blur-md px-4 sm:px-8 py-3 border-b border-[#E2DDD0]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="NekoFrost Logo"
                fill
                sizes="(max-width: 640px) 48px, 56px"
                className="object-contain"
                priority
              />
            </div>
            <div className="relative h-8 sm:h-9 w-28 sm:w-36 hidden min-[380px]:block">
              <Image
                src="/images/brand-text.png"
                alt="NekoFrost"
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Order Tracking Button (Inspiration Screen 3) */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            aria-label="Lihat Status Pesanan Saya"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1E447C] bg-white border border-[#E2DDD0] hover:bg-[#FAF8F2] transition-colors shadow-xs"
            title="Lihat Status & Riwayat Pesanan"
          >
            <Clock className="w-4 h-4 text-[#2B5EA9]" />
            <span className="hidden sm:inline">Pesanan Saya</span>
          </button>

          {/* Cart Icon with MPink badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Keranjang Belanja"
            className="relative p-2 rounded-full hover:bg-white/60 transition-colors flex items-center justify-center"
          >
            <div className="w-9 h-9 rounded-full border border-[#2B5EA9]/30 flex items-center justify-center bg-white">
              <ShoppingBag className="w-5 h-5 text-[#2B5EA9]" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#EBA9B5] text-[#1E447C] text-[11px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
