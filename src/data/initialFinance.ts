import { FinanceEntry } from "@/types";

export const initialFinanceEntries: FinanceEntry[] = [
  // --- 26 NOVEMBER 2026 ---
  {
    id: "FIN-INIT-14",
    type: "expense",
    title: "Beli minyak, tusuk sate, kantong kresek, plastik mika",
    amount: 50000,
    dayLabel: "26 Nov 2026",
    createdAt: "2026-11-26T10:04:00.000Z",
  },
  {
    id: "FIN-INIT-13",
    type: "expense",
    title: "Bumbu silin",
    amount: 44400,
    dayLabel: "26 Nov 2026",
    createdAt: "2026-11-26T10:03:00.000Z",
  },
  {
    id: "FIN-INIT-12",
    type: "expense",
    title: "Beli minyak",
    amount: 17500,
    dayLabel: "26 Nov 2026",
    createdAt: "2026-11-26T10:02:00.000Z",
  },
  {
    id: "FIN-INIT-11",
    type: "expense",
    title: "Beli gas",
    amount: 33500,
    dayLabel: "26 Nov 2026",
    createdAt: "2026-11-26T10:01:00.000Z",
  },

  // --- RABU / AYAM OJAK (LUNAS DIBAYAR DARI PENGHASILAN KAMIS) ---
  {
    id: "FIN-INIT-10",
    type: "expense",
    title: "Ayam Ojak + bumbu (Lunas)",
    amount: 105000,
    dayLabel: "28 Nov 2026",
    notes: "Dibayar dari penghasilan hari Kamis Rp 210.000 (sisa penghasilan Kamis: Rp 105.000)",
    createdAt: "2026-11-28T09:47:00.000Z",
  },

  // --- 25 NOVEMBER 2026 ---
  {
    id: "FIN-INIT-09",
    type: "expense",
    title: "Beli risol coklat",
    amount: 22700,
    dayLabel: "25 Nov 2026",
    createdAt: "2026-11-25T10:03:00.000Z",
  },
  {
    id: "FIN-INIT-08",
    type: "expense",
    title: "Beli saus keju",
    amount: 34900,
    dayLabel: "25 Nov 2026",
    createdAt: "2026-11-25T10:02:00.000Z",
  },
  {
    id: "FIN-INIT-07",
    type: "expense",
    title: "Beli packaging kentang + chickchick",
    amount: 27600,
    dayLabel: "25 Nov 2026",
    createdAt: "2026-11-25T10:01:00.000Z",
  },

  // --- 24 NOVEMBER 2026 ---
  {
    id: "FIN-INIT-06",
    type: "expense",
    title: "Beli risol",
    amount: 50000,
    dayLabel: "24 Nov 2026",
    createdAt: "2026-11-24T10:04:00.000Z",
  },
  {
    id: "FIN-INIT-05",
    type: "expense",
    title: "Beli kentang",
    amount: 31000,
    dayLabel: "24 Nov 2026",
    createdAt: "2026-11-24T10:03:00.000Z",
  },
  {
    id: "FIN-INIT-04",
    type: "expense",
    title: "Packaging risol dan packaging saos keju",
    amount: 32947,
    dayLabel: "24 Nov 2026",
    createdAt: "2026-11-24T10:02:00.000Z",
  },
  {
    id: "FIN-INIT-03",
    type: "income",
    title: "PT-PT Fairuz (Pairus)",
    amount: 30000,
    dayLabel: "24 Nov 2026",
    notes: "Iuran modal Rp 30.000",
    createdAt: "2026-11-24T10:01:00.000Z",
  },

  // --- 23 NOVEMBER 2026 ---
  {
    id: "FIN-INIT-02",
    type: "expense",
    title: "Beli gelas cup",
    amount: 48000,
    dayLabel: "23 Nov 2026",
    createdAt: "2026-11-23T10:01:00.000Z",
  },

  // --- 21 NOVEMBER 2026 ---
  {
    id: "FIN-INIT-01B",
    type: "income",
    title: "PT-PT Nande (Nanduy)",
    amount: 30000,
    dayLabel: "21 Nov 2026",
    notes: "Iuran modal Rp 30.000",
    createdAt: "2026-11-21T10:03:00.000Z",
  },
  {
    id: "FIN-INIT-01A",
    type: "expense",
    title: "Beli tepung shilin",
    amount: 30400,
    dayLabel: "21 Nov 2026",
    createdAt: "2026-11-21T10:02:00.000Z",
  },
  {
    id: "FIN-INIT-01",
    type: "income",
    title: "PT-PT Awal (7 Anggota x Rp 30.000)",
    amount: 210000,
    dayLabel: "21 Nov 2026",
    notes: "Agoy, Reza, Lituy, Raihan, Gea, Raka, Ojak",
    createdAt: "2026-11-21T10:01:00.000Z",
  },
];
