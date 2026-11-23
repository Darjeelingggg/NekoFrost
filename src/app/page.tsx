"use client";

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import OrderHistoryModal from "@/components/OrderHistoryModal";
import SignatureSpotlight from "@/components/SignatureSpotlight";
import ToastNotification from "@/components/ToastNotification";
import MarqueeTicker from "@/components/MarqueeTicker";
import BrandPatterns from "@/components/BrandPatterns";
import LoadingScreen from "@/components/LoadingScreen";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useApp } from "@/context/AppContext";
import { Search, ShoppingBag, Sparkles, ArrowRight, Plus, X, Flame, ShieldCheck, Heart, QrCode, MapPin, CheckCircle2, ChevronRight } from "lucide-react";
import { Product } from "@/types";

export default function HomePage() {
  const {
    products,
    activeCategory,
    cartCount,
    cartTotal,
    setIsCartOpen,
    setSelectedProduct,
    addToCart,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [mascotQuoteIndex, setMascotQuoteIndex] = useState(0);

  const mascotQuotes = [
    "Paket Komplit lagi hemat Rp 6.000!",
    "Ayam crispy tanpa tulang, praktis dimakan ke kelas.",
    "Cuaca panas? Yuzu Lemon dingin siap bikin segar.",
    "Siap diantar sampai depan kelas kamu.",
    "Cocol saus keju creamy biar makin nikmat.",
  ];

  // Split into Bundles (Paket) and Satuan
  const bundleProducts = products.filter((p) => p.category === "paket");
  const singleProducts = products.filter((p) => p.category !== "paket");

  // Filtering products
  const filteredProducts = products.filter((item) => {
    const categoryMatch =
      activeCategory === "all" || item.category === activeCategory;

    const searchMatch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cartTotal);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F1EDE1] text-[#1E2D44] relative selection:bg-[#EBA9B5] selection:text-[#1E447C] overflow-x-hidden">
      {/* Brand App Loading Screen on Entrance */}
      <LoadingScreen />

      <BrandPatterns />

      <div className="relative z-10">
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6">
          {/* Hero Section: Character-driven, warm, and authentic */}
          <section className="rounded-3xl bg-[#2B5EA9] text-white p-5 sm:p-7 shadow-lg relative overflow-hidden border border-[#3E6FB2]">
            {/* Playful background decorative blurs & patterns */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#3D72BF]/40 pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#1E447C]/60 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                {/* Status Indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stand Buka • Siap Antar ke Kelas</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight text-white">
                  Crispy Bite, Big Happiness.
                </h1>
                <p className="text-xs sm:text-sm text-[#D5E3F7] mt-2 leading-relaxed max-w-md">
                  Ayam krispi tanpa tulang berpadu kentang goreng renyah dan segarnya Yuzu Lemon dingin. Bikin nugas makin semangat!
                </p>

                {/* Search Bar (Screen 1 Inspiration) */}
                <div className="relative mt-4 max-w-sm">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8BAFD8]" />
                  <input
                    type="text"
                    placeholder="Cari menu NekoFrost (ayam, kentang, risol, yuzu)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs bg-[#1A3F75] text-white placeholder-[#8BAFD8] border border-[#3E6FB2] focus:outline-none focus:ring-2 focus:ring-[#EBA9B5] shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-[#8BAFD8] hover:text-white transition-colors"
                      aria-label="Bersihkan pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Mascot & Clean Speech Bubble (Side-by-Side, No Clipping) */}
              <div className="hidden md:flex items-center gap-3 relative z-10 flex-shrink-0">
                {/* Speech Bubble cleanly positioned to the left of the cat */}
                <div
                  onClick={() => setMascotQuoteIndex((prev) => (prev + 1) % mascotQuotes.length)}
                  className="relative bg-white text-[#1E447C] px-3.5 py-2.5 rounded-2xl shadow-md border border-[#EBA9B5] text-[11px] font-bold max-w-[190px] leading-snug cursor-pointer hover:scale-105 transition-transform select-none"
                  title="Klik untuk ganti pesan maskot"
                >
                  <p>&ldquo;{mascotQuotes[mascotQuoteIndex]}&rdquo;</p>
                  <span className="text-[9px] text-[#2B5EA9] block mt-1 font-semibold">
                    Klik maskot
                  </span>
                  {/* Speech bubble tail pointing right to the cat */}
                  <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-t border-r border-[#EBA9B5]" />
                </div>

                {/* Cat Mascot */}
                <div
                  onClick={() => setMascotQuoteIndex((prev) => (prev + 1) % mascotQuotes.length)}
                  className="relative w-28 h-28 lg:w-32 lg:h-32 flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200"
                  title="Klik aku untuk ganti ucapan!"
                >
                  <Image
                    src="/images/logo.png"
                    alt="NekoFrost Logo Resmi"
                    fill
                    sizes="(max-width: 1024px) 112px, 128px"
                    className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Running Japanese Street-Food Marquee Ticker */}
          <MarqueeTicker />

          {/* Category Navigation Bar */}
          <CategoryNav />

          {/* IF "ALL" IS SELECTED: Show Section 1 (Paket Bundling / "Nos forfait") + Section 2 (Menu Satuan / "Nos Produits") */}
          {activeCategory === "all" && !searchQuery.trim() ? (
            <div className="space-y-8">
              {/* EDITORIAL SPOTLIGHT: Alternating Showcase for Chichick & Yuzu */}
              <SignatureSpotlight />

              {/* SECTION 1: PAKET BUNDLING & HEMAT (Blue Apron Wave-Block Reference) */}
              <section className="relative rounded-[2.5rem] bg-gradient-to-br from-[#1E447C] via-[#245396] to-[#2B5EA9] p-5 sm:p-7 md:p-8 text-white shadow-xl overflow-hidden border border-[#3E6FB2]">
                {/* Organic Decorative Glows */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#EBA9B5]/10 blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Header Row with High Contrast */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
                    <div>
                      <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-[#EBA9B5] text-[#1E447C] inline-block mb-1.5 shadow-xs">
                        Pilihan Bundling Cuan
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
                        Paket Bundling &amp; Komplit
                      </h2>
                      <p className="text-xs sm:text-sm text-[#D5E3F7] mt-0.5">
                        Kombinasi lengkap ayam crispy + kentang atau minuman segar, hemat s/d Rp 6.000!
                      </p>
                    </div>
                    <span className="self-start sm:self-center text-xs font-bold text-white/90 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-xs">
                      Paling Kenyang &amp; Hemat
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-1">
                    {bundleProducts.map((bundle) => {
                      const formattedBundlePrice = new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(bundle.price);

                      return (
                        <div
                          key={bundle.id}
                          onClick={() => setSelectedProduct(bundle)}
                          className="bg-white text-[#1E2D44] rounded-3xl p-4 sm:p-5 border border-white shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {bundle.promoBadge && (
                                <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-[#EBA9B5] text-[#1E447C] mb-1.5 shadow-xs">
                                  {bundle.promoBadge}
                                </span>
                              )}
                              <h3 className="text-sm sm:text-base font-bold text-[#1E447C] leading-snug group-hover:text-[#2B5EA9] transition-colors">
                                {bundle.name}
                              </h3>
                              <p className="text-[11px] text-[#67778E] mt-1 line-clamp-2 leading-relaxed">
                                {bundle.description}
                              </p>
                            </div>

                            {/* Floating Image */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FAF8F2] flex-shrink-0 border border-[#E8E3D8] shadow-sm p-1">
                              <Image
                                src={bundle.image}
                                alt={bundle.name}
                                fill
                                sizes="96px"
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EFEBE1]">
                            <span className="text-sm sm:text-base font-black text-[#2B5EA9]">
                              {formattedBundlePrice}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(bundle, 1);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2B5EA9] text-white text-xs font-bold hover:bg-[#EBA9B5] hover:text-[#1E447C] transition-colors shadow-xs active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Pesan</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* SECTION 2: MENU SATUAN ("Nos Produits" Screen 1 Reference) */}
              <section className="space-y-3.5">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E2DDD0] shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#2B5EA9] text-white">
                      Menu Satuan
                    </span>
                    <span className="text-xs font-bold text-[#2B5EA9]">
                      Crispy &amp; Fresh Everyday
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-serif font-black text-[#1E447C] tracking-tight mt-1">
                    Pilihan Menu Satuan
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#67778E]">
                    Ayam boneless renyah, kentang bumbu gurih, risol manis, &amp; Yuzu Lemon dingin.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
                  {singleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>

              {/* SECTION 3: PANDUAN CARA PESAN */}
              <section className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E2DDD0] shadow-sm relative overflow-hidden">
                <div className="text-center max-w-lg mx-auto mb-6">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#EAF2FD] text-[#1E447C] inline-block mb-1.5">
                    Mudah &amp; Praktis
                  </span>
                  <h2 className="text-lg sm:text-xl font-serif font-black text-[#1E447C] tracking-tight">
                    Langkah-Langkah Pemesanan
                  </h2>
                  <p className="text-xs text-[#67778E] mt-1">
                    Hanya 4 langkah mudah untuk menikmati hidangan hangat &amp; renyah NekoFrost di kelasmu!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EBE6D8] flex flex-col items-center text-center relative group hover:border-[#2B5EA9] transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E447C] text-white flex items-center justify-center font-black text-sm mb-3 shadow-sm group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-[#EBA9B5]" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#2B5EA9] tracking-wider mb-0.5">Langkah 1</span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1E447C]">Pilih Menu Favorit</h3>
                    <p className="text-[11px] text-[#67778E] mt-1 leading-relaxed">
                      Pilih menu satuan atau paket bundling hemat, tentukan jumlahnya, lalu klik &quot;+ Pesan&quot;.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EBE6D8] flex flex-col items-center text-center relative group hover:border-[#2B5EA9] transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E447C] text-white flex items-center justify-center font-black text-sm mb-3 shadow-sm group-hover:scale-105 transition-transform">
                      <MapPin className="w-6 h-6 text-[#EBA9B5]" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#2B5EA9] tracking-wider mb-0.5">Langkah 2</span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1E447C]">Isi Data &amp; Lokasi</h3>
                    <p className="text-[11px] text-[#67778E] mt-1 leading-relaxed">
                      Isi nama lengkap, nomor WhatsApp, serta gedung dan ruang kelas tujuan pengantaran.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EBE6D8] flex flex-col items-center text-center relative group hover:border-[#2B5EA9] transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E447C] text-white flex items-center justify-center font-black text-sm mb-3 shadow-sm group-hover:scale-105 transition-transform">
                      <QrCode className="w-6 h-6 text-[#EBA9B5]" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#2B5EA9] tracking-wider mb-0.5">Langkah 3</span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1E447C]">Bayar &amp; Upload Bukti</h3>
                    <p className="text-[11px] text-[#67778E] mt-1 leading-relaxed">
                      Scan QRIS GoPay Merchant atau Transfer Bank, lalu lampirkan screenshot bukti transfer.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EBE6D8] flex flex-col items-center text-center relative group hover:border-[#2B5EA9] transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E447C] text-white flex items-center justify-center font-black text-sm mb-3 shadow-sm group-hover:scale-105 transition-transform">
                      <CheckCircle2 className="w-6 h-6 text-[#EBA9B5]" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#2B5EA9] tracking-wider mb-0.5">Langkah 4</span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1E447C]">Pesanan Diantar</h3>
                    <p className="text-[11px] text-[#67778E] mt-1 leading-relaxed">
                      Duduk santai di kelas! Makanan dimasak fresh hangat dan segera diantar tepat waktu.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* IF SPECIFIC CATEGORY IS SELECTED OR SEARCHING: Clean Grid */
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-[#7C8B9E] bg-white rounded-3xl border border-[#E2DDD0] shadow-xs">
                  <p className="text-sm font-bold text-[#1E447C]">Tidak ada menu yang sesuai</p>
                  <p className="text-xs mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Cart Bar for Mobile Screen */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 sm:hidden animate-slideUp">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#1E447C] text-white flex items-center justify-between shadow-2xl border border-[#325D98] active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#EBA9B5]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EBA9B5] text-[#1E447C] text-[10px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-xs font-bold">Lihat Keranjang</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#EAF2FD]">{formattedTotal}</span>
              <span className="text-xs font-bold text-[#1E447C] bg-[#EBA9B5] px-2.5 py-1 rounded-full shadow-sm">
                Checkout &rarr;
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E2DDD0] py-6 bg-[#E8E2D2] text-center text-xs text-[#67778E] mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="NekoFrost Logo"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div className="relative h-6 w-24">
              <Image
                src="/images/brand-text.png"
                alt="NekoFrost"
                fill
                sizes="96px"
                className="object-contain object-left"
              />
            </div>
            <span className="text-[11px] text-[#7C8B9E] hidden md:inline">• Crispy Bite, Big Happiness</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-[11px] text-[#7C8B9E]">
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2 font-bold text-emerald-700">
              <span className="text-[#7C8B9E] font-normal">CP:</span>
              <a
                href="https://wa.me/6281211596287?text=Halo%20Kak%20Thalita!%20Saya%20ingin%20tanya%20seputar%20pemesanan%20NekoFrost..."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 hover:underline"
              >
                Thalita (0812-1159-6287)
              </a>
              <span>•</span>
              <a
                href="https://wa.me/6285835519729?text=Halo%20Kak%20Geanda!%20Saya%20ingin%20tanya%20seputar%20pemesanan%20NekoFrost..."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-800 hover:underline"
              >
                Geanda (0858-3551-9729)
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Contact Person */}
      <WhatsAppButton />

      {/* Interactive Modals & Toast */}
      <ToastNotification />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderHistoryModal />
    </div>
  );
}
