import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  MapPin,
  Phone,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscriptionDate: string;
  nextDelivery: string;
  plan: 'weekly' | 'bi-weekly' | 'monthly';
  status: 'active' | 'paused' | 'cancelled';
  orders: {
    id: string;
    date: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    status: 'delivered' | 'cancelled';
  }[];
}

const mockSubscribers: Subscriber[] = [
  {
    id: 'SUB1',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    phone: '+91 98765 43210',
    address: '123, Main Street, Bangalore - 560001',
    subscriptionDate: '2024-01-15',
    nextDelivery: '2024-03-25',
    plan: 'weekly',
    status: 'active',
    orders: [
      {
        id: 'ORD123',
        date: '2024-03-18',
        items: [
          { name: 'Milk', quantity: 2, price: 60 },
          { name: 'Bread', quantity: 1, price: 40 }
        ],
        total: 160,
        status: 'delivered'
      },
      {
        id: 'ORD122',
        date: '2024-03-11',
        items: [
          { name: 'Milk', quantity: 2, price: 60 },
          { name: 'Eggs', quantity: 1, price: 80 }
        ],
        total: 200,
        status: 'delivered'
      }
    ]
  },
  {
    id: 'SUB2',
    name: 'Priya Singh',
    email: 'priya.singh@example.com',
    phone: '+91 98765 43211',
    address: '456, Park Avenue, Bangalore - 560002',
    subscriptionDate: '2024-02-01',
    nextDelivery: '2024-03-28',
    plan: 'bi-weekly',
    status: 'active',
    orders: [
      {
        id: 'ORD124',
        date: '2024-03-14',
        items: [
          { name: 'Rice', quantity: 5, price: 65 },
          { name: 'Dal', quantity: 2, price: 120 }
        ],
        total: 565,
        status: 'delivered'
      }
    ]
  }
];

export function Subscriptions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [expandedSubscriber, setExpandedSubscriber] = useState<string | null>(null);
  const [showOrderHistory, setShowOrderHistory] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

  const filteredSubscribers = mockSubscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.phone.includes(searchQuery);
    
    const matchesStatus = selectedStatus === 'all' || subscriber.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditSubscription = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Subscription updated successfully');
    setIsEditModalOpen(false);
    setSelectedSubscriber(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500 mt-1">Manage your store's subscribers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscribers..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="space-y-4">
        {filteredSubscribers.map((subscriber) => (
          <div
            key={subscriber.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6">
              {/* Subscriber Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{subscriber.name}</h3>
                    <p className="text-sm text-gray-500">{subscriber.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscriber.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : subscriber.status === 'paused'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSubscriber(
                      expandedSubscriber === subscriber.id ? null : subscriber.id
                    )}
                  >
                    {expandedSubscriber === subscriber.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedSubscriber === subscriber.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{subscriber.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{subscriber.address}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span>Subscribed on {formatDate(subscriber.subscriptionDate)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span>Next delivery on {formatDate(subscriber.nextDelivery)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Subscription Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Plan</p>
                          <p className="font-medium">{subscriber.plan.replace('-', ' ').charAt(0).toUpperCase() + subscriber.plan.slice(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                          <p className="font-medium">{subscriber.orders.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Order</p>
                          <p className="font-medium">
                            {subscriber.orders.length > 0
                              ? formatDate(subscriber.orders[0].date)
                              : 'No orders yet'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowOrderHistory(
                          showOrderHistory === subscriber.id ? null : subscriber.id
                        )}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {showOrderHistory === subscriber.id ? 'Hide Orders' : 'View Orders'}
                      </Button>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditSubscription(subscriber)}
                        >
                          Edit Subscription
                        </Button>
                        {subscriber.status === 'active' ? (
                          <Button variant="outline">
                            Pause Subscription
                          </Button>
                        ) : subscriber.status === 'paused' ? (
                          <Button>
                            Resume Subscription
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* Order History */}
                    <AnimatePresence>
                      {showOrderHistory === subscriber.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4"
                        >
                          <h4 className="font-medium text-gray-900 mb-4">Order History</h4>
                          <div className="space-y-4">
                            {subscriber.orders.map((order) => (
                              <div
                                key={order.id}
                                className="bg-white rounded-lg border border-gray-200 p-4"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === 'delivered'
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-red-50 text-red-700'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  {order.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-sm"
                                    >
                                      <span className="text-gray-600">
                                        {item.quantity}x {item.name}
                                      </span>
                                      <span>₹{item.price * item.quantity}</span>
                                    </div>
                                  ))}
                                  <div className="mt-2 pt-2 border-t flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>₹{order.total}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscribers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedSubscriber && (
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
              className="bg-white rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Subscription</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedSubscriber(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleUpdateSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Plan
                  </label>
                  <select
                    defaultValue={selectedSubscriber.plan}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Next Delivery Date
                  </label>
                  <input
                    type="date"
                    defaultValue={selectedSubscriber.nextDelivery}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Instructions
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedSubscriber(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Subscription
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