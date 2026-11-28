import { supabase, isSupabaseConfigured } from "./supabase";
import { Order, OrderStatus, Product, FinanceEntry } from "@/types";

export const PRODUCT_STATE_ORDER_ID = "SYS-PRODUCT-STATE";
export const FINANCE_LEDGER_ORDER_ID = "SYS-FINANCE-LEDGER";

export interface CloudProductOverride {
  available: boolean;
  stock?: number;
  price?: number;
}

export interface CloudProductState {
  overrides: Record<string, CloudProductOverride>;
  customProducts: Product[];
}

export interface DatabaseOrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_type: "pickup" | "delivery";
  delivery_location?: string | null;
  notes?: string | null;
  items: Order["items"];
  total_price: number;
  payment_method: "qris" | "transfer" | "cash";
  payment_proof_url?: string | null;
  status: OrderStatus;
  created_at: string;
}

export function mapRowToOrder(row: DatabaseOrderRow): Order {
  let rawLoc = row.delivery_location || "";
  let pickupDay: "Senin" | "Selasa" | undefined;
  const dayMatch = rawLoc.match(/\s*\[Hari:\s*(Senin|Selasa)\]/i);
  if (dayMatch) {
    pickupDay = (dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase()) as "Senin" | "Selasa";
    rawLoc = rawLoc.replace(dayMatch[0], "").trim();
  }

  const mondayOverrideIds = ["CHK-3150", "CHK-4451", "CHK-2001", "CHK-7932"];
  if (!pickupDay && mondayOverrideIds.includes(row.id)) {
    pickupDay = "Senin";
  }

  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    orderType: row.order_type,
    pickupDay,
    deliveryLocation: rawLoc || undefined,
    notes: row.notes || undefined,
    items: row.items,
    totalPrice: Number(row.total_price),
    paymentMethod: row.payment_method,
    paymentProofUrl: row.payment_proof_url || undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapOrderToRow(order: Order): DatabaseOrderRow {
  const baseLoc = order.deliveryLocation || (order.orderType === "pickup" ? "Ambil Sendiri di Lobby" : "");
  const encodedLocation = order.pickupDay
    ? `${baseLoc} [Hari: ${order.pickupDay}]`.trim()
    : baseLoc || null;

  return {
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    order_type: order.orderType,
    delivery_location: encodedLocation,
    notes: order.notes || null,
    items: order.items,
    total_price: order.totalPrice,
    payment_method: order.paymentMethod,
    payment_proof_url: order.paymentProofUrl || null,
    status: order.status,
    created_at: order.createdAt,
  };
}

export async function fetchCloudOrders(): Promise<Order[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch orders notice:", error.message);
      return null;
    }

    return (data as DatabaseOrderRow[])
      .filter(
        (row) =>
          row.id !== PRODUCT_STATE_ORDER_ID &&
          row.id !== FINANCE_LEDGER_ORDER_ID
      )
      .map(mapRowToOrder);
  } catch (err) {
    console.error("Failed to fetch orders from Supabase:", err);
    return null;
  }
}

export async function insertCloudOrder(order: Order): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const row = mapOrderToRow(order);
    const { error } = await supabase.from("orders").insert(row);
    if (error) {
      console.error("Supabase insert order error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to insert order to Supabase:", err);
    return false;
  }
}

export async function updateCloudOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error("Supabase update status error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to update status in Supabase:", err);
    return false;
  }
}

export async function deleteCloudOrder(orderId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) {
      console.error("Supabase delete order error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete order from Supabase:", err);
    return false;
  }
}

export async function clearCloudOrders(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .not("id", "in", `(${PRODUCT_STATE_ORDER_ID},${FINANCE_LEDGER_ORDER_ID})`);
    if (error) {
      console.error("Supabase clear orders error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to clear orders from Supabase:", err);
    return false;
  }
}

export async function fetchCloudProductState(): Promise<CloudProductState | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("notes")
      .eq("id", PRODUCT_STATE_ORDER_ID)
      .maybeSingle();

    if (error || !data?.notes) return null;
    const parsed = JSON.parse(data.notes);
    if (parsed && typeof parsed === "object" && parsed.overrides) {
      return parsed as CloudProductState;
    }
    return null;
  } catch (err) {
    console.warn("Failed to parse cloud product state:", err);
    return null;
  }
}

export async function saveCloudProductState(
  productsList: Product[],
  initialProductIds: string[]
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const overrides: Record<string, CloudProductOverride> = {};
    const customProducts: Product[] = [];

    for (const p of productsList) {
      if (initialProductIds.includes(p.id)) {
        overrides[p.id] = {
          available: p.available,
          stock: p.stock,
          price: p.price,
        };
      } else {
        customProducts.push(p);
      }
    }

    const payload: CloudProductState = { overrides, customProducts };

    const { error } = await supabase.from("orders").upsert(
      {
        id: PRODUCT_STATE_ORDER_ID,
        customer_name: "SYSTEM_CONFIG",
        customer_phone: "-",
        order_type: "pickup",
        delivery_location: null,
        notes: JSON.stringify(payload),
        items: [],
        total_price: 0,
        payment_method: "cash",
        payment_proof_url: null,
        status: "cancelled",
        created_at: "2020-01-01T00:00:00.000Z",
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase save product state error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to save product state to Supabase:", err);
    return false;
  }
}

export async function fetchCloudFinanceEntries(): Promise<FinanceEntry[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("notes")
      .eq("id", FINANCE_LEDGER_ORDER_ID)
      .maybeSingle();

    if (error) return null;
    if (!data?.notes) return [];
    const parsed = JSON.parse(data.notes);
    return Array.isArray(parsed) ? (parsed as FinanceEntry[]) : [];
  } catch (err) {
    console.warn("Failed to parse cloud finance entries:", err);
    return null;
  }
}

export async function saveCloudFinanceEntries(entries: FinanceEntry[]): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from("orders").upsert(
      {
        id: FINANCE_LEDGER_ORDER_ID,
        customer_name: "SYSTEM_FINANCE",
        customer_phone: "-",
        order_type: "pickup",
        delivery_location: null,
        notes: JSON.stringify(entries),
        items: [],
        total_price: 0,
        payment_method: "cash",
        payment_proof_url: null,
        status: "cancelled",
        created_at: "2020-01-01T00:00:01.000Z",
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Supabase save finance entries error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to save finance entries to Supabase:", err);
    return false;
  }
}
