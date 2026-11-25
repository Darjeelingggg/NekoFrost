"use client";

import React from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Sparkles, ArrowRight, CheckCircle2, Utensils, Box, Sliders, Smartphone } from "lucide-react";

export default function SignatureSpotlight() {
  const { products, setSelectedProduct, getProductStock, isProductAvailable } = useApp();

  // Find the exact products
  const chichickProduct =
    products.find((p) => p.id === "chk-ori") ||
    products.find((p) => p.category === "boneless");

  const yuzuProduct =
    products.find((p) => p.id === "yuzu-ori") ||
    products.find((p) => p.category === "beverages");

  const chkRemaining = chichickProduct ? getProductStock(chichickProduct.id) : 7;
  const chkAvailable = chichickProduct ? isProductAvailable(chichickProduct.id) : true;

  const yuzuRemaining = yuzuProduct ? getProductStock(yuzuProduct.id) : 5;
  const yuzuAvailable = yuzuProduct ? isProductAvailable(yuzuProduct.id) : true;

  return (
    <section className="rounded-3xl bg-white text-[#1E2D44] p-6 sm:p-10 border border-[#E2DDD0] shadow-sm relative overflow-hidden space-y-8 sm:space-y-10">
      {/* Subtle decorative brand circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#2B5EA9]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#EBA9B5]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Signature Tag Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE1] relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-[#1E447C]">
            NekoFrost Signature Duo
          </span>
          <span className="hidden sm:inline-block text-[10px] text-[#67778E] font-medium">
            • Kombinasi Gurih &amp; Segar Paling Juara
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full bg-[#EBA9B5]/40 text-[#1E447C] border border-[#EBA9B5]">
          Menu Rekomendasi
        </span>
      </div>

      {/* Alternating Row 1: Boneless Chichick (Text Left, Image Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Text & Story */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#2B5EA9] uppercase">
              CRISPY &amp; FLAVORFUL
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#1E447C] tracking-tight leading-snug">
              Boneless Chichick
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-[#4E5D71] leading-relaxed">
            Ayam crispy tanpa tulang, gurih &amp; renyah, dengan bumbu tabur 3 rasa. Disajikan praktis dalam packaging box yang higienis dan siap santap sambil jalan ke kelas.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#2A3B52]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2B5EA9] flex-shrink-0" />
              <span className="font-medium">Ayam Crispy Tanpa Tulang</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2B5EA9] flex-shrink-0" />
              <span className="font-medium">Bumbu Tabur 3 Rasa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2B5EA9] flex-shrink-0" />
              <span className="font-medium">Add-on Saus Keju (+Rp 2.000)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2B5EA9] flex-shrink-0" />
              <span className="font-medium">Praktis Dibawa dalam Box</span>
            </div>
          </div>

          {/* Price & CTA Action */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#8C9BAE] block font-semibold">Harga Satuan</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${!chkAvailable ? "bg-rose-100 text-rose-700" : chkRemaining <= 2 ? "bg-amber-400 text-[#1E447C]" : "bg-[#EAF2FD] text-[#2B5EA9]"}`}>
                  {!chkAvailable ? "Habis" : `Sisa ${chkRemaining}`}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#1E447C]">Rp 13.000</span>
            </div>

            <button
              onClick={() => {
                if (chichickProduct && chkAvailable) setSelectedProduct(chichickProduct);
              }}
              disabled={!chkAvailable}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
                chkAvailable
                  ? "bg-[#2B5EA9] text-white hover:bg-[#EBA9B5] hover:text-[#1E447C] hover:scale-105 cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span>{chkAvailable ? "Pesan Chichick" : "Chichick Habis"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Porcelain Dish Presentation */}
        <div className="flex justify-center items-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-[#FAF8F2] to-[#EFEBE1] p-4 border-2 border-[#E2DDD0] shadow-[0_15px_35px_-10px_rgba(43,94,169,0.18)] flex items-center justify-center group">
            {/* Outer subtle blue dashed circle ring */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#2B5EA9]/25 pointer-events-none" />
            {/* Inner plate rim */}
            <div className="absolute inset-4 rounded-full border border-[#DED7C8]/70 pointer-events-none" />

            {/* Soft subtle glow behind item */}
            <div className="absolute w-40 h-40 rounded-full bg-[#2B5EA9]/10 blur-xl pointer-events-none" />

            {/* Food Image */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
              <Image
                src={chichickProduct?.image || "/images/chichick-box.png"}
                alt="Boneless Chichick NekoFrost"
                fill
                sizes="(max-width: 640px) 176px, 224px"
                className="object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
              />
            </div>

            {/* Floating Quality Badge */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E2DDD0] text-[10px] font-bold text-[#1E447C] shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Gurih &amp; Renyah</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alternating Row 2: Yuzu Lemon (Image Left, Text Right on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 pt-8 border-t border-[#EFEBE1]">
        {/* Left Column (Desktop) / Image: Chilled Ceramic Plate Presentation */}
        <div className="flex justify-center items-center order-2 md:order-1">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-[#FAF8F2] to-[#FFF9E6] p-4 border-2 border-[#E2DDD0] shadow-[0_15px_35px_-10px_rgba(235,169,181,0.25)] flex items-center justify-center group">
            {/* Outer subtle blue dashed circle ring */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#2B5EA9]/25 pointer-events-none" />
            {/* Inner plate rim */}
            <div className="absolute inset-4 rounded-full border border-[#E8DFCC]/70 pointer-events-none" />

            {/* Soft citrus glow behind cup */}
            <div className="absolute w-40 h-40 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />

            {/* Food Image */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
              <Image
                src={yuzuProduct?.image || "/images/yuzu-cup.png"}
                alt="Yuzu Lemon NekoFrost"
                fill
                sizes="(max-width: 640px) 176px, 224px"
                className="object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
              />
            </div>

            {/* Floating Quality Badge */}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E2DDD0] text-[10px] font-bold text-[#1E447C] shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sensasi Soda Segar</span>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop) / Text: Story & CTA */}
        <div className="space-y-4 order-1 md:order-2">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-600 uppercase">
              REFRESHING SODA &amp; CITRUS
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#1E447C] tracking-tight leading-snug">
              Yuzu
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-[#4E5D71] leading-relaxed">
            Sprite, lemon, &amp; es: manis-asam segar dengan sensasi soda dingin. Penyeimbang paling pas dan segar maksimal setelah menikmati chichick krispi yang gurih.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#2A3B52]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">Sprite, Lemon &amp; </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">Manis-Asam Sensasi Soda</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">Es Kristal Dingin Maksimal</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">Disajikan dalam Cup Praktis</span>
            </div>
          </div>

          {/* Price & CTA Action */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#8C9BAE] block font-semibold">Harga Satuan</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${!yuzuAvailable ? "bg-rose-100 text-rose-700" : yuzuRemaining <= 2 ? "bg-amber-400 text-[#1E447C]" : "bg-[#EAF2FD] text-[#2B5EA9]"}`}>
                  {!yuzuAvailable ? "Habis" : `Sisa ${yuzuRemaining}`}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#1E447C]">Rp 9.000</span>
            </div>

            <button
              onClick={() => {
                if (yuzuProduct && yuzuAvailable) setSelectedProduct(yuzuProduct);
              }}
              disabled={!yuzuAvailable}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
                yuzuAvailable
                  ? "bg-[#2B5EA9] text-white hover:bg-[#EBA9B5] hover:text-[#1E447C] hover:scale-105 cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span>{yuzuAvailable ? "Pesan Yuzu" : "Yuzu Habis"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Value Pillars from Pitch Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6 border-t border-[#EFEBE1] relative z-10">
        <div className="bg-[#FAF8F2] p-3.5 rounded-2xl border border-[#EAE4D5] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2B5EA9] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E447C]">Gurih + Segar 1 Booth</h4>
            <p className="text-[11px] text-[#67778E] mt-0.5 leading-snug">
              Ayam crispy &amp; soda-lemon, tidak perlu beli di 2 tempat.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F2] p-3.5 rounded-2xl border border-[#EAE4D5] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2B5EA9] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E447C]">Praktis Dibawa</h4>
            <p className="text-[11px] text-[#67778E] mt-0.5 leading-snug">
              Box &amp; cup praktis, bisa dimakan sambil jalan ke kelas.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F2] p-3.5 rounded-2xl border border-[#EAE4D5] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2B5EA9] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E447C]">Bisa Dikustom</h4>
            <p className="text-[11px] text-[#67778E] mt-0.5 leading-snug">
              Pilihan bumbu tabur 3 rasa dan add-on saus keju.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F2] p-3.5 rounded-2xl border border-[#EAE4D5] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2B5EA9] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1E447C]">Mudah Dibayar</h4>
            <p className="text-[11px] text-[#67778E] mt-0.5 leading-snug">
              QRIS/dompet digital &amp; pre-order via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
