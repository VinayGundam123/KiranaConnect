import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Clock,
  Building,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { signIn, signUp } from '@/lib/auth';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
            <Store className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          KiranaConnect
        </h2>
      </motion.div>
      {children}
    </div>
  );
}

function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const handleContinue = () => {
    navigate(`/auth/${role}`);
  };

  return (
    <AuthLayout>
      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        variants={fadeIn}
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              Choose your role
            </h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Select how you'll be using KiranaConnect
            </p>
          </div>

          <div className="space-y-4">
            <button
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                role === 'buyer'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setRole('buyer')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-medium text-gray-900">I'm a Buyer</p>
                  <p className="text-sm text-gray-500">
                    Shop from local stores and manage deliveries
                  </p>
                </div>
              </div>
            </button>

            <button
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                role === 'seller'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setRole('seller')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-medium text-gray-900">I'm a Seller</p>
                  <p className="text-sm text-gray-500">
                    List your store and manage orders
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6">
            <Button
              className="w-full"
              onClick={handleContinue}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  storeName?: string;
  storeAddress?: string;
  storeType?: string;
  openingTime?: string;
  closingTime?: string;
  gstNumber?: string;
}

function AuthForm({ role }: { role: 'buyer' | 'seller' }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    storeName: '',
    storeAddress: '',
    storeType: 'grocery',
    openingTime: '09:00',
    closingTime: '21:00',
    gstNumber: '',
  });

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!formData.name || !formData.phone) {
        toast.error('Please fill in all required fields');
        return false;
      }

      if (role === 'seller') {
        if (!formData.storeName || !formData.storeAddress || !formData.openingTime || !formData.closingTime) {
          toast.error('Please fill in all store details');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:5000/buyer/login',{
          email: formData.email,
          password: formData.password
        });
        console.log(response.data);
        // await signIn(formData.email, formData.password);
        toast.success('Login successful!');
      } else {
        const response = await axios.post('http://localhost:5000/buyer/signUp',{
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        console.log(response.data);
        // await signUp(formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      navigate(role === 'seller' ? '/seller' : '/buyer');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        variants={fadeIn}
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate('/auth')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-semibold text-gray-900">
              {isLogin ? 'Sign in' : `Create ${role} account`}
            </h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {role === 'seller' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Store Name
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.storeName}
                          onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                          className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Your Store Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Store Address
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.storeAddress}
                          onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                          className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Store Address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Opening Time
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            required
                            value={formData.openingTime}
                            onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Closing Time
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            required
                            value={formData.closingTime}
                            onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        GST Number (Optional)
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="text"
                          value={formData.gstNumber}
                          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                          className="block w-full sm:text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          placeholder="GST Number"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

export function Auth() {
  return (
    <Routes>
      <Route index element={<RoleSelection />} />
      <Route path="/buyer" element={<AuthForm role="buyer" />} />
      <Route path="/seller" element={<AuthForm role="seller" />} />
      <Route path="*" element={<RoleSelection />} />
    </Routes>
  );
}