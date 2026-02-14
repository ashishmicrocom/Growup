import dotenv from 'dotenv';
import mongoose from 'mongoose';
import HeroSlide from './models/HeroSlide.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const heroSlides = [
  {
    subtitle: "",
    text: "Start Your Business Without\nInvestment, Inventory or Risk.",
    description: "START A BUSINESS WITH NO INVESTMENT, NO INVENTORY, AND NO RISK. WORK FROM ANYWHERE AND EARN WITH EASE.",
    image: "/src/assets/hero images/slide1.png",
    ctaButtons: [
      {
        text: "Start Earning Now",
        link: "/register",
        variant: "secondary"
      }
    ],
    features: [
      {
        text: "NO STOCK REQUIRED",
        icon: "package"
      },
      {
        text: "PAN INDIA DELIVERY",
        icon: "users"
      },
      {
        text: "TRANSPARENT EARNINGS",
        icon: "truck"
      }
    ],
    order: 1,
    contentAlignment: "right",
    isActive: true
  },
  {
    subtitle: "",
    text: "Sell Online. Earn Real Income.\nGrow With India.",
    description: "GROWUP INDIA HELPS YOU START A DIGITAL RESELLING BUSINESS WITH ZERO STOCK, AUTOMATED DELIVERY, AND TRANSPARENT EARNINGS.",
    image: "/src/assets/hero images/slide2.png",
    ctaButtons: [
      {
        text: "Browse Products",
        link: "/products",
        variant: "secondary"
      }
    ],
    features: [
      {
        text: "NO STOCK REQUIRED",
        icon: "package"
      },
      {
        text: "PAN INDIA DELIVERY",
        icon: "users"
      },
      {
        text: "TRANSPARENT EARNINGS",
        icon: "truck"
      }
    ],
    order: 2,
    contentAlignment: "left",
    isActive: true
  },
  {
    subtitle: "",
    text: "Turn Your Network Into a\nSource of Income.",
    description: "A TRANSPARENT AND STRUCTURED WAY TO EARN ONLINE BY RESELLING PRODUCTS AND BUILDING A NETWORK.",
    image: "/src/assets/hero images/slide3.png",
    ctaButtons: [
      {
        text: "Start Earning Today",
        link: "/register",
        variant: "secondary"
      }
    ],
    features: [
      {
        text: "NO STOCK REQUIRED",
        icon: "package"
      },
      {
        text: "TRANSPARENT EARNINGS",
        icon: "users"
      },
      {
        text: "PAN INDIA DELIVERY",
        icon: "truck"
      }
    ],
    order: 3,
    contentAlignment: "right",
    isActive: true
  }
];

const seedHeroSlides = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing hero slides
    await HeroSlide.deleteMany({});
    console.log('🗑️  Cleared existing hero slides');
    
    // Insert new hero slides
    await HeroSlide.insertMany(heroSlides);
    console.log('✅ Hero slides seeded successfully');
    console.log(`📊 Total slides: ${heroSlides.length}`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hero slides:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedHeroSlides();
