import  { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart';
import { Trash2, Plus, Minus, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import axios from 'axios';

interface CartItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  storeName: string;
  storeId: string;
  image?: string;
}

interface StoreGroup {
  storeName: string;
  items: CartItem[];
  subtotal: number;
}

export function Checkout() {
  const { removeItem, updateQuantity } = useCart();
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Replace with actual buyer ID from your auth system
  const buyerId = '683012ca3ed446695c307053';

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/buyer/cart/${buyerId}`);
      
      // Handle the response - it should be an array of cart items
      if (Array.isArray(response.data)) {
        setCartData(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to fetch cart data');
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (updating === itemId) return; // Prevent multiple simultaneous updates
    
    try {
      setUpdating(itemId);
      
      if (newQuantity <= 0) {
        // Remove item by filtering it out
        const updatedItems = cartData.filter(item => item.itemId !== itemId);
        setCartData(updatedItems);
        toast.success('Item removed from cart');
        return;
      }

      // Find the item to update
      const item = cartData.find(item => item.itemId === itemId);
      if (!item) return;

      // Calculate quantity difference for backend
      const quantityDiff = newQuantity - item.quantity;

      // Update the item in the backend
      await axios.put(`http://localhost:5000/buyer/cart/${buyerId}/quantity`, {
        itemId: item.itemId,
        newQuantity: newQuantity
      });

      // Update local state optimistically
      const updatedItems = cartData.map(cartItem =>
        cartItem.itemId === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      setCartData(updatedItems);
      
      toast.success('Cart updated successfully');

    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update quantity');
      // Refresh cart data to ensure consistency
      fetchCartData();
    } finally {
      setUpdating(null);
    }
  };

  // Group items by store with proper type safety
  const itemsByStore = cartData.reduce<Record<string, StoreGroup>>((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: [],
        subtotal: 0
      };
    }
    acc[item.storeId].items.push(item);
    acc[item.storeId].subtotal += item.price * item.quantity;
    return acc;
  }, {});

  const deliveryFee = 40; // Fee per store
  const storeCount = Object.keys(itemsByStore).length;
  const totalDeliveryFee = storeCount * deliveryFee;
  const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal + totalDeliveryFee;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading cart items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <Button 
            onClick={fetchCartData}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">🛒</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding items to your cart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {Object.entries(itemsByStore).map(([storeId, storeData]) => (
            <div key={storeId} className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Store Header */}
              <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
                <Store className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium text-gray-900">{storeData.storeName}</h3>
              </div>
              
              {/* Store Items */}
              <div className="divide-y divide-gray-100">
                {storeData.items.map((item) => (
                  <div key={item.itemId} className="p-6">
                    <div className="flex items-center space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">₹{item.price} per {item.unit}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                              disabled={updating === item.itemId}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                              disabled={updating === item.itemId}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.itemId, 0)}
                              disabled={updating === item.itemId}
                            >
                              <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Store Subtotal */}
              <div className="p-4 bg-gray-50 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{storeData.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 mt-2">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4">
            {Object.entries(itemsByStore).map(([storeId, storeData]) => (
              <div key={storeId} className="flex justify-between text-sm">
                <span className="text-gray-600">{storeData.storeName}</span>
                <span className="font-medium">₹{storeData.subtotal}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee ({storeCount} stores)</span>
              <span className="font-medium">₹{totalDeliveryFee}</span>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">₹{finalTotal}</span>
              </div>
            </div>
            <Button className="w-full">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}