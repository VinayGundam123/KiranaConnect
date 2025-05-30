import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart';
import { Trash2, Plus, Minus, Store, Bell, Clock, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  addedAt?: string;
  lastUpdated?: string;
  notificationSent?: boolean;
}

interface StoreGroup {
  storeName: string;
  items: CartItem[];
  subtotal: number;
}

interface SmartCartInsights {
  totalItems: number;
  totalValue: number;
  oldestItem: {
    name: string;
    addedAgo: number;
  } | null;
  newestItem: {
    name: string;
    addedAgo: number;
  } | null;
  itemsNeedingAttention: Array<{
    name: string;
    addedAgo: number;
  }>;
  timeSinceLastActivity: number | null;
  recommendedAction: string;
}

interface SmartNotification {
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

export function Checkout() {
  const { removeItem, updateQuantity } = useCart();
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  
  // Smart cart features
  const [smartInsights, setSmartInsights] = useState<SmartCartInsights | null>(null);
  const [smartNotifications, setSmartNotifications] = useState<SmartNotification[]>([]);
  const [showSmartFeatures, setShowSmartFeatures] = useState(false);
  const [generatingNotification, setGeneratingNotification] = useState(false);

  // Replace with actual buyer ID from your auth system
  const buyerId = '683012ca3ed446695c307053';

  useEffect(() => {
    fetchCartData();
    fetchSmartInsights();
    
    // Set up interval to check for smart insights every 2 minutes
    const interval = setInterval(() => {
      fetchSmartInsights();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/buyer/cart/${buyerId}`);
      
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

  const fetchSmartInsights = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/buyer/cart/${buyerId}/insights`);
      setSmartInsights(response.data);
      
      // Generate smart notifications based on insights
      generateSmartNotifications(response.data);
    } catch (err) {
      console.error('Error fetching smart insights:', err);
    }
  };

  const generateSmartNotifications = (insights: SmartCartInsights) => {
    const notifications: SmartNotification[] = [];
    
    if (insights.itemsNeedingAttention.length > 0) {
      notifications.push({
        message: `You have ${insights.itemsNeedingAttention.length} items waiting in your cart for over 30 minutes. Complete your purchase to secure them!`,
        type: 'warning',
        timestamp: new Date()
      });
    }
    
    if (insights.totalValue > 1000) {
      notifications.push({
        message: `🎉 Great news! Your cart qualifies for 15% discount (₹${Math.round(insights.totalValue * 0.15)} off). Complete your order now!`,
        type: 'success',
        timestamp: new Date()
      });
    }
    
    if (insights.recommendedAction === 'gentle_reminder' && insights.totalItems > 0) {
      notifications.push({
        message: `Don't forget about your ${insights.totalItems} items! Your local kirana stores are ready to fulfill your order.`,
        type: 'info',
        timestamp: new Date()
      });
    }
    
    setSmartNotifications(notifications);
  };

  const triggerSmartNotification = async () => {
    try {
      setGeneratingNotification(true);
      
      const response = await axios.post(`http://localhost:5000/buyer/cart/${buyerId}/smart-notification`);
      console.log('Smart notification response:', response.data.notification);
      
      if (response.data.notification) {
        toast.success('Smart notification generated!');
        setSmartNotifications(prev => [...prev, {
          message: response.data.notification + '...',
          type: 'info',
          timestamp: new Date()
        }]);
      }
      
    } catch (error) {
      console.error('Error generating smart notification:', error);
      toast.error('Failed to generate notification');
    } finally {
      setGeneratingNotification(false);
    }
  };
  
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (updating === itemId) return;
    
    try {
      setUpdating(itemId);

      const item = cartData.find(item => item.itemId === itemId);
      if (!item) return;

      await axios.put(`http://localhost:5000/buyer/cart/${buyerId}/quantity`, {
        itemId: item.itemId,
        newQuantity: newQuantity
      });

      if (newQuantity <= 0) {
        const updatedItems = cartData.filter(cartItem => cartItem.itemId !== itemId);
        setCartData(updatedItems);
        toast.success('Item removed from cart');
      } else {
        const updatedItems = cartData.map(cartItem =>
          cartItem.itemId === itemId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
        setCartData(updatedItems);
        toast.success('Cart updated successfully');
      }

      // Refresh insights after update
      setTimeout(fetchSmartInsights, 1000);

    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update quantity');
      fetchCartData();
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      
      await axios.delete(`http://localhost:5000/buyer/cart/${buyerId}/remove`, {
        data: { itemId }
      });

      const updatedItems = cartData.filter(item => item.itemId !== itemId);
      setCartData(updatedItems);
      
      toast.success('Item removed from cart');
      setTimeout(fetchSmartInsights, 1000);

    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
      fetchCartData();
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearingCart(true);
      
      await axios.delete(`http://localhost:5000/buyer/cart/${buyerId}/clear`);

      setCartData([]);
      setSmartInsights(null);
      setSmartNotifications([]);
      
      toast.success('Cart cleared successfully');

    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      fetchCartData();
    } finally {
      setClearingCart(false);
    }
  };

  const formatTimeAgo = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    }
  };

  // Group items by store
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

  const deliveryFee = 40;
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
          <Button onClick={fetchCartData} className="mt-4">
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
      {/* Header with Smart Cart Toggle */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSmartFeatures(!showSmartFeatures)}
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Smart Cart</span>
          </Button>
        </div>
        
        {cartData.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={triggerSmartNotification}
              disabled={generatingNotification}
              className="flex items-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span>{generatingNotification ? 'Generating...' : 'Smart Reminder'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {clearingCart ? 'Clearing...' : 'Clear Cart'}
            </Button>
          </div>
        )}
      </div>

      {/* Smart Cart Features */}
      {showSmartFeatures && (
        <div className="mb-8 space-y-4">
          {/* Smart Notifications */}
          {smartNotifications.length > 0 && (
            <div className="space-y-2">
              {smartNotifications.slice(-2).map((notification, index) => (
                <Alert key={index} className={`border-l-4 ${
                  notification.type === 'success' ? 'border-green-500 bg-green-50' :
                  notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Smart Insights */}
          {smartInsights && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Smart Cart Insights</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{smartInsights.totalItems}</div>
                  <div className="text-sm text-gray-600">Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{smartInsights.totalValue}</div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                {smartInsights.oldestItem && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatTimeAgo(smartInsights.oldestItem.addedAgo)}</div>
                    <div className="text-sm text-gray-600">Oldest Item</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{smartInsights.itemsNeedingAttention.length}</div>
                  <div className="text-sm text-gray-600">Need Attention</div>
                </div>
              </div>

              {smartInsights.recommendedAction !== 'none' && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Recommended Action: {smartInsights.recommendedAction.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                {storeData.items.map((item) => {
                  const addedTime = item.addedAt ? new Date(item.addedAt) : null;
                  const minutesAgo = addedTime ? Math.floor((Date.now() - addedTime.getTime()) / (1000 * 60)) : null;
                  const isOld = minutesAgo !== null && minutesAgo > 30;
                  
                  return (
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
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {isOld && showSmartFeatures && (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 rounded-full">
                                <Clock className="h-3 w-3 text-orange-600" />
                                <span className="text-xs text-orange-600">{formatTimeAgo(minutesAgo!)}</span>
                              </div>
                            )}
                          </div>
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
                  );
                })}
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
            
            {/* Discount for orders > 1000 */}
            {subtotal > 1000 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount (15%)</span>
                <span>-₹{Math.round(subtotal * 0.15)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">
                  ₹{subtotal > 1000 ? finalTotal - Math.round(subtotal * 0.15) : finalTotal}
                </span>
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