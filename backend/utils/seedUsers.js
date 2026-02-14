import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const users = [
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    password: "password123",
    role: "reseller",
    status: "active",
    totalOrders: 145,
    totalEarnings: 28500,
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    phone: "+91 87654 32109",
    password: "password123",
    role: "reseller",
    status: "active",
    totalOrders: 98,
    totalEarnings: 18200,
  },
  {
    name: "Amit Kumar",
    email: "amit@gmail.com",
    phone: "+91 76543 21098",
    password: "password123",
    role: "user",
    status: "active",
    totalOrders: 12,
    totalEarnings: 0,
  },
  {
    name: "Sneha Gupta",
    email: "sneha@gmail.com",
    phone: "+91 65432 10987",
    password: "password123",
    role: "reseller",
    status: "blocked",
    totalOrders: 45,
    totalEarnings: 8500,
  },
  {
    name: "Vikram Singh",
    email: "vikram@gmail.com",
    phone: "+91 54321 09876",
    password: "password123",
    role: "user",
    status: "active",
    totalOrders: 8,
    totalEarnings: 0,
  },
  {
    name: "Neha Verma",
    email: "neha@gmail.com",
    phone: "+91 43210 98765",
    password: "password123",
    role: "reseller",
    status: "active",
    totalOrders: 67,
    totalEarnings: 12400,
  },
  {
    name: "Karan Mehta",
    email: "karan@gmail.com",
    phone: "+91 32109 87654",
    password: "password123",
    role: "user",
    status: "active",
    totalOrders: 3,
    totalEarnings: 0,
  },
  {
    name: "Anjali Rao",
    email: "anjali@gmail.com",
    phone: "+91 21098 76543",
    password: "password123",
    role: "reseller",
    status: "active",
    totalOrders: 89,
    totalEarnings: 16800,
  },
];

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();
    console.log('🗑️  Cleared existing users');

    // Insert new users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
