"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  Clock,
  TrendingUp,
  Download,
  Phone,
  AlertCircle,
  Edit2,
  Lock,
  Plus,
  Trash2,
  RotateCw,
  Database,
  Eye,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { OrderStatus, Product } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    products,
    toggleProductAvailability,
    updateProduct,
    addProduct,
    refreshOrders,
    getProductStock,
    getProductOrderedQty,
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingProof, setViewingProof] = useState<{
    orderId: string;
    customerName: string;
    url: string;
  } | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");

  // New product modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"paket" | "boneless" | "beverages" | "snacks">("boneless");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("");

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("5");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "admin123" || pinInput === "1234" || pinInput === "kwu2026") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "cooking");

  const formattedRevenue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const handleExportCSV = () => {
    const headers = [
      "ID Pesanan",
      "Waktu",
      "Nama Pelanggan",
      "No WhatsApp",
      "Tipe Pengambilan",
      "Lokasi",
      "Menu Pesanan",
      "Total Belanja (Rp)",
      "Metode Pembayaran",
      "Status",
    ];

    const rows = orders.map((o) => {
      const itemsList = o.items.map((i) => `${i.productName} (${i.quantity}x)`).join(" | ");
      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString("id-ID")}"`,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        `"${o.orderType}"`,
        `"${o.deliveryLocation || "-"}"`,
        `"${itemsList}"`,
        o.totalPrice,
        `"${o.paymentMethod}"`,
        `"${o.status}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_penjualan_kwu_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      subCategory: "Menu Baru",
      price: parseInt(newProdPrice, 10) || 15000,
      description: newProdDesc || "Menu olahan spesial dari tim NekoFrost.",
      ingredients: "Bahan segar berkualitas pilihan.",
      portion: "1 Porsi",
      calories: "350 kcal",
      likes: 120,
      available: true,
      image: newProdImage || "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
    };

    addProduct(newProduct);
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
    setNewProdImage("");
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct({
      ...editingProduct,
      price: parseInt(editPrice, 10) || editingProduct.price,
      stock: parseInt(editStock, 10) || (editingProduct.stock ?? 5),
    });
    setEditingProduct(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F1EDE1] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DDD0] shadow-xl text-center">
          <div className="w-14 h-14 rounded-full bg-[#2B5EA9] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock className="w-6 h-6 text-[#EBA9B5]" />
          </div>

          <h1 className="text-xl font-serif font-bold text-[#1E447C]">
            Portal Khusus Admin
          </h1>
          <p className="text-xs text-[#7C8B9E] mt-1 mb-6">
            Eits, mau ngapain hayoo? Area terlarang nih, cuma tim NekoFrost yang boleh masuk!
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN Rahasia..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center px-4 py-3 rounded-2xl border border-[#D0D9E6] text-sm text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9] tracking-widest font-mono bg-[#F8FAFC]"
                autoFocus
              />
              {pinError && (
                <div className="mt-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Cieee mau ngintip ya? Salah PIN-nya wkwk!</span>
                  </p>
                  <p className="text-[10px] text-rose-500 mt-0.5">
                    Bukan admin mah minggir dulu bos, jajan Chichick dulu sana gih!
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#2B5EA9] text-white font-bold text-sm hover:bg-[#1E447C] transition-all shadow-md"
            >
              Masuk Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2DDD0]">
            <Link
              href="/"
              className="text-xs font-semibold text-[#7C8B9E] hover:text-[#2B5EA9] flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Pembeli</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1EDE1] text-[#1E2D44]">
      {/* Admin Navbar (Sea Breeze #2B5EA9) */}
      <header className="sticky top-0 z-30 bg-[#2B5EA9] text-white px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-full hover:bg-[#1E447C] transition-colors"
              title="Kembali ke Web Pembeli"
            >
              <ArrowLeft className="w-5 h-5 text-[#EBA9B5]" />
            </Link>

            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="NekoFrost Logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold leading-tight">
                Dashboard Admin SISFOR
              </h1>
              <p className="text-[11px] text-[#D8E6F8]">
                Sistem Informasi & Rekap Penjualan KWU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Supabase Cloud Sync Status Badge */}
            <div className="hidden md:flex items-center">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud: Supabase Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  Mode: Local
                </span>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshOrders();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1E447C] text-[#D8E6F8] hover:text-white transition-all border border-[#3E6FB2]"
              title="Refresh Data Pesanan"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#EBA9B5]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {orders.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Kosongkan semua data riwayat pesanan (reset ke 0)?")) {
                    clearOrders();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 transition-all border border-rose-400/30"
                title="Hapus / Reset semua riwayat pesanan"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden sm:inline">Reset Pesanan</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EBA9B5] text-[#1E447C] hover:bg-[#f2bcc5] transition-all shadow-sm"
              title="Download Data untuk Laporan Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel/CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1E447C] text-[#D8E6F8] hover:text-white"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2DDD0] shadow-sm">
            <div className="flex items-center justify-between text-[#7C8B9E] mb-2">
              <span className="text-xs font-semibold">Total Pendapatan</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-base sm:text-xl font-bold text-[#1E447C]">
              {formattedRevenue}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">
              Omzet Penjualan Aktif
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2DDD0] shadow-sm">
            <div className="flex items-center justify-between text-[#7C8B9E] mb-2">
              <span className="text-xs font-semibold">Total Pesanan</span>
              <ShoppingBag className="w-4 h-4 text-[#2B5EA9]" />
            </div>
            <span className="text-base sm:text-xl font-bold text-[#1E447C]">
              {orders.length}
            </span>
            <span className="text-[10px] text-[#2B5EA9] block mt-1 font-semibold">
              Transaksi Tercatat
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2DDD0] shadow-sm">
            <div className="flex items-center justify-between text-[#7C8B9E] mb-2">
              <span className="text-xs font-semibold">Perlu Diproses</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-base sm:text-xl font-bold text-[#1E447C]">
              {pendingOrders.length}
            </span>
            <span className="text-[10px] text-amber-600 block mt-1 font-semibold">
              Pesanan Menunggu/Masak
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2DDD0] shadow-sm">
            <div className="flex items-center justify-between text-[#7C8B9E] mb-2">
              <span className="text-xs font-semibold">Total Menu</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-base sm:text-xl font-bold text-[#1E447C]">
              {products.length} Menu
            </span>
            <span className="text-[10px] text-purple-600 block mt-1 font-semibold">
              {products.filter((p) => p.available).length} Menu Tersedia
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-[#DCD6C7] pb-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === "orders"
              ? "bg-[#2B5EA9] text-white shadow-sm"
              : "text-[#67778E] hover:bg-white/60"
              }`}
          >
            Manajemen Pesanan ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === "products"
              ? "bg-[#2B5EA9] text-white shadow-sm"
              : "text-[#67778E] hover:bg-white/60"
              }`}
          >
            Katalog Produk & Stok ({products.length})
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: "all", label: "Semua" },
                { id: "pending", label: "Menunggu" },
                { id: "cooking", label: "Sedang Dimasak" },
                { id: "ready", label: "Siap Diambil/Antar" },
                { id: "completed", label: "Selesai" },
                { id: "cancelled", label: "Dibatalkan" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === tab.id
                    ? "bg-[#2B5EA9] text-white font-bold"
                    : "bg-white text-[#67778E] border border-[#E2DDD0] hover:bg-[#F8FAFC]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E2DDD0] text-[#7C8B9E]">
                <ShoppingBag className="w-12 h-12 text-[#A6B8D0] mx-auto mb-2 opacity-50" />
                <p className="font-bold text-[#1E447C]">Tidak ada pesanan pada filter ini</p>
                <p className="text-xs mt-1">Pesanan baru yang dibuat oleh pembeli akan muncul otomatis di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const statusColors: Record<OrderStatus, { bg: string; text: string; label: string }> = {
                    pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Menunggu Konfirmasi" },
                    cooking: { bg: "bg-blue-100", text: "text-blue-800", label: "Sedang Dimasak" },
                    ready: { bg: "bg-purple-100", text: "text-purple-800", label: "Siap Diambil / Antar" },
                    completed: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Selesai" },
                    cancelled: { bg: "bg-rose-100", text: "text-rose-800", label: "Dibatalkan" },
                  };

                  const currentBadge = statusColors[order.status];
                  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
                  const waNumber = cleanPhone.startsWith("0")
                    ? "62" + cleanPhone.slice(1)
                    : cleanPhone;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2DDD0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono font-bold text-[#2B5EA9]">
                            #{order.id}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${currentBadge.bg} ${currentBadge.text}`}>
                            {currentBadge.label}
                          </span>
                          <span className="text-xs text-[#7C8B9E]">
                            {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB
                          </span>
                        </div>

                        <div className="text-xs text-[#445366] flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <b>Pemesan:</b> {order.customerName}
                          </span>
                          <span>
                            <b>Pengambilan:</b>{" "}
                            {order.orderType === "delivery"
                              ? `Antar ke ${order.deliveryLocation}`
                              : "Ambil di Lobby"}
                          </span>
                          <span>
                            <b>Pembayaran:</b> {order.paymentMethod.toUpperCase()}
                          </span>
                          {order.paymentProofUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setViewingProof({
                                  orderId: order.id,
                                  customerName: order.customerName,
                                  url: order.paymentProofUrl!,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors text-[11px] font-bold border border-emerald-300 shadow-xs active:scale-95"
                              title="Klik untuk melihat foto bukti transfer asli"
                            >
                              <Eye className="w-3 h-3 text-emerald-700" />
                              <span>Lihat Bukti Bayar</span>
                            </button>
                          )}
                        </div>

                        <div className="bg-[#FAF8F2] p-2.5 rounded-xl border border-[#E8E3D8] text-xs space-y-1">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between text-[#445366]">
                              <span>
                                {i.quantity}x {i.productName}
                              </span>
                              <span className="font-bold text-[#1E447C]">
                                Rp {(i.price * i.quantity).toLocaleString("id-ID")}
                              </span>
                            </div>
                          ))}
                          {order.notes && (
                            <p className="text-[11px] text-[#2B5EA9] italic pt-1 border-t border-[#E8E3D8]">
                              Catatan: &ldquo;{order.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#EFEBE1]">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-[#7C8B9E] block font-medium">Total Transaksi</span>
                          <span className="text-base font-bold text-[#1E447C]">
                            Rp {order.totalPrice.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#CBD7E8] bg-[#F4F8FC] text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                          >
                            <option value="pending">Menunggu Konfirmasi</option>
                            <option value="cooking">Sedang Dimasak</option>
                            <option value="ready">Siap Diambil/Antar</option>
                            <option value="completed">Selesai (Lunas)</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>

                          <a
                            href={`https://wa.me/${waNumber}?text=Halo%20kak%20${encodeURIComponent(order.customerName)},%20kami%20dari%20NekoFrost%20ingin%20mengonfirmasi%20pesanan%20%23${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                            title="Chat WhatsApp Pembeli"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              if (confirm(`Hapus pesanan #${order.id} dari ${order.customerName}?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-neutral-100 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Pesanan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS & STOCK MANAGEMENT */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#67778E]">
                Atur stok ketersediaan menu dan harga langsung dari sini.
              </p>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2B5EA9] text-white hover:bg-[#1E447C] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#EBA9B5]" />
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-4 border border-[#E2DDD0] shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#1E447C]">{prod.name}</h4>
                      <span className="text-[11px] text-[#7C8B9E] capitalize block">
                        {prod.category} • {prod.subCategory}
                      </span>
                      <span className="text-xs font-bold text-[#2B5EA9] mt-1 block">
                        Rp {prod.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setEditPrice(prod.price.toString());
                        setEditStock((prod.stock ?? 5).toString());
                      }}
                      className="p-1.5 rounded-lg text-[#7C8B9E] hover:text-[#2B5EA9] hover:bg-[#F4F8FC]"
                      title="Edit Menu & Stok"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(() => {
                    const remaining = getProductStock(prod.id);
                    const ordered = getProductOrderedQty(prod.id);
                    const base = prod.stock ?? 5;

                    return (
                      <div className="mt-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2DDD0]/80 text-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#7C8B9E] block uppercase font-bold">Stok Realtime</span>
                          <span className={`font-black ${remaining === 0 ? "text-rose-600" : remaining <= 2 ? "text-amber-600" : "text-emerald-700"}`}>
                            Sisa {remaining} / {base}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#7C8B9E] block uppercase font-bold">Terjual</span>
                          <span className="font-bold text-[#1E447C]">{ordered} porsi</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-3 pt-3 border-t border-[#EFEBE1] flex items-center justify-between">
                    <span className="text-xs text-[#67778E] font-medium">Status Menu:</span>
                    <button
                      onClick={() => toggleProductAvailability(prod.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${prod.available
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                    >
                      {prod.available ? "Tersedia" : "Habis"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Tambah Menu Baru */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E2DDD0] shadow-2xl">
              <h3 className="text-lg font-serif font-bold text-[#1E447C] mb-4">
                Tambah Menu Baru
              </h3>
              <form onSubmit={handleCreateProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#67778E] mb-1">
                    Nama Menu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket Combo Mantap"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0D9E6] text-xs text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#67778E] mb-1">
                      Kategori *
                    </label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D0D9E6] text-xs text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                    >
                      <option value="paket">Paket Bundling</option>
                      <option value="boneless">Boneless Chicken</option>
                      <option value="beverages">Minuman Yuzu</option>
                      <option value="snacks">Kentang Goreng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#67778E] mb-1">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 18000"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D0D9E6] text-xs text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#67778E] mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsi rasa atau porsi..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0D9E6] text-xs text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#67778E] mb-1">
                    URL Gambar (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0D9E6] text-xs text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2DDD0]">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7C8B9E] hover:bg-neutral-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2B5EA9] text-white hover:bg-[#1E447C]"
                  >
                    Simpan Menu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Menu & Stok Produk */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E2DDD0] shadow-2xl">
              <h3 className="text-base font-serif font-bold text-[#1E447C] mb-2">
                Edit Menu: {editingProduct.name}
              </h3>
              <form onSubmit={handleSaveEditProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#67778E] mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D9E6] text-sm font-bold text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#67778E] mb-1">
                    Batas Kuota / Stok Awal (Porsi)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D9E6] text-sm font-bold text-[#1E447C] focus:outline-none focus:ring-2 focus:ring-[#2B5EA9]"
                  />
                  <span className="text-[10px] text-[#7C8B9E] block mt-1">
                    Default 5 porsi. Sisa stok akan otomatis berkurang tiap ada yang order.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7C8B9E]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2B5EA9] text-white hover:bg-[#1E447C]"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Proof of Payment Viewer Modal */}
        {viewingProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E2DDD0] space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE1] flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold text-[#1E447C]">
                    Bukti Pembayaran #{viewingProof.orderId}
                  </h3>
                  <p className="text-xs text-[#7C8B9E]">
                    Pemesan: <b>{viewingProof.customerName}</b>
                  </p>
                </div>
                <button
                  onClick={() => setViewingProof(null)}
                  className="p-1.5 rounded-full hover:bg-[#F1EDE1] text-[#7C8B9E] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-[#FAF8F2] border border-[#E2DDD0] flex-1 flex items-center justify-center p-2 min-h-[280px]">
                {viewingProof.url.startsWith("data:") || viewingProof.url.startsWith("http") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={viewingProof.url}
                    alt="Bukti Transfer Pembeli"
                    className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="p-8 text-center text-[#7C8B9E]">
                    <p className="text-sm font-semibold text-[#1E447C]">File Bukti: {viewingProof.url}</p>
                    <p className="text-xs mt-1 text-amber-600">
                      Pesanan ini dibuat sebelum sistem gambar live diaktifkan. Pesanan baru berikutnya akan langsung menampilkan foto screenshot bukti transfer di sini!
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 flex-shrink-0">
                {viewingProof.url.startsWith("data:") && (
                  <a
                    href={viewingProof.url}
                    download={`bukti_bayar_${viewingProof.orderId}.jpg`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-300"
                  >
                    Unduh Foto Bukti
                  </a>
                )}
                <button
                  onClick={() => setViewingProof(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2B5EA9] text-white text-xs font-bold hover:bg-[#1E447C] transition-colors"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
