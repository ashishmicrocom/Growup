import { createContext, useContext, useState, ReactNode } from 'react';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  resellerEarning: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (_id: string) => void;
  isInWishlist: (_id: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addToWishlist = (item: WishlistItem) => {
    setItems((prevItems) => {
      const exists = prevItems.find((i) => i._id === item._id);
      if (exists) {
        return prevItems;
      }
      return [...prevItems, item];
    });
  };

  const removeFromWishlist = (_id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== _id));
  };

  const isInWishlist = (_id: string) => {
    return items.some((item) => item._id === _id);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
