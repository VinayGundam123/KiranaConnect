import React from 'react';
import { useCart } from '@/lib/cart';
import { Trash2, Plus, Minus, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function Checkout() {
  const { items, total, discount, removeItem, updateQuantity } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      toast.success('Item removed from cart');
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
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
  }, {} as Record<string, { storeName: string; items: typeof items; subtotal: number }>);

  const finalTotal = Math.max(0, total + (Object.keys(itemsByStore).length * 40) - discount); // Add delivery fee per store and subtract discount

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {Object.keys(itemsByStore).length > 0 ? (
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
                    <div key={item.id} className="p-6">
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
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  removeItem(item.id);
                                  toast.success('Item removed from cart');
                                }}
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
                    <span>₹40</span>
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
                <span className="text-gray-600">Delivery Fee ({Object.keys(itemsByStore).length} stores)</span>
                <span className="font-medium">₹{Object.keys(itemsByStore).length * 40}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount Applied</span>
                  <span className="font-medium">-₹{discount}</span>
                </div>
              )}
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
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">🛒</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding items to your cart
          </p>
        </div>
      )}
    </div>
  );
}