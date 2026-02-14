import api from '../lib/api';

export interface OrderItem {
  product: string;
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

export interface Order {
  _id: string;
  orderId: string;
  user?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  totalEarnings: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UserOrdersResponse {
  success: boolean;
  count: number;
  data: Order[];
}

// Get user's orders
export const getUserOrders = async (): Promise<UserOrdersResponse> => {
  const response = await api.get('/orders/user/my-orders');
  return response.data;
};
