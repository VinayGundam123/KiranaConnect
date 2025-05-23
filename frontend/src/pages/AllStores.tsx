import React, { useState } from 'react';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const allStores = [
  {
    id: '1',
    name: 'Krishna Kirana Store',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    distance: '0.5 km',
    deliveryTime: '30 mins',
    offer: '20% off on first order',
    categories: ['Groceries', 'Dairy', 'Snacks']
  },
  {
    id: '2',
    name: 'Sharma General Store',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    distance: '1.2 km',
    deliveryTime: '45 mins',
    offer: 'Free delivery above ₹500',
    categories: ['Groceries', 'Household', 'Personal Care']
  },
  {
    id: '3',
    name: 'City Supermarket',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    distance: '0.8 km',
    deliveryTime: '35 mins',
    offer: 'Buy 2 Get 1 Free on groceries',
    categories: ['Groceries', 'Fruits', 'Vegetables']
  },
  {
    id: '4',
    name: 'Fresh Farm Store',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    distance: '1.5 km',
    deliveryTime: '40 mins',
    offer: '10% off on vegetables',
    categories: ['Fruits', 'Vegetables', 'Organic']
  },
  {
    id: '5',
    name: 'Daily Needs Mart',
    image: 'https://images.unsplash.com/photo-1580913428735-bd3c269d6a82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    distance: '2.0 km',
    deliveryTime: '50 mins',
    offer: '5% cashback on all orders',
    categories: ['Groceries', 'Beverages', 'Snacks']
  }
];

export function AllStores() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredStores = allStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || store.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(allStores.flatMap(store => store.categories))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Stores</h1>
          <p className="text-gray-500 mt-1">Discover local stores near you</p>
        </div>
        <Search
          placeholder="Search stores..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="md:w-96"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div key={store.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-48 relative">
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{store.rating}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{store.name}</h3>
              <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{store.distance}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{store.deliveryTime}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {store.categories.map(category => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  {store.offer}
                </span>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => navigate(`/store/${store.id}`)}
              >
                Visit Store
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}