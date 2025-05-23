import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { StorePage } from './pages/StorePage';
import { Checkout } from './pages/Checkout';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { SellerLayout } from './components/seller/SellerLayout';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { AllStores } from './pages/AllStores';
import { PopularItems } from './pages/PopularItems';
import { CategoryItems } from './pages/CategoryItems';
import { Notifications } from './pages/Notifications';
import { InventoryManagement } from './pages/seller/InventoryManagement';
import { Subscriptions } from './pages/seller/Subscriptions';
import { Analytics } from './pages/seller/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/*" element={<Auth />} />
        
        {/* Buyer Routes */}
        <Route path="/buyer" element={<Layout><BuyerDashboard /></Layout>} />
        <Route path="/buyer/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/buyer/wishlist" element={<Layout><Wishlist /></Layout>} />
        <Route path="/buyer/cart" element={<Layout><Checkout /></Layout>} />
        <Route path="/buyer/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/buyer/settings" element={<Layout><Settings /></Layout>} />
        
        {/* Browse Routes */}
        <Route path="/stores" element={<Layout><AllStores /></Layout>} />
        <Route path="/items" element={<Layout><PopularItems /></Layout>} />
        <Route path="/store/category/:categoryId" element={<Layout><CategoryItems /></Layout>} />
        
        {/* Profile and Settings */}
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        
        {/* Seller Routes */}
        <Route path="/seller" element={<SellerLayout><SellerDashboard /></SellerLayout>} />
        <Route path="/seller/inventory" element={<SellerLayout><InventoryManagement /></SellerLayout>} />
        <Route path="/seller/orders" element={<SellerLayout><Orders /></SellerLayout>} />
        <Route path="/seller/subscriptions" element={<SellerLayout><Subscriptions /></SellerLayout>} />
        <Route path="/seller/analytics" element={<SellerLayout><Analytics /></SellerLayout>} />
        <Route path="/seller/settings" element={<SellerLayout><Settings /></SellerLayout>} />
        
        {/* Store and Checkout */}
        <Route path="/store/:id" element={<Layout><StorePage /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;