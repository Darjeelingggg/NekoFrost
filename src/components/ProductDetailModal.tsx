"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Heart, Minus, Plus, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, addToCart, getProductStock, isProductAvailable } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!selectedProduct) return null;

  const remaining = getProductStock(selectedProduct.id);
  const isAvailable = isProductAvailable(selectedProduct.id);

  const handleClose = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setNotes("");
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, notes);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      handleClose();
    }, 600);
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(selectedProduct.price * quantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl bg-[#F1EDE1] shadow-2xl overflow-y-auto no-scrollbar flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-10 px-5 pt-4 pb-2 flex items-center justify-between bg-[#F1EDE1]/95 backdrop-blur-sm border-b border-[#E8E3D8]/60">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 rounded-full text-[#2B5EA9] hover:bg-white/60 transition-colors"
            aria-label="Kembali ke daftar menu"
          >
            <ArrowLeft className="w-6 h-6 text-[#2B5EA9]" />
          </button>
          
          <span className="text-xs font-bold text-[#7C8B9E] uppercase tracking-wider">
            Detail Menu
          </span>

          <div className="w-8" />
        </div>

        {/* Circular Dish Presentation */}
        <div className="px-6 py-4 flex flex-col items-center">
          <div
            className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-white shadow-[0_16px_36px_-10px_rgba(43,94,169,0.3)] border border-[#E2DDD0]"
            style={{ width: "240px", height: "240px", maxWidth: "100%", borderRadius: "9999px", position: "relative", overflow: "hidden" }}
          >
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.name}
              fill
              sizes="280px"
              className="object-cover rounded-full"
              style={{ objectFit: "cover", borderRadius: "9999px" }}
              priority
            />
          </div>

          {/* Title & Favorite Heart with MPink */}
          <div className="w-full mt-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E447C] tracking-tight leading-snug">
                {selectedProduct.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-[#2B5EA9] bg-[#E1ECF9] px-2 py-0.5 rounded-md">
                  {selectedProduct.subCategory}
                </span>
                {selectedProduct.promoBadge && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#EBA9B5] text-[#1E447C]">
                    {selectedProduct.promoBadge}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full hover:bg-white/80 transition-colors flex-shrink-0"
              aria-label="Sukai menu ini"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? "fill-[#EBA9B5] text-[#EBA9B5]"
                    : "text-[#2B5EA9]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sea Breeze Card with MPink accents */}
        <div className="bg-[#1E447C] text-white rounded-t-3xl sm:rounded-b-3xl p-6 pt-5 shadow-inner mt-2">
          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs font-medium text-[#C8DCF7] pb-3 mb-3 border-b border-[#2D5A9C]">
            <div className="flex items-center gap-3">
              <span>{selectedProduct.portion}</span>
              <span>•</span>
              <span className={`font-bold ${!isAvailable ? "text-rose-300" : remaining <= 2 ? "text-amber-300 animate-pulse" : "text-[#EBA9B5]"}`}>
                {!isAvailable ? "Habis (Sold Out)" : `Sisa ${remaining} Porsi`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <Heart className="w-3.5 h-3.5 fill-[#EBA9B5] text-[#EBA9B5]" />
              <span className="font-semibold">{selectedProduct.likes + (isLiked ? 1 : 0)} disukai</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#EAF2FD] leading-relaxed mb-3">
            {selectedProduct.description}
          </p>

          {/* Ingredients list */}
          <div className="mb-3">
            <p className="text-[10px] font-bold text-[#EBA9B5] uppercase tracking-wider mb-0.5">
              Komposisi & Bumbu:
            </p>
            <p className="text-[11px] text-[#BED7F7] leading-normal italic">
              {selectedProduct.ingredients}
            </p>
          </div>

          {/* Notes Input */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-[#EBA9B5] uppercase tracking-wider mb-1">
              Catatan Pesanan (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Saus dipisah, es sedikit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#14325C] text-xs text-white placeholder-[#87A8D3] border border-[#2E5894] focus:outline-none focus:ring-1 focus:ring-[#EBA9B5]"
            />
          </div>

          {/* Bottom Action Row (Counter, Price, Order button) */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#2D5A9C]/60">
            {/* Quantity Pill Counter */}
            <div className="flex items-center border border-[#3A6BB2] rounded-full px-2.5 py-1 bg-[#173766]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 hover:text-[#EBA9B5] transition-colors"
                aria-label="Kurangi jumlah"
                disabled={!isAvailable}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-white">
                {isAvailable ? quantity : 0}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(remaining, q + 1))}
                className="p-1 hover:text-[#EBA9B5] transition-colors disabled:opacity-30"
                aria-label="Tambah jumlah"
                disabled={!isAvailable || quantity >= remaining}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total Price display */}
            <div className="text-right">
              <span className="text-[10px] text-[#A6C8F5] block">Total</span>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isAvailable ? formattedPrice : "Rp 0"}
              </span>
            </div>

            {/* Order / Add to Cart Button (MPink #EBA9B5 background) */}
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95 ${
                addedAnimation
                  ? "bg-emerald-500 text-white"
                  : isAvailable
                  ? "bg-[#EBA9B5] text-[#1E447C] hover:bg-[#f2bcc5] shadow-[#15315b]"
                  : "bg-gray-500 text-gray-200 cursor-not-allowed"
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Masuk!</span>
                </>
              ) : isAvailable ? (
                "Order"
              ) : (
                "Habis"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
