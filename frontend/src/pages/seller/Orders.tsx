import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Package,
  Truck,
  X,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment: {
    method: 'online' | 'cod';
    status: 'paid' | 'pending';
  };
  createdAt: string;
  updatedAt: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD1023',
    customer: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      address: '123, Main Street, Bangalore - 560001'
    },
    items: [
      { name: 'Milk', quantity: 1, price: 60, unit: 'L' },
      { name: 'Rice', quantity: 5, price: 65, unit: 'kg' },
      { name: 'Sugar', quantity: 1, price: 45, unit: 'kg' }
    ],
    total: 450,
    status: 'pending',
    payment: {
      method: 'online',
      status: 'paid'
    },
    createdAt: '2024-03-20T09:30:00Z',
    updatedAt: '2024-03-20T09:30:00Z'
  },
  {
    id: 'ORD1024',
    customer: {
      name: 'Anita Devi',
      phone: '+91 98765 43211',
      address: '456, Park Avenue, Bangalore - 560002'
    },
    items: [
      { name: 'Atta', quantity: 10, price: 48, unit: 'kg' },
      { name: 'Soap', quantity: 4, price: 40, unit: 'piece' }
    ],
    total: 760,
    status: 'packed',
    payment: {
      method: 'cod',
      status: 'pending'
    },
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T09:15:00Z'
  }
];

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'packed', label: 'Packed' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

interface NewOrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface NewOrderForm {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: 'online' | 'cod';
  items: NewOrderItem[];
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState<NewOrderForm>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'cod',
    items: [{ name: '', quantity: 1, price: 0, unit: 'piece' }]
  });

  const handleAddItem = () => {
    setNewOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0, unit: 'piece' }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setNewOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof NewOrderItem, value: string | number) => {
    setNewOrderForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return newOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newOrderForm.customerName || !newOrderForm.customerPhone || !newOrderForm.customerAddress) {
      toast.error('Please fill in all customer details');
      return;
    }

    if (newOrderForm.items.some(item => !item.name || item.quantity < 1 || item.price < 0)) {
      toast.error('Please fill in all item details correctly');
      return;
    }

    // Create new order
    const newOrder: Order = {
      id: `ORD${Math.floor(1000 + Math.random() * 9000)}`,
      customer: {
        name: newOrderForm.customerName,
        phone: newOrderForm.customerPhone,
        address: newOrderForm.customerAddress
      },
      items: newOrderForm.items,
      total: calculateTotal(),
      status: 'pending',
      payment: {
        method: newOrderForm.paymentMethod,
        status: newOrderForm.paymentMethod === 'cod' ? 'pending' : 'paid'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setShowNewOrderModal(false);
    setNewOrderForm({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      paymentMethod: 'cod',
      items: [{ name: '', quantity: 1, price: 0, unit: 'piece' }]
    });
    toast.success('New order created successfully');
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 24) {
      return date.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const isOrderLate = (order: Order) => {
    if (order.status !== 'pending') return false;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 2;
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'packed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'out_for_delivery':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
    toast.success(`Order ${orderId} marked as ${newStatus}`);
  };

  const handleBulkAction = (action: Order['status']) => {
    setOrders(orders.map(order => 
      selectedOrders.includes(order.id)
        ? { ...order, status: action, updatedAt: new Date().toISOString() }
        : order
    ));
    toast.success(`${selectedOrders.length} orders updated`);
    setSelectedOrders([]);
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = selectedTab === 'all' || order.status === selectedTab;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your store orders</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <Button onClick={() => setShowNewOrderModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${selectedTab === tab.value
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900 p-4 rounded-lg flex items-center justify-between">
          <span className="text-primary-700 dark:text-primary-300">
            {selectedOrders.length} orders selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('packed')}
            >
              Mark as Packed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('out_for_delivery')}
            >
              Mark as Out for Delivery
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrders([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`
              bg-white dark:bg-gray-800 rounded-xl shadow-sm border
              ${selectedOrders.includes(order.id) ? 'border-primary-500' : 'border-gray-100 dark:border-gray-700'}
              ${isOrderLate(order) ? 'ring-2 ring-red-100 dark:ring-red-900' : ''}
            `}
          >
            <div className="p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders([...selectedOrders, order.id]);
                      } else {
                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 rounded dark:bg-gray-700"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{order.customer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order #{order.id} • {getTimeAgo(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`tel:${order.customer.phone}`)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {order.items.slice(0, 2).map(item => 
                      `${item.name} (${item.quantity}${item.unit})`
                    ).join(', ')}
                    {order.items.length > 2 && '...'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{order.total}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${order.payment.method === 'cod' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'}
                  `}>
                    {order.payment.method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                  </span>
                  {isOrderLate(order) && (
                    <span className="flex items-center text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Late Order
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>
                      Hide Details
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      View Details
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'packed')}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Mark as Packed
                    </Button>
                  )}
                  {order.status === 'packed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Out for Delivery
                    </Button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                  {['pending', 'packed'].includes(order.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Delivery Address</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{order.customer.address}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Order Items</h4>
                        <div className="mt-2 space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                {item.name} ({item.quantity}{item.unit})
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between font-medium">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-gray-900 dark:text-white">₹{order.total}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Order Timeline</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-500 dark:text-gray-400">
                              Order placed on {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {order.status !== 'pending' && (
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-500 dark:text-gray-400">
                                Last updated on {new Date(order.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'New orders will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNewOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Order</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewOrderModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        required
                        value={newOrderForm.customerName}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <input
                        type="tel"
                        required
                        value={newOrderForm.customerPhone}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <textarea
                      required
                      value={newOrderForm.customerAddress}
                      onChange={(e) => setNewOrderForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Order Items</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  {newOrderForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="piece">Piece</option>
                          <option value="kg">KG</option>
                          <option value="g">Gram</option>
                          <option value="L">Litre</option>
                          <option value="ml">ML</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">₹{calculateTotal()}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Method</h4>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="cod"
                        checked={newOrderForm.paymentMethod === 'cod'}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, paymentMethod: e.target.value as 'cod' | 'online' }))}
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Cash on Delivery</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="online"
                        checked={newOrderForm.paymentMethod === 'online'}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, paymentMethod: e.target.value as 'cod' | 'online' }))}
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Online Payment</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewOrderModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Order
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}