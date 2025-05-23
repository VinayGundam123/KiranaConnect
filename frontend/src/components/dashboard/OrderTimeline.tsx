import React from 'react';
import { Package, Clock, Check, X } from 'lucide-react';
import { Button } from '../ui/button';

interface Order {
  id: string;
  storeName: string;
  date: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  items: string[];
  total: number;
}

interface OrderTimelineProps {
  orders: Order[];
}

export function OrderTimeline({ orders }: OrderTimelineProps) {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Package;
      case 'delivered':
        return Check;
      case 'cancelled':
        return X;
      default:
        return Package;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-50';
      case 'processing':
        return 'text-blue-500 bg-blue-50';
      case 'delivered':
        return 'text-green-500 bg-green-50';
      case 'cancelled':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const StatusIcon = getStatusIcon(order.status);
        const statusColor = getStatusColor(order.status);

        return (
          <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-full ${statusColor} flex items-center justify-center`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{order.storeName}</h3>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">₹{order.total}</span>
                <Button variant="outline" size="sm">Reorder</Button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {order.items.join(', ')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}