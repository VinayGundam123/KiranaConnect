import React from 'react';
import { User, Mail, Phone, MapPin, ShoppingBag, Wallet, Clock, Package, Store, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';

export function Profile() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rahul Kumar</h1>
              <p className="text-gray-500">Member since January 2024</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Subscriptions"
            value="4"
            change={2}
            icon={ShoppingBag}
          />
          <StatCard
            title="Wallet Balance"
            value="₹2,450"
            change={5}
            icon={Wallet}
          />
          <StatCard
            title="Total Orders"
            value="27"
            change={8}
            icon={Package}
          />
          <StatCard
            title="Next Delivery"
            value="2 Hours"
            icon={Clock}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <Package className="h-5 w-5 mr-2" />
              Orders
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Store className="h-5 w-5 mr-2" />
              Stores
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Bell className="h-5 w-5 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">rahul.kumar@example.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Default Delivery Address</p>
                <p className="text-gray-900">123, Main Street, Bangalore - 560001</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button>Edit Profile</Button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { icon: Package, text: "Order #1234 delivered", time: "2 hours ago" },
              { icon: Store, text: "Subscribed to Krishna Kirana Store", time: "1 day ago" },
              { icon: Wallet, text: "Added ₹1000 to wallet", time: "2 days ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
                  <activity.icon className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}