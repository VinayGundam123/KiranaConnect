import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/ui/search';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from '@/lib/cart';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  store: {
    id: string;
    name: string;
    image: string;
  };
  image?: string;
  addedOn: string;
  inStock: boolean;
}

const mockWishlist: WishlistItem[] = [
  {
    id: '1',
    name: 'Organic Brown Rice',
    price: 180,
    store: {
      id: 'store1',
      name: 'Krishna Kirana Store',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    addedOn: '2024-03-15T14:30:00',
    inStock: true,
  },
  {
    id: '2',
    name: 'Premium Cashews',
    price: 450,
    store: {
      id: 'store2',
      name: 'Sharma General Store',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    addedOn: '2024-03-14T10:15:00',
    inStock: false,
  },
];

export function Wishlist() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistItems, setWishlistItems] = useState(mockWishlist);
  const { addItem } = useCart();

  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromWishlist = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
    toast.success('Item removed from wishlist');
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast.error('Item is out of stock');
      return;
    }

    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      storeId: item.store.id,
      storeName: item.store.name,
    };

    addItem(cartItem);
    toast.success('Item added to cart');
    handleRemoveFromWishlist(item.id);
  };

  const handleVisitStore = (storeId: string) => {
    navigate(`/store/${storeId}`);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">Items you'd like to purchase later</p>
        </div>
        <Search
          placeholder="Search wishlist items..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="md:w-96"
        />
      </div>

      {/* Wishlist Items */}
      <div className="space-y-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Item Image */}
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{item.name}</h3>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-2xl font-bold text-gray-900">₹{item.price}</span>
                      {!item.inStock && (
                        <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>

                {/* Store Info */}
                <div className="mt-4 flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img
                      src={item.store.image}
                      alt={item.store.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.store.name}</p>
                    <p className="text-sm text-gray-500">Added on {formatDate(item.addedOn)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleVisitStore(item.store.id)}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Visit Store
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding items you'd like to purchase later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}