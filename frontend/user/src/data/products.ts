export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  resellerEarning: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

export const categories = [
  { id: 'sarees', name: 'Sarees', icon: '👗' },
  { id: 'suits', name: 'Suits', icon: '👔' },
  { id: 'bedsheets', name: 'Bedsheets', icon: '🛏️' },
  { id: 'women-fashion', name: 'Women Fashion', icon: '👚' },
  { id: 'daily-use', name: 'Daily Use', icon: '🏠' },
];

export const products: Product[] = [
  {
    id: 'saree-001',
    name: 'Banarasi Silk Saree',
    category: 'sarees',
    price: 1299,
    originalPrice: 2499,
    resellerEarning: 150,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop',
    ],
    description: 'Elegant Banarasi silk saree with intricate golden zari work. Perfect for weddings and festivals.',
    features: ['Pure Silk', 'Handwoven Zari', 'Free Blouse Piece', '6.3m Length'],
    isPopular: true,
  },
  {
    id: 'saree-002',
    name: 'Cotton Printed Saree',
    category: 'sarees',
    price: 599,
    originalPrice: 999,
    resellerEarning: 80,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop',
    ],
    description: 'Comfortable cotton saree with beautiful floral prints. Ideal for daily wear.',
    features: ['100% Cotton', 'Machine Washable', 'Light Weight', 'All Season'],
    isNew: true,
  },
  {
    id: 'saree-003',
    name: 'Kanjivaram Silk Saree',
    category: 'sarees',
    price: 2499,
    originalPrice: 4999,
    resellerEarning: 300,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&auto=format&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop&auto=format&q=80',
    ],
    description: 'Traditional Kanjivaram silk saree with rich temple border design.',
    features: ['Pure Kanjivaram Silk', 'Temple Border', 'Contrast Pallu', 'Wedding Special'],
    isPopular: true,
  },
  {
    id: 'suit-001',
    name: 'Anarkali Suit Set',
    category: 'suits',
    price: 1499,
    originalPrice: 2799,
    resellerEarning: 200,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop',
    ],
    description: 'Beautiful Anarkali suit with heavy embroidery work and matching dupatta.',
    features: ['Georgette Fabric', 'Embroidered', 'Full Set', 'Party Wear'],
    isPopular: true,
  },
  {
    id: 'suit-002',
    name: 'Cotton Palazzo Suit',
    category: 'suits',
    price: 899,
    originalPrice: 1499,
    resellerEarning: 120,
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=1000&fit=crop',
    ],
    description: 'Trendy palazzo suit in soft cotton. Perfect for casual outings.',
    features: ['Cotton Blend', 'Palazzo Pants', 'Printed Dupatta', 'Casual Wear'],
    isNew: true,
  },
  {
    id: 'bedsheet-001',
    name: 'King Size Bedsheet Set',
    category: 'bedsheets',
    price: 799,
    originalPrice: 1299,
    resellerEarning: 100,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=1000&fit=crop',
    ],
    description: 'Premium cotton bedsheet set with 2 pillow covers. Elegant floral design.',
    features: ['300 Thread Count', 'King Size', '2 Pillow Covers', 'Color Fast'],
    isPopular: true,
  },
  {
    id: 'bedsheet-002',
    name: 'Double Bed AC Blanket',
    category: 'bedsheets',
    price: 999,
    originalPrice: 1799,
    resellerEarning: 130,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=1000&fit=crop',
    ],
    description: 'Soft and cozy AC blanket for comfortable sleep. Light weight yet warm.',
    features: ['Microfiber', 'Double Bed Size', 'Machine Washable', 'All Season'],
    isNew: true,
  },
  {
    id: 'women-001',
    name: 'Designer Kurti Set',
    category: 'women-fashion',
    price: 699,
    originalPrice: 1199,
    resellerEarning: 90,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop',
    ],
    description: 'Stylish designer kurti with beautiful embroidery. Perfect for office wear.',
    features: ['Rayon Fabric', 'A-Line Cut', 'Embroidered', 'Office Wear'],
    isPopular: true,
  },
  {
    id: 'women-002',
    name: 'Printed Lehenga Choli',
    category: 'women-fashion',
    price: 1899,
    originalPrice: 3499,
    resellerEarning: 250,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop&auto=format&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop&auto=format&q=80',
    ],
    description: 'Beautiful printed lehenga with matching choli and dupatta.',
    features: ['Art Silk', 'Semi Stitched', 'With Dupatta', 'Festival Wear'],
    isNew: true,
  },
  {
    id: 'daily-001',
    name: 'Kitchen Organizer Set',
    category: 'daily-use',
    price: 499,
    originalPrice: 899,
    resellerEarning: 70,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1000&fit=crop',
    ],
    description: 'Complete kitchen organizer set with multiple containers and storage boxes.',
    features: ['Food Grade Plastic', '12 Pieces', 'Airtight Lids', 'BPA Free'],
    isPopular: true,
  },
  {
    id: 'daily-002',
    name: 'Stainless Steel Water Bottle',
    category: 'daily-use',
    price: 399,
    originalPrice: 699,
    resellerEarning: 50,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=1000&fit=crop',
    ],
    description: 'Premium stainless steel water bottle. Keeps water cold for 24 hours.',
    features: ['1 Liter Capacity', 'Double Wall', 'Leak Proof', 'BPA Free'],
    isNew: true,
  },
  {
    id: 'daily-003',
    name: 'Home Decor Set',
    category: 'daily-use',
    price: 799,
    originalPrice: 1499,
    resellerEarning: 110,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=1000&fit=crop',
    ],
    description: 'Beautiful home decor set with decorative items for your living room.',
    features: ['5 Pieces', 'Premium Quality', 'Gift Box Packing', 'Easy to Clean'],
  },
];

export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductsByCategory = (category: string) => 
  products.filter(p => p.category === category);
export const getPopularProducts = () => products.filter(p => p.isPopular);
export const getNewProducts = () => products.filter(p => p.isNew);
