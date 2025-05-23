import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { Package, Star, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import toast from 'react-hot-toast';

const popularStores = [
  {
    id: '1',
    name: 'Krishna Kirana Store',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    distance: '0.5 km',
    deliveryTime: '30 mins',
    offer: '20% off on first order'
  },
  {
    id: '2',
    name: 'Sharma General Store',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    distance: '1.2 km',
    deliveryTime: '45 mins',
    offer: 'Free delivery above ₹500'
  },
  {
    id: '3',
    name: 'City Supermarket',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    distance: '0.8 km',
    deliveryTime: '35 mins',
    offer: 'Buy 2 Get 1 Free on groceries'
  }
];

const popularItems = [
  {
    id: '1',
    name: 'Organic Rice',
    price: 180,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'Krishna Kirana Store',
    storeId: '1',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Fresh Vegetables Pack',
    price: 250,
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'City Supermarket',
    storeId: '3',
    rating: 4.6
  },
  {
    id: '3',
    name: 'Premium Spices Set',
    price: 450,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    store: 'Sharma General Store',
    storeId: '2',
    rating: 4.9
  }
];

const categories = [
  { name: "Groceries", icon: "🥑", id: "groceries" },
  { name: "Vegetables", icon: "🥕", id: "vegetables" },
  { name: "Fruits", icon: "🍎", id: "fruits" },
  { name: "Dairy", icon: "🥛", id: "dairy" },
  { name: "Snacks", icon: "🍪", id: "snacks" },
  { name: "Beverages", icon: "🥤", id: "beverages" }
];

const featuredOffers = [
  {
    title: "20% OFF",
    description: "On your first order",
    color: "bg-green-500",
    discount: 0.20,
    type: 'percentage',
    minOrder: 0
  },
  {
    title: "Free Delivery",
    description: "On orders above ₹500",
    color: "bg-blue-500",
    type: 'delivery',
    minOrder: 500
  },
  {
    title: "Cashback",
    description: "10% wallet cashback",
    color: "bg-purple-500",
    type: 'cashback',
    discount: 0.10,
    minOrder: 0
  }
];

function DashboardHome() {
  const navigate = useNavigate();
  const { addItem, items, total, updateDiscount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleVisitStore = (storeId: string) => {
    navigate(`/store/${storeId}`);
  };

  const handleAddToCart = (item: typeof popularItems[0]) => {
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

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/store/category/${categoryId}`);
  };

  const handleClaimOffer = (offer: typeof featuredOffers[0]) => {
    let discountAmount = 0;
    let message = '';

    if (total < offer.minOrder) {
      toast.error(`Minimum order amount of ₹${offer.minOrder} required`);
      return;
    }

    switch (offer.type) {
      case 'percentage':
        discountAmount = total * offer.discount;
        message = `${offer.title} discount applied`;
        break;
      case 'delivery':
        discountAmount = 40; // Standard delivery fee
        message = 'Free delivery applied';
        break;
      case 'cashback':
        discountAmount = total * offer.discount;
        message = `${offer.title} cashback will be credited to your wallet`;
        break;
    }

    updateDiscount(discountAmount);
    toast.success(message);
    navigate('/buyer/cart');
  };

  const handleViewAll = (section: string) => {
    switch (section) {
      case 'stores':
        navigate('/stores');
        break;
      case 'items':
        navigate('/items');
        break;
      case 'categories':
        navigate('/categories');
        break;
      default:
        break;
    }
  };

  // Filter stores and items based on search query
  const filteredStores = popularStores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItems = popularItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Stores Near You</h1>
          <p className="text-gray-500 mt-1">Fresh groceries delivered to your doorstep</p>
        </div>
        <Search
          placeholder="Search for stores or items..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="md:w-96"
        />
      </div>

      {/* Featured Offers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredOffers.map((offer, index) => (
          <div
            key={index}
            className={`${offer.color} rounded-xl p-6 text-white`}
          >
            <h3 className="text-2xl font-bold">{offer.title}</h3>
            <p className="mt-2">{offer.description}</p>
            <Button
              className="mt-4 bg-white text-gray-900 hover:bg-gray-100"
              size="sm"
              onClick={() => handleClaimOffer(offer)}
            >
              Claim Now
            </Button>
          </div>
        ))}
      </div>

      {/* Popular Stores */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Popular Stores</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewAll('stores')}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
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
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    {store.offer}
                  </span>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleVisitStore(store.id)}
                >
                  Visit Store
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Popular Items</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewAll('items')}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-48 relative">
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
                <p className="text-sm text-gray-500">{item.store}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">₹{item.price}</span>
                  <Button 
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Shop by Category</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewAll('categories')}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BuyerDashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
    </Routes>
  );
}