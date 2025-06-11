import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart';
import { Trash2, Plus, Minus, Store, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import axios from 'axios';
import { use } from 'framer-motion/client';

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
  notificationCount?: number;
  lastNotificationSent?: string;
  notificationsPaused?: boolean;
  selected?: boolean;
}

interface AINotification {
  _id?: string;
  type: string;
  message: string;
  itemId: string;
  itemName: string;
  notificationCount: number;
  sentAt: string;
  status: string;
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
  const [clearingCart, setClearingCart] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // AI Notifications only
  const [aiNotifications, setAiNotifications] = useState<AINotification[]>([]);
  const [showAINotifications, setShowAINotifications] = useState(false);
  const [newAINotificationCount, setNewAINotificationCount] = useState(0);
  const [generatingNotification, setGeneratingNotification] = useState(false);
  
  // Real-time updates for AI notifications
  const lastNotificationCheck = useRef<Date>(new Date());

  // Replace with actual buyer ID from your auth system
  const buyerId=localStorage.getItem('buyerId') ;
  if (!buyerId) {
    return <div className="text-center text-red-600">Buyer ID not found. Please log in.</div>;
  }

  useEffect(() => {
    fetchCartData();
    fetchAINotifications();
    
    // Check for new AI notifications every 30 seconds
    const aiCheckInterval = setInterval(() => {
      console.log('Checking for new notifications...'); // Debug log
      checkForNewAINotifications();
    }, 30000); // 30 seconds interval

    return () => {
      clearInterval(aiCheckInterval);
    };
  }, []);

