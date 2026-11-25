"use client";

import React from "react";
import Image from "next/image";
import { Plus, Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useApp } from "@/context/AppContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setSelectedProduct, addToCart, cart, likedProductIds, toggleLike, getProductStock, isProductAvailable, hasStockLimit } = useApp();

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.price);

  const isPngGraphic =
    product.image.endsWith(".png") || product.image.includes("yuzu-cup");

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isLiked = likedProductIds.includes(product.id);
  const likesCount = (product.likes || 120) + (isLiked ? 1 : 0);

  const remainingStock = getProductStock(product.id);
  const isAvailable = isProductAvailable(product.id);

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-3xl p-4 sm:p-5 cursor-pointer transition-all duration-200 border border-[#E2DDD0] hover:border-[#2B5EA9]/40 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden h-full"
    >
      {/* Top Meta Badges & Like Button */}
      <div className="flex items-center justify-between z-10 mb-2 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isAvailable ? (
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              Habis
            </span>
          ) : hasStockLimit(product.id) ? (
            remainingStock <= 2 ? (
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                Sisa {remainingStock}!
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2B5EA9] text-white">
                Sisa {remainingStock}
              </span>
            )
          ) : (
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2B5EA9] text-white">
              Ready
            </span>
          )}

          {product.promoBadge && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#EBA9B5] text-[#1E447C] whitespace-nowrap shadow-xs">
              {product.promoBadge}
            </span>
          )}

          {cartItem && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2FD] text-[#2B5EA9] border border-[#CBDDF7] flex items-center gap-1">
              <ShoppingBag className="w-2.5 h-2.5" />
              <span>x{cartItem.quantity}</span>
            </span>
          )}
        </div>

        {/* Favorite Heart Interactive Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(product.id);
          }}
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F2] border border-[#E2DDD0] hover:border-[#EBA9B5] transition-all active:scale-125 cursor-pointer"
          title="Sukai menu ini"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all ${
              isLiked
                ? "fill-[#EBA9B5] text-[#EBA9B5] scale-110"
                : "text-[#8C9BAE] hover:text-[#EBA9B5]"
            }`}
          />
          <span className={isLiked ? "text-[#1E447C] font-black" : "text-[#8C9BAE]"}>
            {likesCount}
          </span>
        </button>
      </div>

      {/* Circular Food Image Container */}
      <div
        className="relative w-full aspect-square my-3 flex items-center justify-center mx-auto max-w-[180px] sm:max-w-[200px]"
        style={{ width: "100%", aspectRatio: "1 / 1", position: "relative" }}
      >
        <div
          className="relative w-full h-full rounded-full overflow-hidden p-2 shadow-[0_8px_20px_-6px_rgba(43,94,169,0.2)] group-hover:scale-105 transition-transform duration-300 bg-[#FAF8F2] border border-[#E8E3D8] flex items-center justify-center"
          style={{ width: "100%", height: "100%", borderRadius: "9999px", position: "relative" }}
        >
          {/* Subtle decorative culinary dashed ring inspired by reference */}
          <div className="absolute inset-1.5 rounded-full border border-dashed border-[#2B5EA9]/20 pointer-events-none" />

          <div className="relative w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 160px, 200px"
              className={
                isPngGraphic
                  ? "object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  : "object-cover rounded-full"
              }
              priority={false}
            />
          </div>
        </div>
      </div>

      {/* Info Content with Strict Vertical Alignment */}
      <div className="mt-1 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#1E447C] leading-snug line-clamp-1 group-hover:text-[#2B5EA9] transition-colors">
              {product.name}
            </h3>
            <span className="text-xs sm:text-sm font-black text-[#1E447C] whitespace-nowrap">
              {formattedPrice}
            </span>
          </div>
          <p className="text-xs text-[#67778E] line-clamp-2 leading-relaxed min-h-[2.25rem]">
            {product.description}
          </p>
        </div>

        {/* Bottom Action Row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EFEBE1]">
          <span className="text-[11px] text-[#8C9BAE] font-medium">
            {product.portion}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) {
                addToCart(product, 1);
              }
            }}
            disabled={!isAvailable}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
              isAvailable
                ? "bg-[#2B5EA9] text-white hover:bg-[#EBA9B5] hover:text-[#1E447C] active:scale-95 cursor-pointer"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAvailable ? "Pesan" : "Habis"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
