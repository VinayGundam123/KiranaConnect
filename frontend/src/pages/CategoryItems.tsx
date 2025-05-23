import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

const categoryItems = {
  groceries: [
    {
      id: 'g1',
      name: 'Tata Premium Toor Dal',
      price: 160,
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Krishna Kirana Store',
      storeId: '1',
      rating: 4.8
    },
    {
      id: 'g2',
      name: 'Organic Brown Rice',
      price: 180,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Sharma General Store',
      storeId: '2',
      rating: 4.7
    }
  ],
  vegetables: [
    {
      id: 'v1',
      name: 'Fresh Vegetable Pack',
      price: 250,
      image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Fresh Farm Store',
      storeId: '4',
      rating: 4.9
    },
    {
      id: 'v2',
      name: 'Organic Mixed Vegetables',
      price: 200,
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'City Supermarket',
      storeId: '3',
      rating: 4.6
    }
  ],
  fruits: [
    {
      id: 'f1',
      name: 'Seasonal Fruits Pack',
      price: 350,
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Fresh Farm Store',
      storeId: '4',
      rating: 4.8
    },
    {
      id: 'f2',
      name: 'Mixed Citrus Fruits',
      price: 280,
      image: 'https://images.unsplash.com/photo-1597714026720-8f74c62310ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'City Supermarket',
      storeId: '3',
      rating: 4.7
    }
  ],
  dairy: [
    {
      id: 'd1',
      name: 'Fresh Milk',
      price: 60,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Krishna Kirana Store',
      storeId: '1',
      rating: 4.8
    },
    {
      id: 'd2',
      name: 'Organic Yogurt',
      price: 45,
      image: 'https://images.unsplash.com/photo-1584278858536-52532423b9ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Daily Needs Mart',
      storeId: '5',
      rating: 4.6
    }
  ],
  snacks: [
    {
      id: 's1',
      name: 'Mixed Dry Fruits',
      price: 450,
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Sharma General Store',
      storeId: '2',
      rating: 4.9
    },
    {
      id: 's2',
      name: 'Assorted Cookies',
      price: 120,
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Daily Needs Mart',
      storeId: '5',
      rating: 4.7
    }
  ],
  beverages: [
    {
      id: 'b1',
      name: 'Green Tea Pack',
      price: 180,
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'Daily Needs Mart',
      storeId: '5',
      rating: 4.8
    },
    {
      id: 'b2',
      name: 'Fresh Fruit Juices',
      price: 160,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      store: 'City Supermarket',
      storeId: '3',
      rating: 4.7
    }
  ]
};

export function CategoryItems() {
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCart();

  const items = categoryItems[categoryId as keyof typeof categoryItems] || [];
  
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: `${item.storeId}-${item.id}`, // Make the ID unique per store
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      storeId: item.storeId,
      storeName: item.store
    });
    toast.success(`${item.name} added to cart from ${item.store}`);
  };

  const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
          <p className="text-gray-500 mt-1">Browse {categoryName.toLowerCase()} from local stores</p>
        </div>
        <Search
          placeholder={`Search ${categoryName.toLowerCase()}...`}
          value={searchQuery}
          onChange={setSearchQuery}
          className="md:w-96"
        />
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
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
}