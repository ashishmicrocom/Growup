import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  Heart,
  ChevronDown,
  User,
  MapPin,
  ShieldCheck,
  Phone,
  LogIn,
  UserPlus,
  Menu,
  X,
  Home,
  Package,
  Info,
  HelpCircle,
  Mail,
  Bell,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { LocationPicker } from '@/components/LocationPicker';
import { getPublicProducts, type Product } from '@/services/productService';
import { getNotifications } from '@/services/notificationService';
import { useDebounce } from '@/hooks/use-debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export const Header = () => {
  const { totalItems, totalPrice } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    localStorage.getItem('selectedLocation')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch notifications count
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => getNotifications({ limit: 1 }),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleSelectLocation = (location: { address: string; lat: number; lng: number }) => {
    setSelectedLocation(location.address);
    localStorage.setItem('selectedLocation', location.address);
    localStorage.setItem('selectedLocationCoords', JSON.stringify({ lat: location.lat, lng: location.lng }));
  };

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        setIsLoadingSuggestions(true);
        try {
          const response = await getPublicProducts({
            search: debouncedSearchQuery,
            limit: 5
          });
          setSearchSuggestions(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSearchSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 z-50 bg-white border-b border-gray-200 w-full max-w-[100vw]">
      {/* Top Bar - Hidden on mobile */}
      <div className="bg-[#233a95] text-white hidden md:block w-full overflow-x-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-2 text-xs md:text-sm">
            Due to the <span className="font-semibold mx-1">HIGH DEMAND</span>, orders may be processed with a slight delay
          </div>
        </div>
      </div>

      {/* Sub Header - Hidden on mobile */}
      <div className="border-b border-gray-200 bg-white hidden md:block w-full">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            {/* Left Links */}
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">
                Home
              </Link>
              {/* {isAuthenticated ? (
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm">
                  My account
                </Link>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-gray-600 hover:text-blue-600 transition-colors outline-none text-xs lg:text-sm">
                    My account
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate('/login')}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )} */}
              <Link to="/orders" className="text-gray-600 hover:text-blue-600 transition-colors text-xs lg:text-sm hidden lg:block">
                Order Tracking
              </Link>
            </div>

            {/* Right Info */}
            <div className="flex items-center gap-3 lg:gap-6">
              <div className="hidden xl:flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs">100% Secure delivery</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-600" />
                <a href="tel:+919461923285" className="text-blue-600 font-semibold hover:text-yellow-500 text-xs lg:text-sm transition-colors">
                  +91 9461923285
                </a>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#233a95] w-full">
        <div className="w-full md:container md:mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between gap-2 md:gap-4 py-0 w-full">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-6">
                  {/* User Section */}
                  {isAuthenticated ? (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="w-12 h-12">
                        {user?.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={`${user?.firstName} ${user?.lastName}`} />
                        ) : (
                          <AvatarFallback className="bg-blue-900 text-white font-semibold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="text-sm text-gray-500">Welcome</div>
                        <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pb-4 border-b">
                      <button
                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-2 border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        Register
                      </button>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-4">
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link
                      to="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                    >
                      <Package className="w-5 h-5" />
                      <span className="font-medium">All Products</span>
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                    >
                      <Info className="w-5 h-5" />
                      <span className="font-medium">About Us</span>
                    </Link>
                    <Link
                      to="/how-it-works"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">How It Works</span>
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">Contact</span>
                    </Link>
                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate('/wishlist');
                        } else {
                          navigate('/login');
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2 w-full text-left"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Wishlist</span>
                      {wishlistItems > 0 && isAuthenticated && (
                        <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {wishlistItems}
                        </span>
                      )}
                    </button>
                    {isAuthenticated && (
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors py-2"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                    )}
                  </nav>

                  {/* Contact Info */}
                  <div className="mt-auto pt-4 border-t">
                    <div className="text-sm text-gray-500 mb-2">Need help?</div>
                    <a href="tel:+919461923285" className="text-blue-600 font-semibold hover:text-blue-700">
                      +91 9461923285
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 -my-3 md:-my-4">
              <img src="/76__1_-removebg-preview.png" className="h-14 md:h-20 lg:h-24" alt="Flourisel India" />
            </Link>

            {/* Location Selector */}
            <div className="hidden lg:block">
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setLocationPickerOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 bg-white rounded-lg hover:border-white hover:bg-white transition-colors outline-none"
              >
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <div className="text-left">
                  <div className="text-[10px] text-gray-500">Your Location</div>
                  <div className="text-xs font-semibold text-gray-800 flex items-center gap-0.5">
                    {selectedLocation ? (
                      <span className="max-w-[150px] truncate">{selectedLocation.split(',')[0]}</span>
                    ) : (
                      'Select a Location'
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block relative z-[60]" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-white/30 bg-white text-gray-700 placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-yellow-400 text-black rounded-r-lg hover:bg-yellow-500 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && (searchSuggestions.length > 0 || isLoadingSuggestions) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] max-h-96 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchSuggestions.map((product) => (
                          <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            onClick={() => {
                              setShowSuggestions(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <img
                              src={product.images?.[0] || product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const imgSrc = product.images?.[0] || product.image;
                                if (imgSrc?.startsWith('/uploads')) {
                                  target.src = `http://localhost:7777${imgSrc}`;
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-red-600">₹{product.price}</span>
                                <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* User Account - Desktop */}
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="hidden lg:flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <Avatar className="w-7 h-7 md:w-8 md:h-8">
                    {user?.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={`${user?.firstName} ${user?.lastName}`} />
                    ) : (
                      <AvatarFallback className="bg-white text-blue-900 font-semibold text-xs">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <div className="text-[10px] text-white font-medium">Hi, Welcome</div>
                    <div className="text-xs font-semibold text-yellow-400">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </div>
                </button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:flex items-center gap-2 hover:bg-white/10 transition-colors outline-none px-2 py-1.5 rounded-lg">
                    <User className="w-4 h-4 text-white" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate('/login')}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Wishlist - Desktop */}
              {/* <button 
                onClick={() => isAuthenticated ? navigate('/wishlist') : navigate('/login')}
                className="relative hidden lg:block"
              >
                <Heart className="w-5 h-5 text-white hover:text-yellow-400 transition-colors" />
                {wishlistItems > 0 && isAuthenticated && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </button> */}

              {/* Notifications - Desktop */}
              {isAuthenticated && (
                <button 
                  onClick={() => navigate('/notifications')}
                  className="relative hidden lg:block"
                >
                  <Bell className="w-5 h-5 text-white hover:text-yellow-400 transition-colors" />
                  {notificationsData && notificationsData.unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
                      {notificationsData.unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Wishlist - Desktop */}
              <button 
                onClick={() => isAuthenticated ? navigate('/wishlist') : navigate('/login')}
                className="relative hidden lg:block"
              >
                <Heart className="w-5 h-5 text-white hover:text-yellow-400 transition-colors" />
                {wishlistItems > 0 && isAuthenticated && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => isAuthenticated ? navigate('/cart') : navigate('/login')}
                className="relative"
              >
                <div className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  {totalItems > 0 && isAuthenticated && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] px-1 rounded-full bg-red-600 text-white text-[9px] md:text-[10px] font-semibold flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-2 w-full">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-white/30 bg-white text-gray-700 placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Desktop Only */}
      <div className="bg-white border-t border-gray-200 hidden lg:block">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 xl:gap-8 py-2">
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
            >
              All Products
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
            >
              About Us
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Location Picker Dialog */}
      <LocationPicker 
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelectLocation={handleSelectLocation}
      />
    </header>
  );
};
