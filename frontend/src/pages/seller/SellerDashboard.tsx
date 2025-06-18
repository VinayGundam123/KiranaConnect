import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Store,
  Bell,
  Clock,
  Check,
  Plus,
  BarChart3,
  FileText,
  Image,
  X,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const mockOrders = [
  {
    id: 'ORD001',
    customer: 'Rahul Kumar',
    items: ['Rice 5kg', 'Dal 1kg'],
    status: 'processing',
    total: 850,
    time: '2:30 PM',
  },
  {
    id: 'ORD002',
    customer: 'Priya Singh',
    items: ['Milk 2L', 'Bread'],
    status: 'pending',
    total: 320,
    time: '2:15 PM',
  },
];

export function SellerDashboard() {
  const navigate = useNavigate();
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const sellerId = localStorage.getItem('sellerId');
        if (!sellerId) {
          toast.error('Seller ID not found');
          return;
        }

        const response = await axios.get(`http://localhost:5000/seller/inventory/${sellerId}`);
        const products = response.data.products;
        
        // Count products where stock is less than or equal to min_stock_level
        const lowStockItems = products.filter(
          (product: any) => product.quantity <= product.minStockLevel
        );
        
        setLowStockCount(lowStockItems.length);
      } catch (error: any) {
        console.error('Error fetching low stock items:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch low stock items');
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockItems();
  }, []);

  const handleGenerateReport = (reportType: string) => {
    toast.success(`Generating ${reportType} report...`);
    setIsReportsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your store's performance</p>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={() => setIsReportsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Orders"
          value="156"
          change={12}
          icon={Package}
        />
        <StatCard
          title="Active Subscriptions"
          value="1,204"
          change={-2}
          icon={Users}
        />
        <StatCard
          title="Revenue Today"
          value="₹45,231"
          change={8}
          icon={TrendingUp}
        />
        <StatCard
          title="Low Stock Items"
          value={loading ? "..." : lowStockCount.toString()}
          change={0}
          icon={AlertTriangle}
          onClick={() => navigate('/seller/inventory')}
          className="cursor-pointer hover:bg-gray-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/seller/orders')}
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total}</p>
                      <p className="text-sm text-gray-500">{order.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900">Today's Activity</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Pending Orders</span>
                </div>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-500 mr-2" />
                  <span>Processing</span>
                </div>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Delivered</span>
                </div>
                <span className="font-medium">45</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((notification) => (
                <div key={notification} className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Modal */}
      <AnimatePresence>
        {isReportsModalOpen && (
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
                <h3 className="text-xl font-semibold">Generate Reports</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportsModalOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Sales Report', description: 'Detailed analysis of sales performance', icon: TrendingUp },
                  { title: 'Inventory Report', description: 'Current stock levels and movements', icon: Package },
                  { title: 'Customer Report', description: 'Customer behavior and preferences', icon: Users },
                  { title: 'Financial Report', description: 'Revenue and expense breakdown', icon: FileText },
                ].map((report) => (
                  <button
                    key={report.title}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-primary-200 transition-all"
                    onClick={() => handleGenerateReport(report.title)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <report.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4 text-left">
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500">{report.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}