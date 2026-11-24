"use client";

import React, { useState } from "react";
import { CheckCircle2, MessageCircle, Copy, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function OrderSuccessModal() {
  const { latestOrder, setLatestOrder, setIsOrderHistoryOpen } = useApp();
  const [copiedId, setCopiedId] = useState(false);

  if (!latestOrder) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(latestOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(latestOrder.totalPrice);

  const waItemsText = latestOrder.items
    .map((item) => `- ${item.productName} (${item.quantity}x) = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`)
    .join("\n");

  const deliveryMethodText =
    latestOrder.orderType === "delivery"
      ? `Diantar ke ${latestOrder.deliveryLocation || "Kelas"}`
      : "Ambil Sendiri di Stand";

  const paymentMethodText =
    latestOrder.paymentMethod === "qris"
      ? "QRIS"
      : latestOrder.paymentMethod === "transfer"
      ? "Transfer Bank"
      : "Tunai / COD";

  const messageText = `Halo NekoFrost! Saya mau konfirmasi pesanan:
Kode Pesanan: *#${latestOrder.id}*
Nama: *${latestOrder.customerName}*
No. WA: *${latestOrder.customerPhone}*
Metode Pengambilan: *${deliveryMethodText}*
Metode Pembayaran: *${paymentMethodText}*

*Daftar Pesanan:*
${waItemsText}

*Total: ${formattedTotal}*
Catatan: ${latestOrder.notes || "-"}

Mohon segera diproses ya kak, terima kasih!`;

  const waUrlThalita = `https://wa.me/6281211596287?text=${encodeURIComponent(messageText)}`;
  const waUrlGeanda = `https://wa.me/6285835519729?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#F1EDE1] rounded-3xl shadow-2xl p-6 border border-[#E2DDD0] text-center">
        {/* Success Icon with Sea Breeze & MPink badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-xl font-serif font-bold text-[#1E447C]">
          Pesanan Berhasil Dibuat!
        </h2>
        <p className="text-xs text-[#67778E] mt-1">
          Terima kasih sudah memesan di NekoFrost
        </p>

        {/* Invoice Card */}
        <div className="my-5 p-4 bg-white rounded-2xl border border-[#E2DDD0] text-left space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D8]">
            <div>
              <span className="text-[10px] text-[#7C8B9E] uppercase tracking-wider block font-semibold">
                Kode Pesanan
              </span>
              <span className="text-base font-mono font-bold text-[#2B5EA9]">
                #{latestOrder.id}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded-lg bg-[#F1EDE1] text-[#2B5EA9] hover:bg-[#2B5EA9] hover:text-white transition-colors"
              title="Salin Kode Pesanan"
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-[#445366]">
            <div className="flex justify-between">
              <span className="text-[#7C8B9E]">Pemesan:</span>
              <span className="font-semibold text-[#1E447C]">{latestOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C8B9E]">Metode Pengambilan:</span>
              <span className="font-semibold text-[#1E447C]">
                {deliveryMethodText}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C8B9E]">Metode Pembayaran:</span>
              <span className="font-semibold text-[#2B5EA9]">
                {paymentMethodText}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#EAE5D8] text-sm font-bold text-[#1E447C]">
              <span>Total:</span>
              <span>{formattedTotal}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Call to Action (Both CPs) */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#67778E] text-left">
            Kirim Konfirmasi Pesanan ke WhatsApp:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={waUrlThalita}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span>WA Thalita</span>
            </a>

            <a
              href={waUrlGeanda}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span>WA Geanda</span>
            </a>
          </div>

          <button
            onClick={() => {
              setLatestOrder(null);
              setIsOrderHistoryOpen(true);
            }}
            className="w-full mt-1 py-2.5 rounded-full text-xs font-bold text-[#2B5EA9] bg-white border border-[#2B5EA9]/30 hover:bg-[#FAF8F2] transition-colors"
          >
            Lihat Status di &quot;Pesanan Saya&quot;
          </button>

          <button
            onClick={() => setLatestOrder(null)}
            className="w-full py-2 rounded-full text-xs font-semibold text-[#67778E] hover:text-[#1E447C] hover:bg-white/60 transition-colors"
          >
            Selesai & Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );
}
