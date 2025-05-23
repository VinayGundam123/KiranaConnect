import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Package,
  Bell,
  MessageSquare,
  Truck,
  Tag,
  Store,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'chat' | 'delivery' | 'store';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  image?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return Package;
    case 'promotion':
      return Tag;
    case 'chat':
      return MessageSquare;
    case 'delivery':
      return Truck;
    case 'store':
      return Store;
    default:
      return Bell;
  }
};

const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 6) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } else if (days > 0) {
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  notifications.forEach(notification => {
    const date = new Date(notification.timestamp);
    if (date.toDateString() === now.toDateString()) {
      groups.Today.push(notification);
    } else if (date.toDateString() === yesterday.toDateString()) {
      groups.Yesterday.push(notification);
    } else if (date > lastWeek) {
      groups['This Week'].push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  });

  return groups;
};

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Shipped',
      description: 'Your order #1234 has been shipped and will arrive soon',
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: '2',
      type: 'promotion',
      title: '50% off on Snacks!',
      description: 'Get amazing discounts on your favorite snacks',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isRead: false,
    },
    {
      id: '3',
      type: 'chat',
      title: 'New message from Krishna Store',
      description: 'Your order is ready for pickup',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      isRead: true,
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Delivery Update',
      description: 'Your delivery person is 5 minutes away',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      isRead: true,
    },
    {
      id: '5',
      type: 'store',
      title: 'New Store Added',
      description: 'Check out our new partner store in your area',
      timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      isRead: true,
    },
  ]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top App Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
          dateNotifications.length > 0 && (
            <div key={date} className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 mb-4">{date}</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {dateNotifications.map(notification => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`bg-white rounded-xl shadow-sm border ${
                          !notification.isRead ? 'border-primary-100' : 'border-gray-100'
                        }`}
                      >
                        <div className="p-4 flex items-start space-x-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            !notification.isRead ? 'bg-primary-50' : 'bg-gray-50'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              !notification.isRead ? 'text-primary-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-grow" onClick={() => handleMarkAsRead(notification.id)}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className={`font-medium ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {notification.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismiss(notification.id);
                                }}
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                            <div className="flex items-center mt-2">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.isRead && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-primary-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! Check back later for new updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}