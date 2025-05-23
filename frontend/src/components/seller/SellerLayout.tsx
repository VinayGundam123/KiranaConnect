import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Bell,
  Settings,
  Menu,
  X,
  Users,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import { signOut } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/seller' },
  { icon: Package, label: 'Inventory', path: '/seller/inventory' },
  { icon: ShoppingCart, label: 'Orders', path: '/seller/orders' },
  { icon: Users, label: 'Subscriptions', path: '/seller/subscriptions' },
  { icon: TrendingUp, label: 'Analytics', path: '/seller/analytics' },
  { icon: Settings, label: 'Settings', path: '/seller/settings' },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order',
      message: 'You have received a new order #1234',
      time: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Rice is running low on stock',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Payment received for order #1233',
      time: '2 hours ago',
      read: false
    }
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setNotificationCount(0);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setShowNotifications(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <button 
            className="flex items-center space-x-2"
            onClick={() => navigate('/seller')}
          >
            <Store className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold">Seller Hub</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'primary' : 'ghost'}
                className={`mb-1 flex w-full items-center justify-start rounded-md px-4 py-2 text-sm font-medium transition-colors`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Notifications in Sidebar */}
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col ${isSidebarOpen ? 'md:pl-64' : ''}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative"
                  onClick={() => {
                    if (!isSidebarOpen) {
                      setIsSidebarOpen(true);
                    }
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">SK</span>
                </div>
                <span className="text-sm font-medium">Store Keeper</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}