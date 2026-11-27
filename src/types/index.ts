export type ProductCategory = 'all' | 'paket' | 'boneless' | 'snacks' | 'beverages';

export interface Product {
  id: string;
  name: string;
  category: 'paket' | 'boneless' | 'snacks' | 'beverages';
  subCategory?: string; // e.g. 'Hemat', 'Komplit', 'Original', 'Keju'
  price: number;
  promoBadge?: string; // e.g. 'Hemat Rp 6.000', 'Best Seller'
  description: string;
  ingredients: string;
  portion: string;
  calories: string;
  likes: number;
  available: boolean;
  image: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  selectedVariant?: string;
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  orderType: 'pickup' | 'delivery';
  pickupDay?: 'Senin' | 'Selasa';
  deliveryLocation?: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  totalPrice: number;
  paymentMethod: 'qris' | 'transfer' | 'cash';
  paymentProofUrl?: string;
  status: OrderStatus;
  createdAt: string;
}
