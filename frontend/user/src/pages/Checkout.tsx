import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Truck, FileCheck, CheckCircle, Package, Sparkles, Shield, Award, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { createOrder } from '@/services/orderService';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/paymentService';
import couponImage from '@/assets/coupon image.webp';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalEarnings, clearCart } = useCart();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast({
        title: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsSubmitting(true);

    // Handle Cash on Delivery
    if (paymentMethod === 'cod') {
      try {
        const orderData = {
          items: items.map(item => ({
            product: item._id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            resellerEarning: item.resellerEarning
          })),
          shippingAddress: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          totalAmount: totalPrice,
          totalEarnings: totalEarnings,
          paymentStatus: 'pending' as const,
          orderStatus: 'processing' as const
        };

        const orderResponse = await createOrder(orderData);
        
        setOrderId(orderResponse.data.orderId);
        setStep('success');
        clearCart();
        
        toast({
          title: 'Order Placed Successfully!',
          description: `Your order ${orderResponse.data.orderId} has been confirmed.`,
        });
        setIsSubmitting(false);
        return;
      } catch (error: any) {
        console.error('Order creation error:', error);
        toast({
          title: 'Order failed',
          description: error.response?.data?.message || 'Failed to place order. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Handle Online Payment
    try {
      // Create Razorpay order
      const razorpayOrderResponse = await createRazorpayOrder({
        amount: totalPrice,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      const options = {
        key: razorpayOrderResponse.data.keyId,
        amount: razorpayOrderResponse.data.amount,
        currency: razorpayOrderResponse.data.currency,
        name: 'Flourisel',
        description: 'Order Payment',
        order_id: razorpayOrderResponse.data.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#233a95',
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              // Create order in database after successful payment
              const orderData = {
                items: items.map(item => ({
                  product: item._id,
                  productName: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  resellerEarning: item.resellerEarning
                })),
                shippingAddress: {
                  name: formData.name,
                  phone: formData.phone,
                  email: formData.email,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode
                },
                totalAmount: totalPrice,
                totalEarnings: totalEarnings,
                paymentStatus: 'paid' as const,
                orderStatus: 'processing' as const
              };

              const orderResponse = await createOrder(orderData);
              
              setOrderId(orderResponse.data.orderId);
              setStep('success');
              clearCart();
              
              toast({
                title: 'Payment Successful!',
                description: `Your order ${orderResponse.data.orderId} has been confirmed.`,
              });
            }
          } catch (error: any) {
            console.error('Order creation error:', error);
            toast({
              title: 'Order creation failed',
              description: 'Payment received but order creation failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process.',
              variant: 'destructive',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Payment failed',
        description: error.response?.data?.message || 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    navigate('/cart');
    return null;
  }

  if (step === 'success') {
    return (
      <Layout>
        {/* Success Hero Section */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
              <Award className="w-4 h-4 mr-1.5 inline" />
              Order Confirmed
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Order Placed <span className="text-green-600">Successfully!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
              Thank you for your order! Your confirmation has been sent to your email.
            </p>
            <p className="text-base text-gray-600 mb-10">
              Order ID: <span className="font-mono font-bold text-green-600">#{orderId || 'Processing...'}</span>
            </p>
          </div>
        </section>

        {/* Success Details */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">GST Invoice Generated</h3>
                    <p className="text-gray-600 leading-relaxed">
                      A proper GST invoice will be included with your order package for your records and business purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <Link to="/" className="block">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Link to="/products" className="block">
                  <Button 
                    size="lg" 
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-[#233a95] py-12 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-white max-w-md">
                <p className="text-sm mb-2 opacity-90">₹20 discount for your first order</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Join our newsletter and get...</h2>
                <p className="text-sm opacity-80 mb-6">
                  Join our email subscription now to get updates on promotions and coupons.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg"
                  />
                  <Button className="bg-white text-blue-900 hover:bg-gray-100 px-6 rounded-lg font-semibold">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Coupon Image - Bottom Right */}
          <div className="absolute bottom-0 right-8 md:right-16 z-20">
            <img 
              src={couponImage} 
              alt="50% Discount Coupon" 
              className="w-64 md:w-80 h-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Background decoration */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-0" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-0" />
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-1.5">
            <Shield className="w-4 h-4 mr-1.5 inline" />
            Secure Checkout
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Complete Your <span className="text-blue-600">Order</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Just a few steps away from your products
          </p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/cart" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Cart
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {/* Progress */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${step === 'address' ? 'text-blue-600' : 'text-gray-500'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === 'address' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="hidden sm:inline font-medium">Address</span>
                </div>
                <div className={`flex-1 h-1 rounded-full ${step === 'payment' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="hidden sm:inline font-medium">Payment</span>
                </div>
              </div>

              {step === 'address' && (
                <form onSubmit={handleAddressSubmit} className="bg-white rounded-lg p-6 md:p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    Delivery Address
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="10 digit mobile number"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Full Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="House no., Street, Locality"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="State"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="6 digit pincode"
                        className="h-11 rounded-lg border-gray-300"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Continue to Payment
                  </Button>
                </form>
              )}

              {step === 'payment' && (
                <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    Payment Options
                  </h2>

                  <div className="space-y-4">
                    <label 
                      className={`flex items-start gap-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'cod' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                        className="w-5 h-5 text-blue-600 mt-0.5" 
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-1 text-lg">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive the product at your doorstep</div>
                      </div>
                    </label>
                    <label 
                      className={`flex items-start gap-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'online' 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => setPaymentMethod('online')}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="w-5 h-5 text-blue-600 mt-0.5" 
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                          Online Payment
                          <Badge className="text-xs bg-green-100 text-green-700 border border-green-300">Razorpay</Badge>
                        </div>
                        <div className="text-sm text-gray-600">UPI, Cards, Net Banking & Wallets</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => setStep('address')} 
                      className="border-gray-300 text-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white" 
                      onClick={handlePayment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'} - ₹{totalPrice.toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-white">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-1">Quantity: {item.quantity}</p>
                        <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">FREE</Badge>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-800">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Earning Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">💰 Your Total Earning</p>
                      <span className="text-2xl font-bold text-blue-600">₹{totalEarnings}</span>
                    </div>
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#233a95] py-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-white max-w-md">
              <p className="text-sm mb-2 opacity-90">₹20 discount for your first order</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join our newsletter and get...</h2>
              <p className="text-sm opacity-80 mb-6">
                Join our email subscription now to get updates on promotions and coupons.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg"
                />
                <Button className="bg-white text-blue-900 hover:bg-gray-100 px-6 rounded-lg font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coupon Image - Bottom Right */}
        <div className="absolute bottom-0 right-8 md:right-16 z-20">
          <img 
            src={couponImage} 
            alt="50% Discount Coupon" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl"
          />
        </div>
        
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-0" />
      </section>
    </Layout>
  );
};

export default CheckoutPage;
