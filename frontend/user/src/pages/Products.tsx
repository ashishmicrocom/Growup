import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Share2, Star, Sparkles, TrendingUp, Heart, Grid3x3, List, ChevronRight, ChevronDown, SlidersHorizontal, Eye } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import couponImage from '@/assets/coupon image.webp';
import { getPublicProducts, type Product } from '@/services/productService';
import api from '@/lib/api';

const ProductCard = ({ product, user, navigate }: { product: Product; user: any; navigate: any }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      resellerEarning: product.resellerEarning,
    });
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        resellerEarning: product.resellerEarning,
      });
      toast({
        title: 'Added to wishlist!',
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleShare = () => {
    if (!user?.myReferralCode) {
      toast({
        title: 'Login Required',
        description: 'Please login to share products with your referral code.',
        variant: 'destructive',
      });
      return;
    }

    const shareUrl = new URL(window.location.origin + `/products/${product._id}`);
    shareUrl.searchParams.set('ref', user.myReferralCode);
    const shareLink = shareUrl.toString();
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on Flourisel!`,
        url: shareLink,
      });
    } else {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: 'Link copied!',
        description: 'Product link with your referral code has been copied.',
      });
    }
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 w-[280px] sm:w-[300px] lg:w-[240px] xl:w-[280px] mx-auto">
      <Link to={`/products/${product._id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-white relative">
          <img
            src={product.image.startsWith('http') || product.image.startsWith('/uploads') ? 
              (product.image.startsWith('http') ? product.image : `http://localhost:7777${product.image}`) : 
              product.image
            }
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop';
            }}
          />
          {/* Sale Badge - Top Left */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-cyan-400 hover:bg-cyan-500 text-white px-2 py-0.5 text-[10px] font-bold rounded">
                SALE
              </Badge>
            </div>
          )}
          {/* Discount Percentage Badge - Top Right */}
          {discount > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-0.5 text-[10px] font-bold rounded">
                {discount}%
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-2 sm:p-3 border-t border-gray-100 relative">
        {/* Action Icons - Right Side */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2 z-10">
          {/* View Details Button */}
          <Link to={`/products/${product._id}`}>
            <button
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-500 hover:text-green-600 flex items-center justify-center transition-all"
              title="View Details"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </Link>
          
          {/* Wishlist/Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleWishlistToggle();
            }}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all border ${
              inWishlist
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50 hover:border-red-500 hover:text-red-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          
          {/* Share Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleShare();
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center transition-all"
            title="Share"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
        
        <Link to={`/products/${product._id}`}>
          {/* Rating */}
          <div className="flex items-center gap-0.5 mb-2 sm:mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-[9px] sm:text-[10px] text-gray-500 ml-1">5</span>
          </div>
          {/* Product Name */}
          <h3 className="font-normal text-xs sm:text-[13px] text-gray-700 mb-1.5 sm:mb-2 line-clamp-2 leading-tight min-h-[32px] sm:min-h-[36px] hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stock Status */}
        <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5">
          {product.stock === 'in_stock' && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-green-600 uppercase tracking-wide">
              IN STOCK
            </span>
          )}
          {product.stock === 'low_stock' && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
              LOW STOCK
            </span>
          )}
          {product.stock === 'out_of_stock' && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-red-600 uppercase tracking-wide">
              OUT OF STOCK
            </span>
          )}
          {product.stockQuantity !== undefined && product.stock !== 'out_of_stock' && (
            <span className="text-[8px] sm:text-[9px] text-gray-500">
              ({product.stockQuantity} left)
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-red-500 font-bold text-sm sm:text-base">₹{product.price.toLocaleString()}</span>
          <span className="text-gray-400 line-through text-[10px] sm:text-xs">
            ₹{product.originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded border border-cyan-400 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-500 text-[11px] sm:text-xs font-medium h-7 sm:h-8 transition-all"
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'price-low' | 'price-high'>('popular');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAllCategoriesDropdown, setShowAllCategoriesDropdown] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(52);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Update search query when URL parameter changes
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicProducts({
          category: selectedCategory,
          search: searchQuery,
          sortBy,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          limit: itemsPerPage
        });
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, priceRange, itemsPerPage]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Layout>
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Premium Fashion Collection
              </h2>
              <p className="text-xl text-purple-600 font-semibold mb-2">
                Delivered to <span className="text-pink-700">your Home</span>
              </p>
            </div>
            <div className="flex justify-end">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop" 
                alt="Fashion Collection" 
                className="rounded-2xl shadow-xl max-w-md w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">HOME</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">SHOP</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 lg:gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-48 xl:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 xl:p-5 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                <style dangerouslySetInnerHTML={{__html: `
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                  }
                `}} />
                {/* All Categories Button */}
                <div className="relative mb-6">
                  <button 
                    onClick={() => setShowAllCategoriesDropdown(!showAllCategoriesDropdown)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-3 px-4 font-medium flex items-center justify-between transition-all"
                  >
                    ALL CATEGORIES
                    <ChevronDown className={`text-sm transition-transform ${showAllCategoriesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showAllCategoriesDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setShowAllCategoriesDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors"
                      >
                        All Products
                      </button>
                      {categories
                        .filter(cat => !cat.parentCategory) // Only show parent categories
                        .map((category) => (
                          <button
                            key={category._id}
                            onClick={() => {
                              setSelectedCategory(category._id);
                              setShowAllCategoriesDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors flex items-center gap-2"
                          >
                            <span>{category.icon || '📦'}</span>
                            {category.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Product Categories */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wide">Product Categories</h3>
                  <div className="space-y-1">
                    {categories
                      .filter(cat => !cat.parentCategory) // Only show parent categories
                      .map((category) => {
                        const subcategories = categories.filter(cat => cat.parentCategory === category._id);
                        return (
                          <div key={category._id}>
                            <div className="flex items-center justify-between py-2 cursor-pointer group">
                              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedCategory === category._id}
                                  onChange={() => setSelectedCategory(selectedCategory === category._id ? 'all' : category._id)}
                                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-green-600">{category.name}</span>
                              </label>
                              {subcategories.length > 0 && (
                                <button
                                  onClick={() => toggleCategory(category._id)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <ChevronRight 
                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                      expandedCategories.includes(category._id) ? 'rotate-90' : ''
                                    }`} 
                                  />
                                </button>
                              )}
                            </div>
                            {/* Subcategories */}
                            {expandedCategories.includes(category._id) && subcategories.length > 0 && (
                              <div className="ml-6 mt-1 mb-2 space-y-1.5 border-l-2 border-gray-200 pl-3">
                                {subcategories.map((subcat) => (
                                  <label key={subcat._id} className="flex items-center gap-2 cursor-pointer py-1">
                                    <input 
                                      type="checkbox"
                                      checked={selectedCategory === subcat._id}
                                      onChange={() => setSelectedCategory(selectedCategory === subcat._id ? 'all' : subcat._id)}
                                      className="w-3.5 h-3.5 rounded border-gray-300 text-green-500" 
                                    />
                                    <span className="text-xs text-gray-600 hover:text-green-600">{subcat.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Filter by Price */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wide">Filter by Price</h3>
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>Price: ₹{priceRange[0]} - ₹{priceRange[1]}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gray-800 hover:bg-gray-900 text-white rounded text-xs"
                  >
                    FILTER
                  </Button>
                </div>

                {/* Product Status */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wide">Product Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-500" />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-500" />
                      <span className="text-sm text-gray-700">On Sale</span>
                    </label>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wide">Brands</h3>
                  <div className="space-y-2">
                    {['Fabindia', 'Biba', 'W for Woman', 'Global Desi', 'Aurelia'].map((brand) => (
                      <label key={brand} className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-500" />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </div>
                        <span className="text-xs text-gray-400">(2)</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ad Banner */}
                <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 text-center overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=200&fit=crop" 
                    alt="Fashion Collection" 
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-bold text-gray-800 mb-2">Premium Fashion Collection</h4>
                  <p className="text-xs text-gray-600 mb-3">Start Your Reselling Business Today</p>
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full text-xs px-4"
                    onClick={() => {
                      setSelectedCategory('all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Shop Now →
                  </Button>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-xl"
              >
                <SlidersHorizontal className="w-6 h-6" />
              </Button>
            </div>

            {/* Main Products Area */}
            <div className="flex-1">
              {/* Filters Bar */}
              <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      We found <span className="font-semibold text-gray-900">{products.length}</span> items!
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        ✕ Clear
                      </button>
                      {selectedCategory !== 'all' && (
                        <button
                          className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-green-100 text-green-700 rounded-full"
                        >
                          ✕ {categories.find(c => c._id === selectedCategory)?.name}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto overflow-x-auto">
                    <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                      >
                        <Grid3x3 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                      >
                        <List className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex-shrink-0"
                    >
                      <option value="popular">Sort by latest</option>
                      <option value="new">New Arrivals</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex-shrink-0"
                    >
                      <option value={12}>Show: 12</option>
                      <option value={24}>Show: 24</option>
                      <option value={36}>Show: 36</option>
                      <option value={52}>Show: 52</option>
                      <option value={100}>Show: 100</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-white rounded-lg">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-lg text-red-600 font-medium">{error}</p>
                  <p className="text-sm text-gray-500 mt-2">Please try again later</p>
                </div>
              ) : (
                <>
                  <div className={`${viewMode === 'grid' ? 'flex flex-wrap justify-center sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col items-center'} gap-4 sm:gap-6 w-full`}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} user={user} navigate={navigate} />
                    ))}
                  </div>

                  {products.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-lg">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-lg text-gray-600 font-medium">No products found</p>
                      <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                    </div>
                  )}
                </>
              )}
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

export default ProductsPage;
