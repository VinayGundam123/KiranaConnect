import React, { useState } from 'react';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

const allItems = [
  {
    id: '1',
    name: 'Organic Rice',
    price: 180,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'Krishna Kirana Store',
    storeId: '1',
    rating: 4.8,
    category: 'Groceries'
  },
  {
    id: '2',
    name: 'Fresh Vegetables Pack',
    price: 250,
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'City Supermarket',
    storeId: '3',
    rating: 4.6,
    category: 'Vegetables'
  },
  {
    id: '3',
    name: 'Premium Spices Set',
    price: 450,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'Sharma General Store',
    storeId: '2',
    rating: 4.9,
    category: 'Spices'
  },
  {
    id: '4',
    name: 'Fresh Milk',
    price: 60,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'Daily Needs Mart',
    storeId: '5',
    rating: 4.7,
    category: 'Dairy'
  },
  {
    id: '5',
    name: 'Organic Fruits Pack',
    price: 350,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'Fresh Farm Store',
    storeId: '4',
    rating: 4.8,
    category: 'Fruits'
  }
];

export function PopularItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addItem } = useCart();

  const categories = Array.from(new Set(allItems.map(item => item.category)));

  const filteredItems = allItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: typeof allItems[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      storeId: item.storeId,
      storeName: item.store
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Popular Items</h1>
          <p className="text-gray-500 mt-1">Discover popular items from local stores</p>
        </div>
        <Search
          placeholder="Search items..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{item.rating}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.store}</p>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {item.category}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">₹{item.price}</span>
                <Button 
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
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