  //Fetching the cart data from the server
  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/buyer/cart/${buyerId}`);
      if (Array.isArray(response.data)) {
        setCartData(response.data);
        // Set all items as selected by default
        setSelectedItems(new Set(response.data.map(item => item.itemId)));
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

  
  const fetchAINotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/buyer/cart/${buyerId}/ai-notifications?limit=20`);
      console.log('Fetched AI notifications:', response.data); // Debug log
      if (response.data && response.data.notifications) {
        setAiNotifications(response.data.notifications);
      } else {
        console.warn('No notifications in response:', response.data);
      }
    } catch (err) {
      console.error('Error fetching AI notifications:', err);
      toast.error('Failed to load notifications');
    }
  };

  const checkForNewAINotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/buyer/cart/${buyerId}/ai-notifications?limit=20`);
      console.log('Checking for new notifications:', response.data); // Debug log
      
      const newNotifications = response.data.notifications || [];
      
      // Check for notifications newer than last check
      const newOnes = newNotifications.filter((notification: AINotification) => 
        new Date(notification.sentAt) > lastNotificationCheck.current
      );
      
      if (newOnes.length > 0) {
        console.log('Found new notifications:', newOnes); // Debug log
        setNewAINotificationCount(prev => prev + newOnes.length);
        
        // Show toast for new AI notification
        newOnes.forEach((notif: AINotification) => {
          toast.success(`🤖 New AI reminder: ${notif.message}...`, {
            duration: 5000,
            position: 'top-right'
          });
        });
        
        // Update AI notifications list
        setAiNotifications(newNotifications);
      }
      lastNotificationCheck.current = new Date();
    } catch (err) {
      console.error('Error checking new AI notifications:', err);
      toast.error('Failed to check for new notifications');
    }
  };

  const triggerManualAINotification = async () => {
    try {
      setGeneratingNotification(true);
      console.log('Triggering manual AI notification...'); // Debug log
      
      const response = await axios.post(`http://localhost:5000/buyer/cart/${buyerId}/smart-notification`);
      console.log('Manual notification response:', response.data); // Debug log
      
      if (response.data.notification) {
        toast.success('🤖 AI notification generated successfully!');
        // Refresh AI notifications
        await fetchAINotifications();
      } else {
        toast.error('No notification was generated');
      }
      
    } catch (error) {
      console.error('Error generating AI notification:', error);
      toast.error('Failed to generate AI notification');
    } finally {
      setGeneratingNotification(false);
    }
  };

  const toggleItemNotifications = async (itemId: string, pause: boolean) => {
    try {
      const response = await axios.post(`http://localhost:5000/buyer/cart/${buyerId}/toggle-notifications`, {
        itemId,
        pause
      });
      
      toast.success(response.data.message);
      
      // Update cart data
      setCartData(prev => prev.map(item => 
        item.itemId === itemId 
          ? { ...item, notificationsPaused: pause }
          : item
      ));
      
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
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
      setAiNotifications([]);
      
      toast.success('Cart cleared successfully');

    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      fetchCartData();
    } finally {
      setClearingCart(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartData.map(item => item.itemId)));
    }
  };

  // Update the itemsByStore calculation to include all items but track selection
  const itemsByStore = cartData.reduce<Record<string, StoreGroup>>((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: [],
        subtotal: 0
      };
    }
    acc[item.storeId].items.push(item);
    // Only add to subtotal if selected
    if (selectedItems.has(item.itemId)) {
      acc[item.storeId].subtotal += item.price * item.quantity;
    }
    return acc;
  }, {});

  // Update the subtotal calculation to only include selected items
  const subtotal = cartData.reduce((sum, item) => 
    selectedItems.has(item.itemId) ? sum + (item.price * item.quantity) : sum, 0);

  const deliveryFee = 40;
  const storeCount = Object.keys(itemsByStore).length;
  const totalDeliveryFee = storeCount * deliveryFee;
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
      {/* Header with AI Notifications */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          {newAINotificationCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">
                {newAINotificationCount} new AI reminders
              </span>
            </div>
          )}
        </div>
        
        {cartData.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              className="flex items-center space-x-2"
            >
              {selectedItems.size === cartData.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAINotifications(!showAINotifications)}
              className="flex items-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span>AI Notifications ({aiNotifications.length})</span>
            </Button>
            <Button
              variant="outline"
              onClick={triggerManualAINotification}
              disabled={generatingNotification}
              className="flex items-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span>{generatingNotification ? 'Generating...' : 'Get AI Reminder'}</span>
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

      {/* AI Notifications Panel */}
      {showAINotifications && aiNotifications.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">AI Personalized Notifications</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setNewAINotificationCount(0)}
            >
              Mark as Read
            </Button>
          </div>
          
          <div className="space-y-3">
            {aiNotifications.map((notification, index) => (
              <Alert key={index} className="border-l-4 border-blue-500 bg-white">
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        For: {notification.itemName} • {new Date(notification.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
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
                {storeData.items.map((item) => (
                  <div key={item.itemId} className={`p-6 ${!selectedItems.has(item.itemId) ? 'opacity-60' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.itemId)}
                        onChange={() => toggleItemSelection(item.itemId)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">₹{item.price} per {item.unit}</p>
                          </div>
                          
                          {/* AI Notification Control for Individual Items */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleItemNotifications(item.itemId, !item.notificationsPaused)}
                            className={`flex items-center space-x-1 ${
                              item.notificationsPaused ? 'text-gray-400' : 'text-blue-600'
                            }`}
                          >
                            <Bell className="h-3 w-3" />
                            <span className="text-xs">
                              {item.notificationsPaused ? 'Paused' : 'Active'}
                            </span>
                          </Button>
                        </div>
                        
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
                              onClick={() => handleRemoveItem(item.itemId)}
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
            {selectedItems.size === 0 ? (
              <p className="text-sm text-gray-500 text-center">Select items to checkout</p>
            ) : (
              <>
                {Object.entries(itemsByStore).map(([storeId, storeData]) => (
                  <div key={storeId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{storeData.storeName}</span>
                    <span className="font-medium">₹{storeData.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee ({Object.keys(itemsByStore).length} stores)</span>
                  <span className="font-medium">₹{Object.keys(itemsByStore).length * deliveryFee}</span>
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
                  Proceed to Checkout ({selectedItems.size} items)
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}