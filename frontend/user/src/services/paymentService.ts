import api from '../lib/api';

export interface RazorpayOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    paymentId: string;
  };
}

export interface RazorpayKeyResponse {
  success: boolean;
  data: {
    keyId: string;
  };
}

// Create Razorpay order
export const createRazorpayOrder = async (orderData: RazorpayOrderData): Promise<RazorpayOrderResponse> => {
  const response = await api.post('/payment/create-order', orderData);
  return response.data;
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (paymentData: VerifyPaymentData): Promise<VerifyPaymentResponse> => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

// Get Razorpay key
export const getRazorpayKey = async (): Promise<RazorpayKeyResponse> => {
  const response = await api.get('/payment/key');
  return response.data;
};
