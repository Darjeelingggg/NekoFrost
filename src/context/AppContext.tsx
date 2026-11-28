"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Order, OrderStatus, ProductCategory, FinanceEntry } from "@/types";
import { initialProducts } from "@/data/products";
import { initialFinanceEntries } from "@/data/initialFinance";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchCloudOrders,
  insertCloudOrder,
  updateCloudOrderStatus,
  deleteCloudOrder,
  clearCloudOrders,
  fetchCloudProductState,
  saveCloudProductState,
  fetchCloudFinanceEntries,
  saveCloudFinanceEntries,
  CloudProductState,
} from "@/lib/orderService";

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    notes?: string,
    selectedVariant?: string,
    customPrice?: number
  ) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: string) => void;
  updateCartItem: (
    oldProductId: string,
    oldSelectedVariant: string,
    updated: {
      quantity: number;
      notes: string;
      selectedVariant: string;
      customPrice: number;
    }
  ) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Modals & Navigation
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  editingCartItem: CartItem | null;
  setEditingCartItem: (item: CartItem | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  latestOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;

  // Filter
  activeCategory: ProductCategory;
  setActiveCategory: (cat: ProductCategory) => void;
  activeSubCategory: string;
  setActiveSubCategory: (sub: string) => void;

  // Orders (Admin + Tracking)
  orders: Order[];
  refreshOrders: () => Promise<void>;
  createOrder: (orderData: Omit<Order, "id" | "createdAt" | "status">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  clearOrders: () => void;
  toggleProductAvailability: (productId: string) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;

  // Finance Ledger (Pemasukan & Pengeluaran)
  financeEntries: FinanceEntry[];
  addFinanceEntry: (entry: Omit<FinanceEntry, "id" | "createdAt">) => void;
  deleteFinanceEntry: (entryId: string) => void;

  // Realtime Stock helpers
  getProductStock: (productId: string) => number;
  getProductOrderedQty: (productId: string) => number;
  isProductAvailable: (productId: string) => boolean;
  hasStockLimit: (productId: string) => boolean;
  validateCartAgainstStock: (
    itemsToCheck: { productId: string; quantity: number }[]
  ) => { valid: boolean; errorItem?: string; remaining?: number };

  // Interactivity: Toast & Likes
  toastMessage: string | null;
  showToast: (msg: string) => void;
  likedProductIds: string[];
  toggleLike: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS = "kwu_products_v24";
const LOCAL_STORAGE_CART = "kwu_cart_v3";
const LOCAL_STORAGE_ORDERS = "kwu_orders_v4";
const LOCAL_STORAGE_LIKES = "kwu_likes_v1";
const LOCAL_STORAGE_FINANCE = "kwu_finance_v3";

// Daftar produk yang memiliki batasan kuota stok (Hanya varian Risol)
// Boneless Chichick, Kentang Goreng, dan Minuman Yuzu tidak memiliki batasan stok
export const LIMITED_STOCK_PRODUCT_IDS = [
  "rsl-coklat-keju",
  "rsl-strawberry-keju",
  "rsl-matcha",
  "pkt-risol",
];

export const hasStockLimit = (productId: string): boolean => {
  return LIMITED_STOCK_PRODUCT_IDS.includes(productId);
};

// Mapping resep/komponen untuk setiap menu Paket (Bundling)
export const BUNDLE_RECIPES: Record<string, { productId: string; qty: number }[]> = {
  // Paket Komplit: Ayam + Kentang + Yuzu
  "pkt-komplit": [
    { productId: "chk-ori", qty: 1 },
    { productId: "ktg-ori", qty: 1 },
    { productId: "yuzu-ori", qty: 1 },
  ],
  // Paket Hemat: Ayam + Yuzu
  "pkt-hemat": [
    { productId: "chk-ori", qty: 1 },
    { productId: "yuzu-ori", qty: 1 },
  ],
  // Paket Snack: Kentang + Yuzu
  "pkt-snack": [
    { productId: "ktg-ori", qty: 1 },
    { productId: "yuzu-ori", qty: 1 },
  ],
  // Combo Boneless Chichick + Kentang
  "chk-kentang": [
    { productId: "chk-ori", qty: 1 },
    { productId: "ktg-ori", qty: 1 },
  ],
  // Paket 3 Risol: 1x Coklat + 1x Strawberry + 1x Matcha
  "pkt-risol": [
    { productId: "rsl-coklat-keju", qty: 1 },
    { productId: "rsl-strawberry-keju", qty: 1 },
    { productId: "rsl-matcha", qty: 1 },
  ],
};

// Kebutuhan bahan dasar tiap produk (ayam, kentang, yuzu, dan ketiga rasa risol)
export interface ProductRequirement {
  chicken?: number;
  kentang?: number;
  yuzu?: number;
  risolCoklat?: number;
  risolStrawberry?: number;
  risolMatcha?: number;
}

export const PRODUCT_REQUIREMENTS: Record<string, ProductRequirement> = {
  // Menu Satuan Ayam (Boneless Chichick)
  "chk-ori": { chicken: 1 },
  "chk-keju": { chicken: 1 },
  // Menu Satuan Kentang
  "ktg-ori": { kentang: 1 },
  "ktg-keju": { kentang: 1 },
  // Menu Satuan Minuman Yuzu
  "yuzu-ori": { yuzu: 1 },
  // Menu Satuan Risol Manis
  "rsl-coklat-keju": { risolCoklat: 1 },
  "rsl-strawberry-keju": { risolStrawberry: 1 },
  "rsl-matcha": { risolMatcha: 1 },

  // Paket & Combo
  "chk-kentang": { chicken: 1, kentang: 1 },
  "pkt-komplit": { chicken: 1, kentang: 1, yuzu: 1 },
  "pkt-hemat": { chicken: 1, yuzu: 1 },
  "pkt-snack": { kentang: 1, yuzu: 1 },
  "pkt-risol": { risolCoklat: 1, risolStrawberry: 1, risolMatcha: 1 },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(initialFinanceEntries);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<ProductCategory>("all");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("Semua");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const normalized = initialProducts.map((initP) => {
          const found = parsed.find((p: Product) => p.id === initP.id);
          return found
            ? { ...initP, ...found, stock: typeof found.stock === "number" ? found.stock : initP.stock }
            : initP;
        });
        setProducts(normalized);
      } else {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(initialProducts));
        setProducts(initialProducts);
      }

      const savedCart = localStorage.getItem(LOCAL_STORAGE_CART);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }

      const savedLikes = localStorage.getItem(LOCAL_STORAGE_LIKES);
      if (savedLikes) setLikedProductIds(JSON.parse(savedLikes));

      const savedFinance = localStorage.getItem(LOCAL_STORAGE_FINANCE);
      if (savedFinance) {
        const parsedFin = JSON.parse(savedFinance);
        setFinanceEntries(Array.isArray(parsedFin) && parsedFin.length > 0 ? parsedFin : initialFinanceEntries);
      } else {
        localStorage.setItem(LOCAL_STORAGE_FINANCE, JSON.stringify(initialFinanceEntries));
        setFinanceEntries(initialFinanceEntries);
      }
    } catch (e) {
      console.error("LocalStorage load error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const mergeCloudProductState = (
    currentList: Product[],
    cloudState: CloudProductState
  ): Product[] => {
    const mergedInitial = initialProducts.map((initP) => {
      const existing = currentList.find((p) => p.id === initP.id) || initP;
      const ov = cloudState.overrides[initP.id];
      if (!ov) return existing;
      return {
        ...existing,
        available: ov.available,
        stock: typeof ov.stock === "number" ? ov.stock : existing.stock,
        price: typeof ov.price === "number" ? ov.price : existing.price,
      };
    });

    const initialIds = initialProducts.map((p) => p.id);
    const customFromCloud = (cloudState.customProducts || []).filter(
      (cp) => !initialIds.includes(cp.id)
    );
    return [...customFromCloud, ...mergedInitial];
  };

  // Sync Cloud Orders & Product Availability/Stock from Supabase & Listen to Realtime Updates
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;
    const syncCloud = async () => {
      const [cloudOrders, cloudProductState, cloudFinance] = await Promise.all([
        fetchCloudOrders(),
        fetchCloudProductState(),
        fetchCloudFinanceEntries(),
      ]);
      if (isMounted) {
        if (cloudOrders !== null) {
          setOrders(cloudOrders);
        }
        if (cloudProductState) {
          setProducts((prev) => mergeCloudProductState(prev, cloudProductState));
        }
        if (cloudFinance !== null && cloudFinance.length > 0) {
          const updatedOjak = initialFinanceEntries.find((e) => e.id === "FIN-INIT-10");
          setFinanceEntries(
            cloudFinance.map((e) => (e.id === "FIN-INIT-10" && updatedOjak ? updatedOjak : e))
          );
        }
      }
    };

    syncCloud();

    const channel = supabase
      .channel("public-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async () => {
          await syncCloud();
        }
      )
      .subscribe();

    // Resilient periodic sync + sync on tab focus for instant real-time updates
    const pollInterval = setInterval(() => {
      syncCloud();
    }, 8000);

    const onFocus = () => {
      syncCloud();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("focus", onFocus);
      supabase?.removeChannel(channel);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error("Save products error", e);
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    } catch (e) {
      console.error("Save cart error", e);
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error("Save orders error", e);
    }
  }, [orders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_LIKES, JSON.stringify(likedProductIds));
    } catch (e) {
      console.error("Save likes error", e);
    }
  }, [likedProductIds, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_FINANCE, JSON.stringify(financeEntries));
    } catch (e) {
      console.error("Save finance entries error", e);
    }
  }, [financeEntries, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const toggleLike = (productId: string) => {
    setLikedProductIds((prev) => {
      const isLiked = prev.includes(productId);
      const nextLikes = isLiked
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      // Update product likes count
      setProducts((prodList) =>
        prodList.map((p) => {
          if (p.id === productId) {
            const currentLikes = p.likes || 100;
            return {
              ...p,
              likes: isLiked ? currentLikes - 1 : currentLikes + 1,
            };
          }
          return p;
        })
      );

      return nextLikes;
    });
  };

  // Waktu restock Risol Coklat (25 Nov 2026 20:15 WIB) -> Stok awal restock menjadi 6
  const RISOL_COKLAT_RESTOCK_TIME = new Date("2026-11-25T13:15:00Z").getTime();

  // Helper: Hitung jumlah terpakai dari masing-masing bahan mentah / komponen
  const getIngredientUsage = (ingredient: keyof ProductRequirement): number => {
    return orders
      .filter((o) => {
        if (o.status === "cancelled") return false;
        // Khusus Risol Coklat, hanya hitung pesanan setelah restock agar sisa stok menjadi 6
        if (ingredient === "risolCoklat") {
          const orderTime = new Date(o.createdAt).getTime();
          return orderTime >= RISOL_COKLAT_RESTOCK_TIME;
        }
        return true;
      })
      .reduce((sum, o) => {
        let orderSum = 0;
        o.items.forEach((item) => {
          const req = PRODUCT_REQUIREMENTS[item.productId];
          if (req && req[ingredient]) {
            orderSum += item.quantity * (req[ingredient] || 0);
          }
        });
        return sum + orderSum;
      }, 0);
  };

  // Helper: Hitung sisa stok bahan mentah / komponen
  const getIngredientRemaining = (ingredient: keyof ProductRequirement): number => {
    let baseStock = 7;
    if (ingredient === "chicken") {
      const p = products.find((prod) => prod.id === "chk-ori");
      baseStock = typeof p?.stock === "number" ? p.stock : 7;
    } else if (ingredient === "kentang") {
      const p = products.find((prod) => prod.id === "ktg-ori");
      baseStock = typeof p?.stock === "number" ? p.stock : 7;
    } else if (ingredient === "yuzu") {
      const p = products.find((prod) => prod.id === "yuzu-ori");
      baseStock = typeof p?.stock === "number" ? p.stock : 5;
    } else if (ingredient === "risolCoklat") {
      const p = products.find((prod) => prod.id === "rsl-coklat-keju");
      baseStock = typeof p?.stock === "number" ? p.stock : 6;
    } else if (ingredient === "risolStrawberry") {
      const p = products.find((prod) => prod.id === "rsl-strawberry-keju");
      baseStock = typeof p?.stock === "number" ? p.stock : 5;
    } else if (ingredient === "risolMatcha") {
      const p = products.find((prod) => prod.id === "rsl-matcha");
      baseStock = typeof p?.stock === "number" ? p.stock : 5;
    }
    const used = getIngredientUsage(ingredient);
    return Math.max(0, baseStock - used);
  };

  // Realtime Stock & Order Count Helpers (Multi-Product & Bundle Interdependency)
  const getProductOrderedQty = (productId: string): number => {
    const req = PRODUCT_REQUIREMENTS[productId];
    if (!req) {
      return orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => {
          const item = o.items.find((i) => i.productId === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);
    }

    if (req.chicken && !req.kentang && !req.yuzu) return getIngredientUsage("chicken");
    if (req.kentang && !req.chicken && !req.yuzu) return getIngredientUsage("kentang");
    if (req.yuzu && !req.chicken && !req.kentang) return getIngredientUsage("yuzu");
    if (req.risolCoklat && !req.risolStrawberry) return getIngredientUsage("risolCoklat");
    if (req.risolStrawberry && !req.risolCoklat) return getIngredientUsage("risolStrawberry");
    if (req.risolMatcha && !req.risolCoklat) return getIngredientUsage("risolMatcha");

    // Untuk paket bundling (komplit, hemat, snack, chk-kentang, pkt-risol)
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => {
        const item = o.items.find((i) => i.productId === productId);
        return sum + (item ? item.quantity : 0);
      }, 0);
  };

  const getProductStock = (productId: string): number => {
    // Boneless Chichick, Kentang, dan Yuzu tidak ada batasan stok
    if (!hasStockLimit(productId)) {
      return 999;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return 0;
    const ownStock = typeof prod.stock === "number" ? prod.stock : 5;

    const req = PRODUCT_REQUIREMENTS[productId];
    if (!req) {
      const directOrders = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => {
          const item = o.items.find((i) => i.productId === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);
      return Math.max(0, ownStock - directOrders);
    }

    // Khusus Risol: dibatasi ketersediaan bahan isian risol & paket risol
    const limits: number[] = [ownStock];
    if (req.risolCoklat) limits.push(Math.floor(getIngredientRemaining("risolCoklat") / req.risolCoklat));
    if (req.risolStrawberry) limits.push(Math.floor(getIngredientRemaining("risolStrawberry") / req.risolStrawberry));
    if (req.risolMatcha) limits.push(Math.floor(getIngredientRemaining("risolMatcha") / req.risolMatcha));

    return Math.max(0, Math.min(...limits));
  };

  const isProductAvailable = (productId: string): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.available === false) return false;
    if (!hasStockLimit(productId)) return true;
    return getProductStock(productId) > 0;
  };

  // Validasi seluruh keranjang terhadap kombinasi stok satuan & paket
  const validateCartAgainstStock = (
    itemsToCheck: { productId: string; quantity: number }[]
  ): { valid: boolean; errorItem?: string; remaining?: number } => {
    // 1. Cek langsung setiap produk di keranjang yang memiliki batasan stok (Risol)
    for (const item of itemsToCheck) {
      if (hasStockLimit(item.productId)) {
        const remaining = getProductStock(item.productId);
        if (item.quantity > remaining) {
          const prod = products.find((p) => p.id === item.productId);
          return { valid: false, errorItem: prod?.name || item.productId, remaining };
        }
      }
    }

    // 2. Cek total kebutuhan bahan yang terbatas (Risol)
    const limitedIngredients: (keyof ProductRequirement)[] = [
      "risolCoklat",
      "risolStrawberry",
      "risolMatcha",
    ];

    for (const ing of limitedIngredients) {
      let totalCartDemand = 0;
      for (const item of itemsToCheck) {
        const req = PRODUCT_REQUIREMENTS[item.productId];
        if (req && req[ing]) {
          totalCartDemand += item.quantity * (req[ing] || 0);
        }
      }

      if (totalCartDemand > 0) {
        const available = getIngredientRemaining(ing);
        if (totalCartDemand > available) {
          const culprit = itemsToCheck.find((it) => {
            const req = PRODUCT_REQUIREMENTS[it.productId];
            return req && req[ing];
          });
          const culpritProd = culprit ? products.find((p) => p.id === culprit.productId) : null;
          return {
            valid: false,
            errorItem: culpritProd?.name || `Varian Risol`,
            remaining: available,
          };
        }
      }
    }

    return { valid: true };
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    notes = "",
    selectedVariant = "",
    customPrice?: number
  ) => {
    const effectiveProduct =
      customPrice !== undefined || selectedVariant
        ? {
            ...product,
            price: customPrice ?? product.price,
            name: selectedVariant ? `${product.name} (${selectedVariant})` : product.name,
          }
        : product;

    const existing = cart.find(
      (item) =>
        item.product.id === product.id &&
        (item.selectedVariant || "") === selectedVariant
    );
    const candidateCart = existing
      ? cart.map((item) =>
          item.product.id === product.id &&
          (item.selectedVariant || "") === selectedVariant
            ? {
                ...item,
                quantity: item.quantity + quantity,
                notes: notes || item.notes,
              }
            : item
        )
      : [...cart, { product: effectiveProduct, quantity, notes, selectedVariant }];

    const validation = validateCartAgainstStock(
      candidateCart.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
    );

    if (!validation.valid) {
      showToast(
        `Maaf, stok ${validation.errorItem} tidak mencukupi (sisa ${validation.remaining ?? 0} porsi).`
      );
      return;
    }

    setCart(candidateCart);
    showToast(`${quantity}x ${effectiveProduct.name} dimasukkan ke keranjang!`);
  };

  const removeFromCart = (productId: string, selectedVariant = "") => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (item.selectedVariant || "") === selectedVariant
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedVariant = ""
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }

    const candidateCart = cart.map((item) =>
      item.product.id === productId &&
      (item.selectedVariant || "") === selectedVariant
        ? { ...item, quantity }
        : item
    );

    const validation = validateCartAgainstStock(
      candidateCart.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
    );

    if (!validation.valid) {
      showToast(
        `Maksimal hanya ${validation.remaining ?? 0} porsi sesuai sisa stok ${validation.errorItem}.`
      );
      return;
    }

    setCart(candidateCart);
  };

  const updateCartItem = (
    oldProductId: string,
    oldSelectedVariant: string,
    updated: {
      quantity: number;
      notes: string;
      selectedVariant: string;
      customPrice: number;
    }
  ) => {
    const baseProduct = products.find((p) => p.id === oldProductId);
    if (!baseProduct) return;

    const effectiveProduct: Product = {
      ...baseProduct,
      price: updated.customPrice,
      name: updated.selectedVariant
        ? `${baseProduct.name} (${updated.selectedVariant})`
        : baseProduct.name,
    };

    const candidateCart = cart.map((item) =>
      item.product.id === oldProductId &&
      (item.selectedVariant || "") === oldSelectedVariant
        ? {
            product: effectiveProduct,
            quantity: updated.quantity,
            notes: updated.notes,
            selectedVariant: updated.selectedVariant,
          }
        : item
    );

    const validation = validateCartAgainstStock(
      candidateCart.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
    );

    if (!validation.valid) {
      showToast(
        `Maaf, stok ${validation.errorItem} tidak mencukupi (sisa ${validation.remaining ?? 0} porsi).`
      );
      return;
    }

    setCart(candidateCart);
    showToast(`Pilihan ${effectiveProduct.name} diperbarui!`);
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const refreshOrders = async () => {
    if (isSupabaseConfigured) {
      const [cloudOrders, cloudProductState, cloudFinance] = await Promise.all([
        fetchCloudOrders(),
        fetchCloudProductState(),
        fetchCloudFinanceEntries(),
      ]);
      if (cloudOrders !== null) {
        setOrders(cloudOrders);
      }
      if (cloudProductState) {
        setProducts((prev) => mergeCloudProductState(prev, cloudProductState));
      }
      if (cloudFinance !== null && cloudFinance.length > 0) {
        const updatedOjak = initialFinanceEntries.find((e) => e.id === "FIN-INIT-10");
        setFinanceEntries(
          cloudFinance.map((e) => (e.id === "FIN-INIT-10" && updatedOjak ? updatedOjak : e))
        );
      }
    }
  };

  const createOrder = (orderData: Omit<Order, "id" | "createdAt" | "status">): Order => {
    // Re-verify kombinasi keranjang terhadap stok real-time sebelum order dibuat
    const validation = validateCartAgainstStock(
      orderData.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );

    if (!validation.valid) {
      const errorMsg = `Maaf, stok untuk ${validation.errorItem} tidak mencukupi (hanya tersisa ${validation.remaining ?? 0} porsi)!`;
      showToast(errorMsg);
      throw new Error(errorMsg);
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `CHK-${randomNum}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    clearCart();

    // Push to Supabase Cloud if configured
    if (isSupabaseConfigured) {
      insertCloudOrder(newOrder);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    if (isSupabaseConfigured) {
      updateCloudOrderStatus(orderId, status);
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    if (isSupabaseConfigured) {
      deleteCloudOrder(orderId);
    }
  };

  const clearOrders = () => {
    setOrders([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ORDERS);
    } catch (e) {
      console.error(e);
    }
    if (isSupabaseConfigured) {
      clearCloudOrders();
    }
  };

  const initialProductIds = initialProducts.map((p) => p.id);

  const syncProductStateToCloud = (nextProducts: Product[]) => {
    if (!isSupabaseConfigured) return;
    saveCloudProductState(nextProducts, initialProductIds).then((ok) => {
      if (!ok) {
        showToast("Gagal menyinkronkan status menu ke database!");
      }
    });
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === productId ? { ...p, available: !p.available } : p
      );
      syncProductStateToCloud(next);
      return next;
    });
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      syncProductStateToCloud(next);
      return next;
    });
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      syncProductStateToCloud(next);
      return next;
    });
  };

  const syncFinanceToCloud = (nextEntries: FinanceEntry[]) => {
    if (!isSupabaseConfigured) return;
    saveCloudFinanceEntries(nextEntries).then((ok) => {
      if (!ok) {
        showToast("Gagal menyinkronkan catatan keuangan ke database!");
      }
    });
  };

  const addFinanceEntry = (entryData: Omit<FinanceEntry, "id" | "createdAt">) => {
    const newEntry: FinanceEntry = {
      ...entryData,
      id: `FIN-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    setFinanceEntries((prev) => {
      const next = [newEntry, ...prev];
      syncFinanceToCloud(next);
      return next;
    });
  };

  const deleteFinanceEntry = (entryId: string) => {
    setFinanceEntries((prev) => {
      const next = prev.filter((e) => e.id !== entryId);
      syncFinanceToCloud(next);
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
        cartTotal,
        cartCount,
        selectedProduct,
        setSelectedProduct,
        editingCartItem,
        setEditingCartItem,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        latestOrder,
        setLatestOrder,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        activeCategory,
        setActiveCategory,
        activeSubCategory,
        setActiveSubCategory,
        orders,
        refreshOrders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        clearOrders,
        toggleProductAvailability,
        updateProduct,
        addProduct,
        financeEntries,
        addFinanceEntry,
        deleteFinanceEntry,
        getProductStock,
        getProductOrderedQty,
        isProductAvailable,
        hasStockLimit,
        validateCartAgainstStock,
        toastMessage,
        showToast,
        likedProductIds,
        toggleLike,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
