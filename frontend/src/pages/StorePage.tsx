import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { Star, Clock, MapPin, Phone, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

interface StoreItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  image?: string;
}

const mockStores = {
  '1': {
    id: '1',
    name: 'Krishna Kirana Store',
    rating: 4.8,
    reviews: 2500,
    openingHours: '8 AM - 10 PM',
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
  },
  '2': {
    id: '2',
    name: 'Sharma General Store',
    rating: 4.6,
    reviews: 1800,
    openingHours: '9 AM - 9 PM',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
  },
  '3': {
    id: '3',
    name: 'City Supermarket',
    rating: 4.7,
    reviews: 3200,
    openingHours: '8 AM - 11 PM',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
  }
};

const mockItems: StoreItem[] = [
  {
    id: '1',
    name: 'Tata Premium Toor Dal',
    price: 160,
    unit: '1kg',
    category: 'Pulses',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '2',
    name: 'Basmati Rice',
    price: 95,
    unit: '1kg',
    category: 'Rice',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  },
];

const categories = ['All', 'Rice', 'Pulses', 'Oils', 'Spices', 'Snacks', 'Beverages'];

export function StorePage() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem } = useCart();

  // Get store details based on the ID from URL, fallback to first store if ID not found
  const storeDetails = id && mockStores[id as keyof typeof mockStores] 
    ? mockStores[id as keyof typeof mockStores] 
    : mockStores['1'];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: StoreItem) => {
    if (!item.inStock) {
      toast.error('Item is out of stock');
      return;
    }

    // Ensure we're passing the correct store information
    addItem({
      id: `${storeDetails.id}-${item.id}`, // Make the ID unique per store
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      storeId: storeDetails.id,
      storeName: storeDetails.name
    });

    toast.success(`${item.name} added to cart from ${storeDetails.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Store Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="h-48 relative">
          <img
            src={storeDetails.image}
            alt="Store cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{storeDetails.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{storeDetails.rating} ({storeDetails.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Opens {storeDetails.openingHours}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{storeDetails.distance} away</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <Search
          placeholder="Search for items..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-xl"
        />
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-square relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {!item.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.unit}</span>
                <span className="font-medium">₹{item.price}</span>
              </div>
              <Button
                className="w-full mt-4"
                disabled={!item.inStock}
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}