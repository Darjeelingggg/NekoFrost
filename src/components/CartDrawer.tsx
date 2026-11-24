"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    setIsCheckoutOpen,
    getProductStock,
  } = useApp();

  const [mounted, setMounted] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setAnimatingOut(false);
      const timer = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isCartOpen]);

  if (!isCartOpen && !animatingOut) return null;

  const handleClose = () => {
    setAnimatingOut(true);
    setMounted(false);
    setTimeout(() => {
      setAnimatingOut(false);
      setIsCartOpen(false);
    }, 320);
  };

  const handleProceedToCheckout = () => {
    setAnimatingOut(true);
    setMounted(false);
    setTimeout(() => {
      setAnimatingOut(false);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }, 280);
  };

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cartTotal);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-out ${
        mounted && !animatingOut ? "bg-black/55 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
    >
      {/* Click outside to close smoothly */}
      <div className="flex-1 cursor-pointer" onClick={handleClose} />

      {/* Drawer Container with Silky Smooth Slide-In Animation */}
      <div
        className={`relative w-full max-w-md h-full bg-[#F1EDE1] shadow-2xl flex flex-col justify-between border-l border-[#E2DDD0] transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted && !animatingOut ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2DDD0] flex items-center justify-between bg-[#F1EDE1]">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white border border-[#E2DDD0] flex items-center justify-center text-[#2B5EA9] hover:bg-[#FAF8F2] hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#1E447C]">
              Keranjang Pesanan
            </h2>
            <span className="text-[11px] text-[#7C8B9E] font-medium">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} porsi dipilih
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-white border border-[#E2DDD0] flex items-center justify-center text-[#2B5EA9] shadow-xs">
            <ShoppingBag className="w-5 h-5 text-[#2B5EA9]" />
          </div>
        </div>

        {/* Cart Items List with Staggered Slide-In Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7C8B9E] animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-inner">
                <ShoppingBag className="w-8 h-8 text-[#A6B8D0]" />
              </div>
              <p className="font-bold text-[#1E447C]">Keranjang masih kosong</p>
              <p className="text-xs text-[#7C8B9E] mt-1 max-w-xs">
                Pilih menu NekoFrost favoritmu dan klik tombol Pesan!
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const itemTotal = item.product.price * item.quantity;
              const formattedItemTotal = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(itemTotal);

              const remaining = getProductStock(item.product.id);
              const exceedsStock = item.quantity > remaining;

              return (
                <div
                  key={item.product.id}
                  style={{
                    animation: mounted && !animatingOut ? "itemCardSlideIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) backwards" : undefined,
                    animationDelay: `${idx * 60}ms`,
                  }}
                  className={`bg-white rounded-3xl p-4 border shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 relative ${
                    exceedsStock ? "border-rose-400 bg-rose-50/30" : "border-[#E2DDD0]"
                  }`}
                >
                  {/* Floating Food Thumbnail */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF8F2] flex-shrink-0 border border-[#E8E3D8] shadow-sm p-1.5 flex items-center justify-center">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1E447C] truncate leading-tight">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-[#7C8B9E] mt-0.5">
                      Rp {item.product.price.toLocaleString("id-ID")} / porsi
                    </p>

                    {exceedsStock && (
                      <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                        ⚠️ Stok hanya sisa {remaining} porsi!
                      </span>
                    )}

                    {item.notes && (
                      <p className="text-[10px] text-[#2B5EA9] italic truncate mt-0.5">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}

                    {/* Stepper & Subtotal Row */}
                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#D0D9E6] rounded-full px-2 py-0.5 bg-[#F8FAFC]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#2B5EA9] hover:text-[#EBA9B5] transition-colors active:scale-80"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#1E447C]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= remaining}
                          className="p-1 text-[#2B5EA9] hover:text-[#EBA9B5] transition-colors active:scale-80 disabled:opacity-30"
                          aria-label="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for this item */}
                      <span className="text-xs sm:text-sm font-black text-[#2B5EA9]">
                        {formattedItemTotal}
                      </span>
                    </div>
                  </div>

                  {/* Delete Trash Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-[#A6B8D0] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with animated checkout CTA */}
        {cart.length > 0 && (() => {
          const hasExceededItems = cart.some((i) => i.quantity > getProductStock(i.product.id));

          return (
            <div className="p-5 border-t border-[#E2DDD0] bg-white rounded-t-3xl shadow-[0_-10px_20px_-5px_rgba(43,94,169,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-sm text-[#7C8B9E] font-medium">
                  Total Tagihan ({cart.reduce((s, i) => s + i.quantity, 0)} item)
                </span>
                <span className="text-lg sm:text-xl font-black text-[#1E447C]">
                  {formattedTotal}
                </span>
              </div>

              {hasExceededItems && (
                <p className="text-xs text-rose-600 font-bold mb-3 text-center">
                  Beberapa menu melebihi sisa stok. Silakan kurangi porsi.
                </p>
              )}

              <button
                onClick={handleProceedToCheckout}
                disabled={hasExceededItems}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  hasExceededItems
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-[#2B5EA9] text-white hover:bg-[#1E447C] hover:shadow-xl active:scale-98 cursor-pointer"
                }`}
              >
                <span>{hasExceededItems ? "Sesuaikan Keranjang Dulu" : "Lanjut ke Pembayaran"}</span>
                <ArrowRight className="w-4 h-4 text-[#EBA9B5]" />
              </button>
            </div>
          );
        })()}
      </div>

      {/* Embedded CSS Keyframe Animation for Cart Item Cards */}
      <style jsx>{`
        @keyframes itemCardSlideIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
