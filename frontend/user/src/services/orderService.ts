import api from '../lib/api';

export interface OrderItem {
  product: string; // Product ID
  productName: string;
  quantity: number;
  price: number;
  resellerEarning: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  totalEarnings: number;
  paymentStatus?: 'paid' | 'pending' | 'failed';
  orderStatus?: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  totalEarnings: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

// Create new order
export const createOrder = async (orderData: CreateOrderData): Promise<OrderResponse> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get user's orders (if we add authentication later)
export const getUserOrders = async (): Promise<{ success: boolean; data: Order[] }> => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};
