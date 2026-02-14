import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';

dotenv.config();

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    icon: '📱',
    active: true
  },
  {
    name: 'Fashion',
    description: 'Clothing and accessories',
    icon: '👗',
    active: true
  },
  {
    name: 'Health',
    description: 'Health and wellness products',
    icon: '💊',
    active: true
  },
  {
    name: 'Home & Living',
    description: 'Home decor and living essentials',
    icon: '🏠',
    active: true
  },
  {
    name: 'Accessories',
    description: 'Fashion and lifestyle accessories',
    icon: '⌚',
    active: true
  }
];

const seedCategories = async () => {
  try {
    await connectDB();

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Existing categories deleted');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created successfully`);

    createdCategories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    process.exit(1);
  }
};

seedCategories();
