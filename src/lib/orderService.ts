import { supabase, isSupabaseConfigured } from "./supabase";
import { Order, OrderStatus } from "@/types";

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
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    orderType: row.order_type,
    deliveryLocation: row.delivery_location || undefined,
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
  return {
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    order_type: order.orderType,
    delivery_location: order.deliveryLocation || null,
    notes: order.notes || null,
    items: order.items,
    total_price: order.totalPrice,
    payment_method: order.paymentMethod,
    payment_proof_url: order.paymentProofUrl || null,
    status: order.status,
    created_at: order.createdAt,
  };
}

export async function fetchCloudOrders(): Promise<Order[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch orders notice:", error.message);
      return [];
    }

    return (data as DatabaseOrderRow[]).map(mapRowToOrder);
  } catch (err) {
    console.error("Failed to fetch orders from Supabase:", err);
    return [];
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
