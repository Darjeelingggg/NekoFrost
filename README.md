# 🍗 Chichick & Drinks - Website Pemesanan Makanan (KWU & SISFOR)

Website sistem informasi penjualan makanan berbasis **Next.js (App Router)** dan **Tailwind CSS**, dirancang responsif untuk tampilan **Mobile & PC Desktop** dengan inspirasi desain bernuansa *aesthetic warm-beige & deep navy*. Siap dideploy ke **Vercel**.

---

## 🌟 Fitur Utama

### 🛒 1. POV Pembeli (Customer)
* **Tanpa Perlu Login (Guest Checkout)**: Pembeli langsung masuk dan melihat katalog menu makanan.
* **Tampilan Sesuai Referensi UI**:
  * Piring makanan melingkar (*top-down circular presentation*).
  * Kategori interaktif (Semua, Chichick Boneless, Minuman Yuzu, Kentang Goreng).
  * Filter varian rasa (Original, Pedas, Gurih, Best Seller, Fresh).
* **Modal Detail Produk**:
  * Menampilkan informasi porsi, kalori, deskripsi rasa, dan komposisi bumbu.
  * Counter jumlah pesanan `[-] 1 [+]` dan tombol *Order*.
* **Keranjang Belanja (Slide-in Cart)**:
  * Mengatur kuantitas item atau menghapus pesanan.
  * Total kalkulasi otomatis.
* **Form Checkout Lengkap**:
  * Input Nama dan No. WhatsApp pemesan.
  * Pilihan metode: **Ambil di Lobby (Pickup)** atau **Diantar (Delivery)** ke kelas.
  * Pilihan pembayaran: **QRIS**, **Transfer Bank**, atau **Tunai / COD**.
  * Preview QR Code & tombol salin nomor rekening.
* **Konfirmasi WhatsApp Otomatis**:
  * Setelah checkout, muncul Invoice ID (contoh: `#CHK-8492`).
  * Tombol 1-klik **"Kirim Pesanan ke WhatsApp Penjual"** dengan format teks pesanan lengkap!

---

### 🛡️ 2. POV Admin Kelompok (`/admin`)
* **Keamanan**: Login PIN kelompok (Default PIN: `admin123` atau `kwu2026`).
* **Dashboard Metrik SISFOR**:
  * Total Pendapatan / Omzet Penjualan (Rp).
  * Total Pesanan Masuk.
  * Jumlah pesanan yang sedang diproses.
  * Total ketersediaan menu.
* **Manajemen Pesanan Real-Time**:
  * Filter status pesanan (*Menunggu Konfirmasi*, *Sedang Dimasak*, *Siap Diambil/Antar*, *Selesai*, *Dibatalkan*).
  * Ubah status pesanan secara langsung.
  * Tombol cepat **Chat WhatsApp Pembeli** untuk konfirmasi order.
* **Katalog Produk & Stok**:
  * Toggle status menu (*Tersedia* / *Habis*).
  * Edit harga menu.
  * Tambah menu baru langsung dari dashboard.
* **Ekspor Laporan (Nilai Plus SISFOR)**:
  * Tombol **"Export Excel/CSV"** untuk mengunduh seluruh rekapan riwayat penjualan sebagai bahan laporan praktikum kewirausahaan.

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. Buka terminal di folder project ini:
   ```bash
   npm run dev
   ```
2. Buka browser di [http://localhost:3000](http://localhost:3000) untuk tampilan Pembeli.
3. Buka [http://localhost:3000/admin](http://localhost:3000/admin) untuk masuk ke halaman Admin (PIN: `admin123`).

---

## 📷 Cara Mengganti Foto Produk Asli
Nanti ketika foto asli sudah siap:
1. Simpan foto ke folder `public/images/` (misal `public/images/chichick-ori.jpg`).
2. Buka file `src/data/products.ts`, lalu ubah URL `image` produk terkait:
   ```ts
   image: "/images/chichick-ori.jpg",
   ```

---

## 📱 Cara Mengganti No. WhatsApp Kelompok
Buka file `src/components/OrderSuccessModal.tsx` dan cari baris:
```ts
const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(messageText)}`;
```
Ganti `6281234567890` dengan nomor WhatsApp kelompok Anda (gunakan awalan `62` tanpa tanda `+` atau spasi).

---

## ☁️ Panduan Deploy ke Vercel

1. Push project ini ke repository GitHub kelompok Anda:
   ```bash
   git add .
   git commit -m "feat: complete kwu food ordering website"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub.
3. Klik **"Add New"** > **"Project"** > Pilih repository project ini.
4. Klik tombol **"Deploy"** (Semua konfigurasi sudah otomatis terdeteksi untuk Next.js).
5. Selesai! Website Anda langsung online dan mendapatkan link publik (misal: `https://chichick-kwu.vercel.app`).
