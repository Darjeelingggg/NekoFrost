"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, Clock, MapPin, MessageCircle, PackageOpen, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { OrderStatus } from "@/types";

export default function OrderHistoryModal() {
  const { isOrderHistoryOpen, setIsOrderHistoryOpen, orders, products } = useApp();

  if (!isOrderHistoryOpen) return null;

  const statusBadges: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Menunggu" },
    cooking: { bg: "bg-blue-100", text: "text-blue-800", label: "Dimasak" },
    ready: { bg: "bg-purple-100", text: "text-purple-800", label: "Siap Diambil/Antar" },
    completed: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Selesai" },
    cancelled: { bg: "bg-rose-100", text: "text-rose-800", label: "Dibatalkan" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Container inspired by Screen 3 ("Mes Commandes") */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#F1EDE1] rounded-3xl shadow-2xl overflow-y-auto no-scrollbar border border-[#E2DDD0] flex flex-col justify-between">

        {/* Top Header */}
        <div className="sticky top-0 z-10 px-5 py-4 bg-[#F1EDE1]/95 backdrop-blur-sm border-b border-[#E2DDD0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrderHistoryOpen(false)}
              className="w-10 h-10 rounded-full bg-white border border-[#E2DDD0] flex items-center justify-center text-[#2B5EA9] hover:bg-[#FAF8F2] transition-colors shadow-xs"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1E447C] leading-tight">
                Pesanan Saya
              </h2>
              <span className="text-[11px] text-[#7C8B9E]">
                Riwayat & Status Pengantaran
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="w-9 h-9 rounded-full hover:bg-white/60 flex items-center justify-center text-[#7C8B9E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-[#7C8B9E]">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-inner">
                <PackageOpen className="w-8 h-8 text-[#A6B8D0]" />
              </div>
              <p className="font-bold text-[#1E447C]">Belum ada pesanan aktif</p>
              <p className="text-xs text-[#7C8B9E] mt-1 max-w-xs mx-auto">
                Pilih menu NekoFrost favoritmu dan buat pesanan sekarang!
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStatus = statusBadges[order.status];
              const formattedTotal = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(order.totalPrice);

              const formattedDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-[#E2DDD0] shadow-sm hover:shadow-md transition-shadow space-y-3.5"
                >
                  {/* Card Header: Order ID & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE1]">
                    <div>
                      <span className="text-[10px] text-[#7C8B9E] uppercase tracking-wider block font-medium">
                        Nomor Pesanan
                      </span>
                      <span className="text-base font-mono font-black text-[#1E447C]">
                        #{order.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Price & Location Meta */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7C8B9E]">Total Belanja:</span>
                      <span className="text-sm font-bold text-[#2B5EA9]">
                        {formattedTotal}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#55677D]">
                      <MapPin className="w-3.5 h-3.5 text-[#EBA9B5] flex-shrink-0" />
                      <span className="truncate">
                        {order.orderType === "delivery"
                          ? order.deliveryLocation || "Diantar"
                          : "Ambil di Lobby"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#7C8B9E] text-[11px]">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* List des Éléments (Row of food thumbnails like Screen 3!) */}
                  <div className="pt-2 border-t border-[#EFEBE1]">
                    <span className="text-[10px] font-bold text-[#7C8B9E] uppercase tracking-wider block mb-2">
                      Menu yang Dipesan ({order.items.reduce((s, i) => s + i.quantity, 0)} item)
                    </span>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {order.items.map((item, idx) => {
                        const matchingProduct = products.find((p) => p.id === item.productId);
                        const imgSrc = matchingProduct?.image || "/images/chichick-box.png";

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-[#FAF8F2] rounded-2xl p-2 border border-[#E8E3D8] flex-shrink-0"
                            title={`${item.productName} (${item.quantity}x)`}
                          >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border border-[#E2DDD0]">
                              <Image
                                src={imgSrc}
                                alt={item.productName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="text-[11px] pr-1">
                              <span className="font-bold text-[#1E447C] block truncate max-w-[100px]">
                                {item.productName}
                              </span>
                              <span className="text-[#7C8B9E] font-medium">
                                {item.quantity}x • Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white rounded-t-3xl border-t border-[#E2DDD0] text-center">
          <p className="text-[11px] text-[#7C8B9E]">
            Butuh bantuan? Silakan hubungi admin NekoFrost melalui WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
