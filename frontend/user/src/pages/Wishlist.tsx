import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight, Package, Sparkles, Star, Share2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import couponImage from '@/assets/coupon image.webp';

const WishlistPage = () => {
  const { items, removeFromWishlist, clearWishlist, totalItems } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      resellerEarning: item.resellerEarning,
    });
    toast({
      title: 'Added to cart!',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleRemove = (id: string, name: string) => {
    removeFromWishlist(id);
    toast({
      title: 'Removed from wishlist',
      description: `${name} has been removed from your wishlist.`,
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        {/* Hero Section - Empty Wishlist */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Heart className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Your Wishlist is <span className="text-blue-600">Empty</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg mb-10">
              Save your favorite products here to review and purchase later!
            </p>
            <Link to="/products">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg">
                <Package className="w-5 h-5 mr-2" />
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Your <span className="text-blue-600">Wishlist</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your favorite products saved for later • {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </p>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Saved Items
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {items.map((item) => {
              const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
              
              return (
                <div key={item._id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link to={`/products/${item._id}`} className="block relative">
                    <div className="aspect-square overflow-hidden bg-white relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
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

                  <div className="p-3 border-t border-gray-100 relative">
                    {/* Action Icons - Right Side */}
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      {/* Remove from Wishlist Button */}
                      <button
                        onClick={() => handleRemove(item._id, item.name)}
                        className="w-7 h-7 rounded-full bg-red-500 text-white border border-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
                        title="Remove from Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                      
                      {/* Share Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (navigator.share) {
                            navigator.share({
                              title: item.name,
                              text: `Check out this ${item.name} on Flourisel!`,
                              url: window.location.origin + `/products/${item._id}`,
                            });
                          }
                        }}
                        className="w-7 h-7 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center transition-all"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <Link to={`/products/${item._id}`}>
                      {/* Rating */}
                      <div className="flex items-center gap-0.5 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-[10px] text-gray-500 ml-1">5</span>
                      </div>
                      {/* Product Name */}
                      <h3 className="font-normal text-[13px] text-gray-700 mb-2 line-clamp-2 leading-tight min-h-[36px] hover:text-green-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Stock Status */}
                    <div className="mb-2">
                      <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">
                        IN STOCK
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-red-500 font-bold text-base">₹{item.price.toLocaleString()}</span>
                      <span className="text-gray-400 line-through text-xs">
                        ₹{item.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded border border-cyan-400 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-500 text-xs font-medium h-8 transition-all mb-2"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to cart
                    </Button>

                    {/* Reseller Earning */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] text-gray-600 font-medium">Earn</span>
                        <span className="text-sm font-bold text-blue-600">₹{item.resellerEarning}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gray-50 rounded-lg p-8 md:p-12 border border-gray-200">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Looking for More?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Browse our complete collection of products and add more to your wishlist!
            </p>
            <Link to="/products">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-medium rounded-lg">
                <Package className="w-5 h-5 mr-2" />
                Explore Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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

export default WishlistPage;
