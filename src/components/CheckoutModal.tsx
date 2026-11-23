"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  QrCode,
  CreditCard,
  Banknote,
  Copy,
  Check,
  MapPin,
  Clock,
  UploadCloud,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CheckoutModal() {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartTotal, createOrder } =
    useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "transfer" | "cash">("qris");
  const [proofFileName, setProofFileName] = useState("");
  const [proofDataUrl, setProofDataUrl] = useState("");
  const [isReadingProof, setIsReadingProof] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cartTotal);

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFileName(file.name);
      setIsReadingProof(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) {
          setIsReadingProof(false);
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxDim = 800;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL("image/jpeg", 0.75);
              setProofDataUrl(compressed);
            } else {
              setProofDataUrl(rawUrl);
            }
          } catch (err) {
            setProofDataUrl(rawUrl);
          } finally {
            setIsReadingProof(false);
          }
        };
        img.onerror = () => {
          setProofDataUrl(rawUrl);
          setIsReadingProof(false);
        };
        img.src = rawUrl;
      };
      reader.onerror = () => {
        setIsReadingProof(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Mohon isi nama dan nomor WhatsApp Anda.");
      return;
    }
    if (orderType === "delivery" && !deliveryLocation.trim()) {
      alert("Mohon cantumkan lokasi pengantaran (Kelas/Lantai/Lobby).");
      return;
    }
    if (paymentMethod !== "cash" && !proofDataUrl) {
      if (isReadingProof) {
        alert("Foto bukti pembayaran sedang diproses, silakan tunggu sebentar dan klik lagi.");
      } else {
        alert("PENTING: Wajib lampirkan foto bukti pembayaran transfer / QRIS terlebih dahulu!");
      }
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      createOrder({
        customerName,
        customerPhone,
        orderType,
        deliveryLocation: orderType === "delivery" ? deliveryLocation : "Ambil di Stand",
        notes,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          notes: item.notes,
        })),
        totalPrice: cartTotal,
        paymentMethod,
        paymentProofUrl: proofDataUrl || undefined,
      });

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] bg-[#F1EDE1] rounded-3xl shadow-2xl overflow-y-auto no-scrollbar border border-[#E2DDD0]">

        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-[#F1EDE1]/95 backdrop-blur-sm border-b border-[#E2DDD0] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1E447C]">
              Checkout Pesanan
            </h2>
            <p className="text-xs text-[#7C8B9E]">
              Pemesanan Mudah & Praktis
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/60 text-[#2B5EA9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
          {/* Section 1: Customer Info */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2DDD0] space-y-3">
            <h3 className="text-xs font-bold text-[#1E447C] uppercase tracking-wider">
              1. Data Pemesan
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#67778E] mb-1">
                Nama Lengkap / Panggilan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Raihan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D9E6] text-sm text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9] bg-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#67778E] mb-1">
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D9E6] text-sm text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9] bg-[#F8FAFC]"
              />
              <span className="text-[10px] text-[#8C9BAE] mt-0.5 block">
                Notifikasi dan konfirmasi pesanan akan dikirim ke nomor ini.
              </span>
            </div>
          </div>

          {/* Section 2: Order Type */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2DDD0] space-y-3">
            <h3 className="text-xs font-bold text-[#1E447C] uppercase tracking-wider">
              2. Metode Pengambilan
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${orderType === "pickup"
                  ? "border-[#2B5EA9] bg-[#2B5EA9] text-white shadow-sm"
                  : "border-[#D0D9E6] bg-[#F8FAFC] text-[#1E447C] hover:border-[#2B5EA9]/50"
                  }`}
              >
                <Clock className="w-5 h-5 mb-1.5 text-[#EBA9B5]" />
                <div>
                  <span className="text-xs font-bold block">Ambil Sendiri</span>
                  <span className={`text-[10px] block mt-0.5 ${orderType === "pickup" ? "text-gray-200" : "text-[#7C8B9E]"}`}>
                    Di Lobby
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${orderType === "delivery"
                  ? "border-[#2B5EA9] bg-[#2B5EA9] text-white shadow-sm"
                  : "border-[#D0D9E6] bg-[#F8FAFC] text-[#1E447C] hover:border-[#2B5EA9]/50"
                  }`}
              >
                <MapPin className="w-5 h-5 mb-1.5 text-[#EBA9B5]" />
                <div>
                  <span className="text-xs font-bold block">Diantar (Delivery)</span>
                  <span className={`text-[10px] block mt-0.5 ${orderType === "delivery" ? "text-gray-200" : "text-[#7C8B9E]"}`}>
                    Kelas / Lobby
                  </span>
                </div>
              </button>
            </div>

            {orderType === "delivery" && (
              <div>
                <label className="block text-xs font-semibold text-[#67778E] mb-1">
                  Detail Lokasi Antar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 04.002"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D9E6] text-sm text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9] bg-[#F8FAFC]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#67778E] mb-1">
                Catatan Pesanan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Saus dipisah, es sedikit, tidak pakai sendok"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D9E6] text-sm text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9] bg-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2DDD0] space-y-3">
            <h3 className="text-xs font-bold text-[#1E447C] uppercase tracking-wider">
              3. Metode Pembayaran
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${paymentMethod === "qris"
                  ? "border-[#2B5EA9] bg-[#2B5EA9] text-white shadow-sm"
                  : "border-[#D0D9E6] bg-[#F8FAFC] text-[#1E447C]"
                  }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-[#EBA9B5]" />
                <span className="text-xs font-bold">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${paymentMethod === "transfer"
                  ? "border-[#2B5EA9] bg-[#2B5EA9] text-white shadow-sm"
                  : "border-[#D0D9E6] bg-[#F8FAFC] text-[#1E447C]"
                  }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-[#4176C4]" />
                <span className="text-xs font-bold">Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${paymentMethod === "cash"
                  ? "border-[#2B5EA9] bg-[#2B5EA9] text-white shadow-sm"
                  : "border-[#D0D9E6] bg-[#F8FAFC] text-[#1E447C]"
                  }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-[#10B981]" />
                <span className="text-xs font-bold">Tunai / COD</span>
              </button>
            </div>

            {/* QRIS Display */}
            {paymentMethod === "qris" && (
              <div className="mt-3 p-4 bg-[#F8F5EE] rounded-2xl border border-[#E2DDD0] flex flex-col items-center text-center">
                <div className="bg-white p-2.5 rounded-2xl shadow-md border border-[#D0D9E6] max-w-[240px]">
                  <div className="relative w-48 sm:w-52 h-64 sm:h-72 rounded-xl overflow-hidden shadow-inner bg-white">
                    <Image
                      src="/images/qris-nekofrost.jpg"
                      alt="QRIS NekoFrost - NEKOFROST, MAKANAN & MINU"
                      fill
                      sizes="208px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <p className="text-xs font-bold text-[#1E447C] mt-2.5">
                  NEKOFROST, MAKANAN &amp; MINU
                </p>
                <p className="text-[11px] text-[#67778E] mt-0.5">
                  NMID: ID1026640476507 • Terima QRIS dari GoPay, BCA, Mandiri, BNI, BRI, OVO, Dana, dll.
                </p>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-2">
                  Total Bayar: {formattedTotal}
                </span>
              </div>
            )}

            {/* Transfer Bank & E-Wallet Display */}
            {paymentMethod === "transfer" && (
              <div className="mt-3 p-4 bg-[#F8F5EE] rounded-2xl border border-[#E2DDD0] space-y-2.5">
                {/* GoPay / e-Wallet */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#D0D9E6]">
                  <div>
                    <span className="text-[11px] text-[#7C8B9E] block font-medium">
                      GoPay / e-Wallet
                    </span>
                    <span className="text-sm font-mono font-bold text-[#2B5EA9]">
                      0813 8449 3122
                    </span>
                    <span className="text-[10px] text-[#7C8B9E] block">
                      a.n. Raihan Ananta Maulana
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount("081384493122")}
                    className="p-2 rounded-lg bg-[#F1EDE1] text-[#2B5EA9] hover:bg-[#2B5EA9] hover:text-white transition-colors"
                    title="Salin Nomor GoPay"
                  >
                    {copiedAccount ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Upload Bukti Pembayaran (WAJIB untuk QRIS & Transfer) */}
            {paymentMethod !== "cash" && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#D0D9E6] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1E447C] flex items-center gap-1">
                    <span>Upload Bukti Pembayaran</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${proofFileName
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-50 text-rose-600 border-rose-300 animate-pulse"
                      }`}
                  >
                    {proofFileName ? "Foto Terlampir" : "Wajib Diunggah *"}
                  </span>
                </div>

                <label
                  className={`flex items-center justify-center gap-2.5 p-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${proofFileName
                    ? "border-emerald-400 bg-emerald-50/50 text-emerald-800"
                    : "border-rose-300 bg-white hover:bg-rose-50/30 text-[#67778E]"
                    }`}
                >
                  {proofFileName ? (
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <UploadCloud className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                  <div className="text-left overflow-hidden">
                    <span className="text-xs font-semibold block truncate max-w-[240px]">
                      {proofFileName || "Pilih screenshot bukti transfer / QRIS..."}
                    </span>
                    <span className="text-[10px] text-[#8C9BAE] block">
                      {proofFileName
                        ? "Klik untuk mengganti foto bukti"
                        : "Wajib lampirkan bukti pembayaran yang sah"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Instant Image Preview Thumbnail */}
                {proofDataUrl && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-emerald-400 bg-black/5 flex items-center justify-center p-1.5 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proofDataUrl}
                      alt="Pratinjau Bukti Transfer"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Foto Terverifikasi</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary & Submit Button */}
          <div className="pt-2">
            <div className="bg-[#1E447C] text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3 text-xs text-[#C8DCF7]">
                <span>Total Rincian ({cart.reduce((s, i) => s + i.quantity, 0)} porsi)</span>
                <span className="text-sm font-bold text-white">{formattedTotal}</span>
              </div>

              {/* Warning if cashless but proof is missing */}
              {paymentMethod !== "cash" && !proofDataUrl && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#EBA9B5] flex-shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">
                    Wajib upload bukti pembayaran QRIS/Transfer di atas untuk melanjutkan pesanan.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (paymentMethod !== "cash" && !proofDataUrl)}
                className={`w-full py-3.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${paymentMethod !== "cash" && !proofDataUrl
                  ? "bg-[#617B9F] text-[#D8E6F8] cursor-not-allowed opacity-60"
                  : "bg-[#EBA9B5] text-[#1E447C] hover:bg-[#f2bcc5]"
                  }`}
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <span>Selesaikan &amp; Buat Pesanan</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
