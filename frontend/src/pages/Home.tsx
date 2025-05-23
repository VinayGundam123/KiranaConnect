import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Truck,
  Clock,
  Users,
  ArrowRight,
  ChevronRight,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeIn}>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Your Local Kirana Store,{' '}
                <span className="text-primary-200">Now Digital</span>
              </h1>
              <p className="mt-6 text-xl text-primary-100">
                Subscribe to your favorite stores, share deliveries with neighbors, and shop smarter with AI-powered recommendations.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-200" />
                  <span className="text-primary-100">10k+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary-200" />
                  <span className="text-primary-100">500+ Stores</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="relative hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary-800/50 to-transparent rounded-2xl" />
              <img
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Local store"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to shop smarter
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Connect with local stores, share deliveries, and save more with smart subscriptions.
            </p>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Smart Subscriptions',
                description: 'Set up recurring deliveries for your essentials and never run out.',
              },
              {
                icon: Users,
                title: 'Shared Deliveries',
                description: 'Split delivery costs with neighbors and reduce environmental impact.',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: 'Get your groceries delivered within hours, not days.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="absolute top-8 right-8">
                  <ChevronRight className="h-5 w-5 text-primary-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Featured Stores</h2>
            <p className="mt-4 text-xl text-gray-600">
              Discover quality products from trusted local stores
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((store) => (
              <motion.div
                key={store}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-video relative">
                  <img
                    src={`https://images.unsplash.com/photo-${1584008604 + store}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
                    alt={`Store ${store}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">4.8</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Krishna Kirana Store {store}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Fresh groceries and daily essentials
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Delivers in 30 mins</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Visit Store
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900">
                Why choose KiranaConnect?
              </h2>
              <div className="mt-8 space-y-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Verified Stores',
                    description: 'All stores are verified and regularly audited for quality.',
                  },
                  {
                    icon: Clock,
                    title: 'Quick Delivery',
                    description: 'Get your groceries delivered within 30 minutes.',
                  },
                  {
                    icon: Users,
                    title: 'Community Driven',
                    description: 'Share deliveries with neighbors and save on costs.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Store interior"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-6 max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">4.8/5 Rating</h4>
                    <p className="text-sm text-gray-600">from 10,000+ users</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white">
              Ready to transform your shopping experience?
            </h2>
            <p className="mt-4 text-xl text-primary-200">
              Join thousands of happy customers shopping smarter with KiranaConnect
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
                onClick={handleGetStarted}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}