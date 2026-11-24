"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Order, OrderStatus, ProductCategory } from "@/types";
import { initialProducts } from "@/data/products";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchCloudOrders,
  insertCloudOrder,
  updateCloudOrderStatus,
  deleteCloudOrder,
} from "@/lib/orderService";

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Modals & Navigation
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
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

  // Realtime Stock helpers
  getProductStock: (productId: string) => number;
  getProductOrderedQty: (productId: string) => number;
  isProductAvailable: (productId: string) => boolean;
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

const LOCAL_STORAGE_PRODUCTS = "kwu_products_v18";
const LOCAL_STORAGE_CART = "kwu_cart_v3";
const LOCAL_STORAGE_ORDERS = "kwu_orders_v4";
const LOCAL_STORAGE_LIKES = "kwu_likes_v1";

// Mapping resep/komponen untuk setiap menu Paket (Bundling)
export const BUNDLE_RECIPES: Record<string, { productId: string; qty: number }[]> = {
  // Paket Komplit: 1x Ayam Ori + 1x Kentang Keju + 1x Yuzu
  "pkt-komplit": [
    { productId: "chk-ori", qty: 1 },
    { productId: "ktg-keju", qty: 1 },
    { productId: "yuzu-ori", qty: 1 },
  ],
  // Paket Hemat: 1x Ayam Ori + 1x Yuzu
  "pkt-hemat": [
    { productId: "chk-ori", qty: 1 },
    { productId: "yuzu-ori", qty: 1 },
  ],
  // Paket Snack: 1x Kentang Keju + 1x Yuzu
  "pkt-snack": [
    { productId: "ktg-keju", qty: 1 },
    { productId: "yuzu-ori", qty: 1 },
  ],
  // Paket 3 Risol: 1x Risol Coklat + 1x Risol Strawberry + 1x Risol Matcha
  "pkt-risol": [
    { productId: "rsl-coklat-keju", qty: 1 },
    { productId: "rsl-strawberry-keju", qty: 1 },
    { productId: "rsl-matcha", qty: 1 },
  ],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
        const normalized = parsed.map((p: Product) => ({
          ...p,
          stock: typeof p.stock === "number" ? p.stock : 5,
        }));
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
    } catch (e) {
      console.error("LocalStorage load error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync Cloud Orders from Supabase & Listen to Realtime Updates
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;
    const syncOrders = async () => {
      const cloudOrders = await fetchCloudOrders();
      if (isMounted && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    };

    syncOrders();

    const channel = supabase
      .channel("public-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async () => {
          const updated = await fetchCloudOrders();
          if (isMounted) {
            setOrders(updated);
          }
        }
      )
      .subscribe();

    // Resilient periodic sync + sync on tab focus for instant real-time updates
    const pollInterval = setInterval(() => {
      syncOrders();
    }, 8000);

    const onFocus = () => {
      syncOrders();
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

  // Realtime Stock & Order Count Helpers (Multi-Product & Bundle Interdependency)
  const getProductOrderedQty = (productId: string): number => {
    // 1. Hitung pesanan langsung produk ini
    const directQty = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => {
        const item = o.items.find((i) => i.productId === productId);
        return sum + (item ? item.quantity : 0);
      }, 0);

    // 2. Jika produk ini adalah bagian dari paket bundling manapun,
    // tambahkan jumlah yang terjual via paket bundling tersebut!
    let fromBundlesQty = 0;
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        o.items.forEach((item) => {
          const recipe = BUNDLE_RECIPES[item.productId];
          if (recipe) {
            const component = recipe.find((c) => c.productId === productId);
            if (component) {
              fromBundlesQty += item.quantity * component.qty;
            }
          }
        });
      });

    return directQty + fromBundlesQty;
  };

  const getProductStock = (productId: string): number => {
    const prod = products.find((p) => p.id === productId);
    const baseStock = typeof prod?.stock === "number" ? prod.stock : 5;

    // A. JIKA PRODUK INI ADALAH PAKET (BUNDLING):
    // Stoknya dibatasi oleh komponen satuan di dalamnya AND kuota paket itu sendiri
    const recipe = BUNDLE_RECIPES[productId];
    if (recipe) {
      // Hitung berapa paket yang masih bisa dibuat dari sisa stok masing-masing komponen
      const maxFromComponents = Math.min(
        ...recipe.map((comp) => {
          const compProd = products.find((p) => p.id === comp.productId);
          const compBaseStock = typeof compProd?.stock === "number" ? compProd.stock : 5;
          const compOrdered = getProductOrderedQty(comp.productId);
          const compRemaining = Math.max(0, compBaseStock - compOrdered);
          return Math.floor(compRemaining / comp.qty);
        })
      );

      // Hitung pesanan langsung dari paket ini
      const directOrders = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => {
          const item = o.items.find((i) => i.productId === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);
      const remainingBundleQuota = Math.max(0, baseStock - directOrders);

      return Math.max(0, Math.min(remainingBundleQuota, maxFromComponents));
    }

    // B. JIKA PRODUK INI ADALAH MENU SATUAN:
    // Sisa = Kuota Awal - Total Dipesan (baik langsung maupun via paket bundling)
    const totalOrdered = getProductOrderedQty(productId);
    return Math.max(0, baseStock - totalOrdered);
  };

  const isProductAvailable = (productId: string): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.available === false) return false;
    return getProductStock(productId) > 0;
  };

  // Validasi seluruh keranjang terhadap kombinasi stok satuan & paket
  const validateCartAgainstStock = (
    itemsToCheck: { productId: string; quantity: number }[]
  ): { valid: boolean; errorItem?: string; remaining?: number } => {
    // 1. Cek langsung setiap produk di keranjang
    for (const item of itemsToCheck) {
      const remaining = getProductStock(item.productId);
      if (item.quantity > remaining) {
        const prod = products.find((p) => p.id === item.productId);
        return { valid: false, errorItem: prod?.name || item.productId, remaining };
      }
    }

    // 2. Cek total kebutuhan bahan/satuan dari kombinasi menu satuan + paket di keranjang
    for (const prod of products) {
      let totalDemand = 0;
      for (const item of itemsToCheck) {
        if (item.productId === prod.id) {
          totalDemand += item.quantity;
        }
        const recipe = BUNDLE_RECIPES[item.productId];
        if (recipe) {
          const comp = recipe.find((c) => c.productId === prod.id);
          if (comp) {
            totalDemand += item.quantity * comp.qty;
          }
        }
      }

      if (totalDemand > 0) {
        const baseStock = typeof prod.stock === "number" ? prod.stock : 5;
        const alreadyOrdered = getProductOrderedQty(prod.id);
        const availableStock = Math.max(0, baseStock - alreadyOrdered);
        if (totalDemand > availableStock) {
          return { valid: false, errorItem: prod.name, remaining: availableStock };
        }
      }
    }

    return { valid: true };
  };

  const addToCart = (product: Product, quantity = 1, notes = "") => {
    const existing = cart.find((item) => item.product.id === product.id);
    const candidateCart = existing
      ? cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        )
      : [...cart, { product, quantity, notes }];

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
    showToast(`${quantity}x ${product.name} dimasukkan ke keranjang!`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const candidateCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
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

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const refreshOrders = async () => {
    if (isSupabaseConfigured) {
      const cloudOrders = await fetchCloudOrders();
      if (cloudOrders.length > 0) {
        setOrders(cloudOrders);
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
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, available: !p.available } : p
      )
    );
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
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
        clearCart,
        cartTotal,
        cartCount,
        selectedProduct,
        setSelectedProduct,
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
        getProductStock,
        getProductOrderedQty,
        isProductAvailable,
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
