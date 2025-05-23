import React, { useState } from 'react';
import { Store, Clock, Settings, Calendar, X } from 'lucide-react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

interface StoreCardProps {
  name: string;
  image?: string;
  nextDelivery: string;
  subscriptionType: string;
}

export function StoreCard({ name, image, nextDelivery, subscriptionType }: StoreCardProps) {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);

  const handleManage = () => {
    setIsManageModalOpen(true);
  };

  const handleSkip = () => {
    setIsSkipModalOpen(true);
  };

  const handleSkipConfirm = () => {
    toast.success('Delivery skipped successfully');
    setIsSkipModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="aspect-video relative">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Store className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Next delivery: {nextDelivery}</span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
              {subscriptionType}
            </span>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleManage}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleSkip}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
      </div>

      {/* Manage Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Subscription</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManageModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Frequency</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Time Slot</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>Morning (8 AM - 12 PM)</option>
                  <option>Afternoon (12 PM - 4 PM)</option>
                  <option>Evening (4 PM - 8 PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Instructions</label>
                <textarea 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                  placeholder="Any special instructions for delivery..."
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsManageModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Subscription updated successfully');
                    setIsManageModalOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip Modal */}
      {isSkipModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Skip Next Delivery</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSkipModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to skip the next delivery scheduled for {nextDelivery}?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSkipModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSkipConfirm}
              >
                Confirm Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}