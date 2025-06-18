import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ title, value, change, icon: Icon, onClick, className = '' }: StatCardProps) {
  const isPositive = change && change >= 0;
  
  return (
    <div 
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center">
          <span className={`text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-gray-500 ml-2">from last month</span>
        </div>
      </div>
    </div>
  );
}