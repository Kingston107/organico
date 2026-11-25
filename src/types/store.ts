export type ProductCategory = 'Kitchen' | 'Bath' | 'Carry' | 'Home';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  materialBadge: string;
  shortDescription: string;
  description: string;
  sustainabilityNote: string;
  priceInr: number;
  compareAtInr?: number;
  imageUrl: string;
  stock: number;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderSummary {
  orderNumber: string;
  isGuest: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  subtotalInr: number;
  shippingInr: number;
  totalInr: number;
  createdAt: string;
  items: {
    slug: string;
    name: string;
    unitPriceInr: number;
    quantity: number;
  }[];
}
