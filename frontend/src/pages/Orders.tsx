import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Star,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Calendar,
  Filter,
  Download,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/ui/search';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  id: string;
  store: {
    name: string;
    image: string;
    rating: number;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  address: string;
  paymentMethod: string;
  trackingNumber?: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD001',
    store: {
      name: 'Krishna Kirana Store',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      rating: 4.8
    },
    items: [
      { name: 'Rice', quantity: 5, price: 65, unit: 'kg' },
      { name: 'Dal', quantity: 2, price: 120, unit: 'kg' }
    ],
    total: 565,
    status: 'processing',
    orderDate: '2024-03-20T10:30:00Z',
    deliveryDate: '2024-03-21T14:00:00Z',
    address: '123 Main Street, Bangalore - 560001',
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK123456'
  },
  {
    id: 'ORD002',
    store: {
      name: 'Sharma General Store',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      rating: 4.6
    },
    items: [
      { name: 'Milk', quantity: 2, price: 60, unit: 'L' },
      { name: 'Bread', quantity: 1, price: 40, unit: 'pack' }
    ],
    total: 160,
    status: 'delivered',
    orderDate: '2024-03-19T15:45:00Z',
    deliveryDate: '2024-03-19T17:30:00Z',
    address: '456 Park Avenue, Bangalore - 560002',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD003',
    store: {
      name: 'Fresh Farm Store',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      rating: 4.9
    },
    items: [
      { name: 'Vegetables Mix', quantity: 1, price: 250, unit: 'pack' },
      { name: 'Fruits Pack', quantity: 1, price: 350, unit: 'pack' }
    ],
    total: 600,
    status: 'cancelled',
    orderDate: '2024-03-18T09:15:00Z',
    address: '789 Garden Road, Bangalore - 560003',
    paymentMethod: 'Credit Card'
  }
];

export function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'recent' | 'past'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'processing':
        return 'bg-blue-50 text-blue-700';
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReorder = (orderId: string) => {
    // Implement reorder functionality
    console.log('Reordering:', orderId);
  };

  const handleTrackOrder = (trackingNumber: string) => {
    // Implement order tracking
    console.log('Tracking:', trackingNumber);
  };

  const handleDownloadInvoice = (orderId: string) => {
    // Implement invoice download
    console.log('Downloading invoice:', orderId);
  };

  const filteredOrders = mockOrders
    .filter(order => {
      const matchesSearch = 
        order.store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      
      const orderDate = new Date(order.orderDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const matchesPeriod = selectedPeriod === 'all' ||
        (selectedPeriod === 'recent' && orderDate >= threeMonthsAgo) ||
        (selectedPeriod === 'past' && orderDate < threeMonthsAgo);
      
      return matchesSearch && matchesStatus && matchesPeriod;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          : new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else {
        return sortOrder === 'desc'
          ? b.total - a.total
          : a.total - b.total;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>
        <div className="flex items-center gap-4">
          <Search
            placeholder="Search orders..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-64"
          />
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Time Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Time</option>
              <option value="recent">Last 3 Months</option>
              <option value="past">Older</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="date">Order Date</option>
              <option value="total">Order Total</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg overflow-hidden">
                    <img
                      src={order.store.image}
                      alt={order.store.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{order.store.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">{order.store.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Order #{order.id}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {order.items.map(item => `${item.quantity}${item.unit} ${item.name}`).join(', ')}
                  </span>
                  <span className="font-medium text-gray-900">₹{order.total}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Ordered on {formatDate(order.orderDate)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>
                      Less Details
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      More Details
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="flex space-x-2">
                  {order.status === 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order.id)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>
                  )}
                  {order.trackingNumber && ['processing', 'pending'].includes(order.status) && (
                    <Button
                      size="sm"
                      onClick={() => handleTrackOrder(order.trackingNumber!)}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Invoice
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
                    className="mt-6 pt-6 border-t border-gray-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Delivery Details */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Delivery Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{order.address}</span>
                          </div>
                          {order.deliveryDate && (
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">
                                {order.status === 'delivered'
                                  ? `Delivered on ${formatDate(order.deliveryDate)}`
                                  : `Expected delivery by ${formatDate(order.deliveryDate)}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Order Details</h4>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity}{item.unit} {item.name}
                              </span>
                              <span className="font-medium text-gray-900">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900">Total</span>
                              <span className="font-bold text-gray-900">₹{order.total}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Paid via {order.paymentMethod}
                            </div>
                          </div>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? "Try adjusting your search query"
                : "You haven't placed any orders yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}