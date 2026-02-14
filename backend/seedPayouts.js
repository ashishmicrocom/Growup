import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Payout from './models/Payout.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/growup';

const payouts = [
  {
    payoutId: 'PAY001',
    reseller: 'Priya Patel',
    amount: 15000,
    status: 'completed',
    date: new Date('2024-01-15'),
    method: 'Bank Transfer',
    transactionId: 'TXN1234567890',
    notes: 'Monthly commission payout'
  },
  {
    payoutId: 'PAY002',
    reseller: 'Neha Verma',
    amount: 12500,
    status: 'completed',
    date: new Date('2024-01-14'),
    method: 'UPI',
    transactionId: 'UPI0987654321',
    notes: 'Commission for December sales'
  },
  {
    payoutId: 'PAY003',
    reseller: 'Amit Kumar',
    amount: 8500,
    status: 'pending',
    date: new Date('2024-01-16'),
    method: 'Bank Transfer',
    notes: 'Awaiting bank verification'
  },
  {
    payoutId: 'PAY004',
    reseller: 'Rahul Sharma',
    amount: 10200,
    status: 'completed',
    date: new Date('2024-01-13'),
    method: 'UPI',
    transactionId: 'UPI1122334455',
    notes: 'Regular payout'
  },
  {
    payoutId: 'PAY005',
    reseller: 'Anjali Rao',
    amount: 6800,
    status: 'processing',
    date: new Date('2024-01-16'),
    method: 'Bank Transfer',
    notes: 'In processing queue'
  },
  {
    payoutId: 'PAY006',
    reseller: 'Priya Patel',
    amount: 13500,
    status: 'completed',
    date: new Date('2023-12-15'),
    method: 'Bank Transfer',
    transactionId: 'TXN0987654321',
    notes: 'December payout'
  },
  {
    payoutId: 'PAY007',
    reseller: 'Amit Kumar',
    amount: 13900,
    status: 'completed',
    date: new Date('2023-12-16'),
    method: 'UPI',
    transactionId: 'UPI5544332211',
    notes: 'Year-end bonus included'
  },
  {
    payoutId: 'PAY008',
    reseller: 'Neha Verma',
    amount: 5700,
    status: 'completed',
    date: new Date('2023-11-14'),
    method: 'Bank Transfer',
    transactionId: 'TXN1122998877',
    notes: 'November commission'
  }
];

const seedPayouts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing payouts
    await Payout.deleteMany({});
    console.log('🗑️  Cleared existing payouts');
    
    // Insert seed payouts
    await Payout.insertMany(payouts);
    console.log(`✅ Successfully seeded ${payouts.length} payouts`);
    
    // Display seeded payouts
    const seededPayouts = await Payout.find({});
    console.log('\n📋 Seeded Payouts:');
    seededPayouts.forEach(payout => {
      console.log(`  ${payout.payoutId} - ${payout.reseller} - ₹${payout.amount} - ${payout.status}`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding payouts:', error);
    process.exit(1);
  }
};

seedPayouts();
