import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Share2, Truck, FileCheck, Headphones, ChevronRight, Minus, Plus, Heart, Star, Check, Facebook, Linkedin, Copy, PhoneCallIcon } from 'lucide-react';
import ReactImageMagnify from 'react-image-magnify';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPublicProductById, getPublicProducts } from '@/services/productService';
import type { Product } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/hooks/use-toast';
import couponImage from '@/assets/coupon image.webp';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'reviews'>('description');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Capture referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      sessionStorage.setItem('sharedReferralCode', refCode);
    } else {
      const storedRef = sessionStorage.getItem('sharedReferralCode');
      if (storedRef) {
        setReferralCode(storedRef);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getPublicProductById(id);
        setProduct(response.data);
        
        // Fetch related products from same category
        if (response.data.category) {
          const relatedResponse = await getPublicProducts({ category: response.data.category, limit: 5 });
          setRelatedProducts(relatedResponse.data.filter(p => p._id !== id).slice(0, 4));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const inWishlist = product ? isInWishlist(product._id) : false;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Product not found'}</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!user) {
      // Get referral code from state or sessionStorage
      const refCode = referralCode || sessionStorage.getItem('sharedReferralCode');
      if (refCode) {
        navigate(`/register?ref=${refCode}`);
      } else {
        navigate('/register');
      }
      toast({
        title: 'Registration Required',
        description: 'Please register to add items to cart.',
      });
      return;
    }

    // User is logged in, add to cart normally
    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        resellerEarning: product.resellerEarning,
      });
    }
    toast({
      title: 'Added to cart!',
      description: `${quantity} x ${product.name} added to cart.`,
    });
  };

  const handleShare = () => {
    if (!user?.myReferralCode) {
      toast({
        title: 'Login Required',
        description: 'Please login to share products with your referral code.',
        variant: 'destructive',
      });
      return;
    }
    setShowShareDialog(true);
  };

  const getShareLink = () => {
    if (!user?.myReferralCode) return window.location.href;
    const url = new URL(window.location.href);
    url.searchParams.set('ref', user.myReferralCode);
    return url.toString();
  };

  const handleCopyShareLink = () => {
    const shareLink = getShareLink();
    navigator.clipboard.writeText(shareLink);
    setCopiedShare(true);
    toast({
      title: 'Link copied!',
      description: 'Share link with your referral code has been copied.',
    });
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSocialShare = (platform: 'whatsapp' | 'facebook' | 'telegram') => {
    const shareLink = getShareLink();
    const shareText = `Check out this amazing product: ${product.name} on Flourisel!`;
    
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareLink)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`;
        break;
    }
    window.open(url, '_blank');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (inWishlist) {
      toast({
        title: 'Already in wishlist',
        description: `${product.name} is already in your wishlist.`,
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

  const discount = product ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  // Show notice for shared users who aren't logged in
  const isSharedUser = !user && referralCode;

  // For shared users, show minimal layout without header/footer
  if (isSharedUser) {
    return (
      <div className="min-h-screen bg-white">
        {/* Notice Banner for Shared Users */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 sticky top-0 z-50 shadow-lg">
          <div className="container mx-auto">
            <p className="text-center text-sm md:text-base">
              <span className="font-semibold">🎉 You've been invited to join Flourisel!</span> 
              <span className="ml-2">Register now to add items to cart and start earning.</span>
              <button 
                onClick={() => navigate(`/register?ref=${referralCode}`)}
                className="ml-4 bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Register Now
              </button>
            </p>
          </div>
        </div>

        {/* Product Details Only */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Image Gallery */}
              <div>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative bg-white rounded-lg border border-gray-200 p-8 aspect-square flex items-center justify-center">
                    {discount > 0 && (
                      <Badge className="absolute top-4 left-4 bg-cyan-400 hover:bg-cyan-500 text-white px-3 py-1 text-sm font-bold rounded z-10">
                        SALE
                      </Badge>
                    )}
                    <ReactImageMagnify
                      {...{
                        smallImage: {
                          alt: product?.name || 'Product',
                          isFluidWidth: true,
                          src: (product?.images[selectedImage] || product?.image)?.startsWith('http') || (product?.images[selectedImage] || product?.image)?.startsWith('/uploads') ? 
                            ((product?.images[selectedImage] || product?.image)?.startsWith('http') ? (product?.images[selectedImage] || product?.image) : `http://localhost:7777${product?.images[selectedImage] || product?.image}`) : 
                            (product?.images[selectedImage] || product?.image),
                        },
                        largeImage: {
                          src: (product?.images[selectedImage] || product?.image)?.startsWith('http') || (product?.images[selectedImage] || product?.image)?.startsWith('/uploads') ? 
                            ((product?.images[selectedImage] || product?.image)?.startsWith('http') ? (product?.images[selectedImage] || product?.image) : `http://localhost:7777${product?.images[selectedImage] || product?.image}`) : 
                            (product?.images[selectedImage] || product?.image),
                          width: 1200,
                          height: 1200,
                        },
                        enlargedImageContainerDimensions: {
                          width: '150%',
                          height: '150%',
                        },
                        imageClassName: 'object-contain',
                        enlargedImageClassName: 'bg-white',
                      }}
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex gap-3">
                    {product?.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all group ${
                          selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img 
                          src={img?.startsWith('http') || img?.startsWith('/uploads') ? 
                            (img?.startsWith('http') ? img : `http://localhost:7777${img}`) : 
                            img
                          } 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Product Info */}
              <div className="space-y-6">
                {/* Product Title */}
                <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-red-500">₹{product?.price.toLocaleString()}</span>
                  <span className="text-xl text-gray-400 line-through">₹{product?.originalPrice.toLocaleString()}</span>
                  {discount > 0 && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm font-bold">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-3">
                  <div className="inline-block">
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">
                      IN STOCK
                    </span>
                  </div>
                  {product?.stockQuantity !== undefined && (
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">{product.stockQuantity}</span> units available
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-gray-600 leading-relaxed">
                  {product?.description}
                </p>

                {/* Add to Cart - Redirects to Register */}
                <Button 
                  size="lg" 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-semibold rounded-lg"
                  onClick={handleAddToCart}
                >
                  Register to Add to Cart
                </Button>

                {/* Register Prompt */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-semibold">Want to earn while shopping?</span><br/>
                    Register now and become part of the Flourisel team!
                  </p>
                  <Button 
                    onClick={() => navigate(`/register?ref=${referralCode}`)}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Account Now
                  </Button>
                </div>

                {/* Product Features */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Type: Organic</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">MFG: Jun 4, 2021</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">LIFE: 30 days</span>
                  </div>
                </div>

                {/* Reseller Earning */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-5">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Potential Earning on Each Sale</p>
                    <div className="text-3xl font-bold text-blue-600 mb-2">₹{product?.resellerEarning}</div>
                    <p className="text-xs text-gray-600">Register and start earning today!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <Layout>
      {/* Notice Banner for Shared Users */}
      {isSharedUser && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
          <div className="container mx-auto">
            <p className="text-center text-sm md:text-base">
              <span className="font-semibold">🎉 You've been invited to join Flourisel!</span> 
              <span className="ml-2">Register now to add items to cart and start earning.</span>
              <button 
                onClick={() => navigate(`/register?ref=${referralCode}`)}
                className="ml-4 bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Register Now
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <section className="bg-gray-50 mt-[2rem] border-b border-gray-200 pb-[1rem]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">HOME</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-blue-600 transition-colors">All Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">{product?.name}</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image Gallery */}
            <div>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-white rounded-lg border border-gray-200 p-8 aspect-square flex items-center justify-center overflow-hidden">
                  {discount > 0 && (
                    <Badge className="absolute top-4 left-4 bg-cyan-400 hover:bg-cyan-500 text-white px-3 py-1 text-sm font-bold rounded z-10">
                      SALE
                    </Badge>
                  )}
                  <img
                      src={(product?.images[selectedImage] || product?.image)?.startsWith('http') || (product?.images[selectedImage] || product?.image)?.startsWith('/uploads') ? 
                        ((product?.images[selectedImage] || product?.image)?.startsWith('http') ? (product?.images[selectedImage] || product?.image) : `http://localhost:7777${product?.images[selectedImage] || product?.image}`) : 
                        (product?.images[selectedImage] || product?.image)
                      }
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex gap-3">
                  {product?.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={img?.startsWith('http') || img?.startsWith('/uploads') ? 
                          (img?.startsWith('http') ? img : `http://localhost:7777${img}`) : 
                          img
                        } 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* SKU & Reviews */}
              <div className="flex items-center gap-6 text-sm">
                {/* <span className="text-gray-500">
                  <span className="font-medium">SKU:</span> Wooh's
                </span> */}
                {/* <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600">(1 review)</span>
                </div> */}
                {/* <span className="text-gray-500">
                  <span className="font-medium">Brand:</span> Wooh's
                </span> */}
              </div>

              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-red-500">₹{product?.price.toLocaleString()}</span>
                <span className="text-xl text-gray-400 line-through">₹{product?.originalPrice.toLocaleString()}</span>
                {discount > 0 && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm font-bold">
                    {discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                <div className="inline-block">
                  {product?.stock === 'in_stock' && (
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">
                      IN STOCK
                    </span>
                  )}
                  {product?.stock === 'low_stock' && (
                    <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded">
                      LOW STOCK
                    </span>
                  )}
                  {product?.stock === 'out_of_stock' && (
                    <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                {product?.stockQuantity !== undefined && (
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{product.stockQuantity}</span> units available
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-600 leading-relaxed">
                {product?.description}
              </p>

              {/* Size Selection */}
              {product?.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">Size:</h3>
                    {selectedSize && (
                      <span className="text-sm text-gray-600">
                        {product.sizes.find(s => s.size === selectedSize)?.measurement}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sizeItem) => (
                      <button
                        key={sizeItem.size}
                        onClick={() => setSelectedSize(sizeItem.size)}
                        disabled={!sizeItem.inStock}
                        className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                          selectedSize === sizeItem.size
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : sizeItem.inStock
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {sizeItem.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product?.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Color:</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((colorItem) => (
                      <button
                        key={colorItem.name}
                        onClick={() => setSelectedColor(colorItem.name)}
                        disabled={!colorItem.inStock}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedColor === colorItem.name
                            ? 'border-blue-600 bg-blue-50'
                            : colorItem.inStock
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-gray-300"
                          style={{ backgroundColor: colorItem.hexCode }}
                        />
                        <span className={`text-sm font-medium ${!colorItem.inStock ? 'line-through text-gray-400' : ''}`}>
                          {colorItem.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button 
                  size="lg" 
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base font-semibold rounded-lg flex-1"
                  onClick={handleAddToCart}
                >
                  Add to cart
                </Button>
              </div>

              {/* Wishlist & Compare */}
              <div className="flex items-center gap-6 pt-2">
                <button 
                  onClick={handleWishlistToggle}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm font-medium">ADD TO WISHLIST</span>
                </button>
                {/* <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">COMPARE</span>
                </button> */}
              </div>

              {/* Product Features */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Type: {product?.type || 'Organic'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">MFG: {product?.mfgDate || 'Jun 4, 2021'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">LIFE: {product?.lifespan || '30 days'}</span>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="pt-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 font-medium min-w-20">Category:</span>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/products" className="text-blue-600 hover:underline">{product?.category}</Link>
                  </div>
                </div>
                {product?.tags && product.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-20">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index}>
                          <Link to="/products" className="text-blue-600 hover:underline">{tag}</Link>
                          {index < product.tags!.length - 1 && ','}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 font-medium min-w-20">Brand:</span>
                  <span className="text-gray-700">{product?.brand || "Wooh's"}</span>
                </div>
              </div>

              {/* Social Share */}
              <div className="flex items-center gap-3 pt-4">
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                {/* <button className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
                  <Whatsapp className="w-5 h-5" />
                </button> */}
                <button className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                  <PhoneCallIcon className="w-5 h-5" />
                </button>
                {/* <button 
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button> */}
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Free Shipping apply to all orders over ₹100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Guranteed 100% Organic from natural farmas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">1 Day Returns if you change your mind</p>
                </div>
              </div>

              {/* Reseller Earning */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Your Earning on Each Sale</span>
                    <div className="text-2xl font-bold text-blue-600">₹{product?.resellerEarning}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share & Earn
                  </Button>
                </div>
              </div> */}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-4 px-2 font-semibold transition-colors relative ${
                    activeTab === 'description' 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  DESCRIPTION
                  {activeTab === 'description' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('additional')}
                  className={`pb-4 px-2 font-semibold transition-colors relative ${
                    activeTab === 'additional' 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ADDITIONAL INFORMATION
                  {activeTab === 'additional' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 px-2 font-semibold transition-colors relative ${
                    activeTab === 'reviews' 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  REVIEWS (1)
                  {activeTab === 'reviews' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {product?.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Vivamus adipiscing nisl ut dolor dignissim semper. Nulla luctus malesuada tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenpaeos. Integer enim purus, posuere at ultricies eu, placerat a felis. Suspendisse aliquet urna pretium eros convallis interdum. 
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Mauris ut cursus nunc. Morbi eleifend, ligula at consectetur vehicula, urna velit sodales libero, nec eleifend velit nisi non tellus. Suspendisse potenti. Donec id tellus eget sem auctor viverra. Fusce sit amet sem odio. Integer vehicula quam a magna venenatis, in tempor ligula fermentum.
                  </p>
                </div>
              )}

              {activeTab === 'additional' && (
                <div className="max-w-2xl">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 text-gray-700 font-medium w-1/3">Weight</td>
                        <td className="py-3 text-gray-600">{product?.weight || '1 kg'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-700 font-medium">Dimensions</td>
                        <td className="py-3 text-gray-600">{product?.dimensions || '25 × 15 × 10 cm'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-700 font-medium">Type</td>
                        <td className="py-3 text-gray-600">{product?.type || 'Organic'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-700 font-medium">MFG</td>
                        <td className="py-3 text-gray-600">{product?.mfgDate || 'Jun 4, 2021'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-gray-700 font-medium">LIFE</td>
                        <td className="py-3 text-gray-600">{product?.lifespan || '30 days'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="mb-8">
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        A
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">Anonymous</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">June 4, 2021</p>
                        <p className="text-gray-600">Great product! Highly recommended.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add a review</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your email address will not be published. Required fields are marked *
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your rating *
                        </label>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <button key={i} className="text-gray-300 hover:text-yellow-400 transition-colors">
                              <Star className="w-6 h-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your review *
                        </label>
                        <textarea 
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Write your review here..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <Input 
                            type="text"
                            className="w-full"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <Input 
                            type="email"
                            className="w-full"
                            placeholder="Your email"
                          />
                        </div>
                      </div>
                      <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct._id} to={`/products/${relatedProduct._id}`}>
                    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="aspect-square overflow-hidden bg-white relative">
                        <img 
                          src={relatedProduct.image} 
                          alt={relatedProduct.name} 
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        {Math.round(((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100) > 0 && (
                          <Badge className="absolute top-2 left-2 bg-cyan-400 text-white px-2 py-0.5 text-[10px] font-bold rounded">
                            SALE
                          </Badge>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <div className="flex items-center gap-0.5 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <h3 className="font-normal text-[13px] text-gray-700 mb-2 line-clamp-2 leading-tight min-h-[36px] hover:text-green-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-red-500 font-bold text-base">₹{relatedProduct.price.toLocaleString()}</span>
                          <span className="text-gray-400 line-through text-xs">₹{relatedProduct.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Product</DialogTitle>
            <DialogDescription>
              Share this product with your referral code to build your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Share Link */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Share Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xs bg-white px-3 py-2 rounded border border-gray-200 overflow-hidden">
                  <p className="truncate">{getShareLink()}</p>
                </div>
                <Button
                  onClick={handleCopyShareLink}
                  size="sm"
                  variant="outline"
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Includes your referral code: <span className="font-semibold text-blue-600">{user?.myReferralCode}</span>
              </p>
            </div>

            {/* Social Share Buttons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Share via</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Share on WhatsApp
                </Button>
                
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </Button>
                
                <Button
                  onClick={() => handleSocialShare('telegram')}
                  className="bg-[#0088cc] hover:bg-[#0077b3] text-white justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Share on Telegram
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">💡 Tip:</span> When someone registers using your link, they automatically join your team and you earn from their purchases!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
