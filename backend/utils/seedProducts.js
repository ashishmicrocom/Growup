import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

dotenv.config();

const products = [
  // Sarees
  {
    productId: "SAREE001",
    name: "Banarasi Silk Saree",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
    category: "sarees",
    price: 1299,
    originalPrice: 2499,
    resellerEarning: 150,
    commission: 150,
    stock: "in_stock",
    active: true,
    stockQuantity: 40,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop"
    ],
    description: "Elegant Banarasi silk saree with intricate golden zari work. Perfect for weddings and festivals.",
    features: ["Pure Silk", "Handwoven Zari", "Free Blouse Piece", "6.3m Length"],
    isNew: false,
    isPopular: true
  },
  {
    productId: "SAREE002",
    name: "Cotton Printed Saree",
    image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=500&fit=crop",
    category: "sarees",
    price: 599,
    originalPrice: 999,
    resellerEarning: 80,
    commission: 80,
    stock: "in_stock",
    active: true,
    stockQuantity: 60,
    images: ["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop"],
    description: "Comfortable cotton saree with beautiful floral prints. Ideal for daily wear.",
    features: ["100% Cotton", "Machine Washable", "Light Weight", "All Season"],
    isNew: true,
    isPopular: false
  },
  {
    productId: "SAREE003",
    name: "Kanjivaram Silk Saree",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&auto=format&q=80",
    category: "sarees",
    price: 2499,
    originalPrice: 4999,
    resellerEarning: 300,
    commission: 300,
    stock: "in_stock",
    active: true,
    stockQuantity: 25,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop&auto=format&q=80"],
    description: "Traditional Kanjivaram silk saree with rich temple border design.",
    features: ["Pure Kanjivaram Silk", "Temple Border", "Contrast Pallu", "Wedding Special"],
    isNew: false,
    isPopular: true
  },
  // Suits
  {
    productId: "SUIT001",
    name: "Anarkali Suit Set",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop",
    category: "suits",
    price: 1499,
    originalPrice: 2799,
    resellerEarning: 200,
    commission: 200,
    stock: "in_stock",
    active: true,
    stockQuantity: 35,
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop"],
    description: "Beautiful Anarkali suit with heavy embroidery work and matching dupatta.",
    features: ["Georgette Fabric", "Embroidered", "Full Set", "Party Wear"],
    isNew: false,
    isPopular: true
  },
  {
    productId: "SUIT002",
    name: "Cotton Palazzo Suit",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop",
    category: "suits",
    price: 899,
    originalPrice: 1499,
    resellerEarning: 120,
    commission: 120,
    stock: "in_stock",
    active: true,
    stockQuantity: 50,
    images: ["https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=1000&fit=crop"],
    description: "Trendy palazzo suit in soft cotton. Perfect for casual outings.",
    features: ["Cotton Blend", "Palazzo Pants", "Printed Dupatta", "Casual Wear"],
    isNew: true,
    isPopular: false
  },
  // Bedsheets
  {
    productId: "BEDSHEET001",
    name: "King Size Bedsheet Set",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=500&fit=crop",
    category: "bedsheets",
    price: 799,
    originalPrice: 1299,
    resellerEarning: 100,
    commission: 100,
    stock: "in_stock",
    active: true,
    stockQuantity: 45,
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=1000&fit=crop"],
    description: "Premium cotton bedsheet set with 2 pillow covers. Elegant floral design.",
    features: ["300 Thread Count", "King Size", "2 Pillow Covers", "Color Fast"],
    isNew: false,
    isPopular: true
  },
  {
    productId: "BEDSHEET002",
    name: "Double Bed AC Blanket",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=500&fit=crop",
    category: "bedsheets",
    price: 999,
    originalPrice: 1799,
    resellerEarning: 130,
    commission: 130,
    stock: "in_stock",
    active: true,
    stockQuantity: 30,
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=1000&fit=crop"],
    description: "Soft and cozy AC blanket for comfortable sleep. Light weight yet warm.",
    features: ["Microfiber", "Double Bed Size", "Machine Washable", "All Season"],
    isNew: true,
    isPopular: false
  },
  // Women Fashion
  {
    productId: "WOMEN001",
    name: "Designer Kurti Set",
    image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=500&fit=crop",
    category: "women-fashion",
    price: 699,
    originalPrice: 1199,
    resellerEarning: 90,
    commission: 90,
    stock: "in_stock",
    active: true,
    stockQuantity: 55,
    images: ["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop"],
    description: "Stylish designer kurti with beautiful embroidery. Perfect for office wear.",
    features: ["Rayon Fabric", "A-Line Cut", "Embroidered", "Office Wear"],
    isNew: false,
    isPopular: true
  },
  {
    productId: "WOMEN002",
    name: "Printed Lehenga Choli",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop&auto=format&q=80",
    category: "women-fashion",
    price: 1899,
    originalPrice: 3499,
    resellerEarning: 250,
    commission: 250,
    stock: "in_stock",
    active: true,
    stockQuantity: 20,
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop&auto=format&q=80"],
    description: "Beautiful printed lehenga with matching choli and dupatta.",
    features: ["Art Silk", "Semi Stitched", "With Dupatta", "Festival Wear"],
    isNew: true,
    isPopular: false
  },
  // Daily Use
  {
    productId: "DAILY001",
    name: "Kitchen Organizer Set",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop",
    category: "daily-use",
    price: 499,
    originalPrice: 899,
    resellerEarning: 70,
    commission: 70,
    stock: "in_stock",
    active: true,
    stockQuantity: 80,
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1000&fit=crop"],
    description: "Complete kitchen organizer set with multiple containers and storage boxes.",
    features: ["Food Grade Plastic", "12 Pieces", "Airtight Lids", "BPA Free"],
    isNew: false,
    isPopular: true
  },
  {
    productId: "DAILY002",
    name: "Stainless Steel Water Bottle",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=500&fit=crop",
    category: "daily-use",
    price: 399,
    originalPrice: 699,
    resellerEarning: 50,
    commission: 50,
    stock: "in_stock",
    active: true,
    stockQuantity: 100,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=1000&fit=crop"],
    description: "Premium stainless steel water bottle. Keeps water cold for 24 hours.",
    features: ["1 Liter Capacity", "Double Wall", "Leak Proof", "BPA Free"],
    isNew: true,
    isPopular: false
  },
  {
    productId: "DAILY003",
    name: "Home Decor Set",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=500&fit=crop",
    category: "daily-use",
    price: 799,
    originalPrice: 1499,
    resellerEarning: 110,
    commission: 110,
    stock: "in_stock",
    active: true,
    stockQuantity: 40,
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=1000&fit=crop"],
    description: "Beautiful home decor set with decorative items for your living room.",
    features: ["5 Pieces", "Premium Quality", "Gift Box Packing", "Easy to Clean"],
    isNew: false,
    isPopular: false
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert new products
    await Product.insertMany(products);
    console.log('✅ Products seeded successfully');
    console.log(`📦 ${products.length} products added to database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
