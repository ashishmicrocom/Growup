import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Order from '../models/Order.js';

dotenv.config();

const orders = [
  {
    orderId: "ORD-2847",
    customer: "Rahul Sharma",
    product: "Smart Watch Pro",
    amount: 4999,
    reseller: "Priya Patel",
    paymentStatus: "paid",
    orderStatus: "processing"
  },
  {
    orderId: "ORD-2846",
    customer: "Sneha Gupta",
    product: "Bluetooth Earbuds",
    amount: 1299,
    reseller: "Amit Kumar",
    paymentStatus: "paid",
    orderStatus: "shipped"
  },
  {
    orderId: "ORD-2845",
    customer: "Amit Kumar",
    product: "Laptop Stand",
    amount: 2499,
    reseller: "Neha Verma",
    paymentStatus: "paid",
    orderStatus: "delivered"
  },
  {
    orderId: "ORD-2844",
    customer: "Priya Patel",
    product: "USB-C Hub",
    amount: 1899,
    reseller: "Rahul Sharma",
    paymentStatus: "failed",
    orderStatus: "cancelled"
  },
  {
    orderId: "ORD-2843",
    customer: "Vikram Singh",
    product: "Mechanical Keyboard",
    amount: 3499,
    reseller: "Priya Patel",
    paymentStatus: "paid",
    orderStatus: "delivered"
  },
  {
    orderId: "ORD-2842",
    customer: "Neha Verma",
    product: "Premium T-Shirt",
    amount: 799,
    reseller: "Anjali Rao",
    paymentStatus: "pending",
    orderStatus: "processing"
  },
  {
    orderId: "ORD-2841",
    customer: "Karan Mehta",
    product: "Yoga Mat",
    amount: 999,
    reseller: "Amit Kumar",
    paymentStatus: "paid",
    orderStatus: "shipped"
  },
  {
    orderId: "ORD-2840",
    customer: "Anjali Rao",
    product: "Essential Oil Diffuser",
    amount: 1599,
    reseller: "Neha Verma",
    paymentStatus: "paid",
    orderStatus: "delivered"
  }
];

const seedOrders = async () => {
  try {
    await connectDB();
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing orders');
    
    // Insert new orders
    await Order.insertMany(orders);
    console.log('✅ Orders seeded successfully');
    console.log(`📦 ${orders.length} orders added to database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  }
};

seedOrders();
