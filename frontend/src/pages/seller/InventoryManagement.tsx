import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  ArrowUpDown,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  sku?: string;
  unit: string;
  quantity_per_unit: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image_url: string;
  sku: string;
  unit: string;
  quantity_per_unit: string;
  min_stock_level: string;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: 'Groceries',
  image_url: '',
  sku: '',
  unit: 'piece',
  quantity_per_unit: '1',
  min_stock_level: '5',
};

const categories = [
  'Groceries',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Snacks',
  'Beverages',
  'Personal Care',
  'Household',
];

const units = [
  'kg',
  'g',
  'L',
  'ml',
  'piece',
  'pack',
  'dozen',
];

// // Mock initial products data
// const initialProducts: Product[] = [
//   {
//     _id: '1',
//     id: '1',
//     name: 'Organic Rice',
//     description: 'Premium quality organic rice',
//     price: 120,
//     stock: 50,
//     category: 'Groceries',
//     image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     sku: 'RICE001',
//     unit: 'kg',
//     quantity_per_unit: 1,
//     min_stock_level: 10,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     _id: '2',
//     id: '2',
//     name: 'Fresh Tomatoes',
//     description: 'Farm fresh tomatoes',
//     price: 40,
//     stock: 30,
//     category: 'Vegetables',
//     image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
//     sku: 'VEG001',
//     unit: 'kg',
//     quantity_per_unit: 1,
//     min_stock_level: 5,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   }
// ];

export function InventoryManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sellerId = localStorage.getItem('sellerId');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/seller/inventory/${sellerId}`);
        const formattedProducts = response.data.products.map((product: any) => ({
          ...product,
          id: product._id,
          stock: product.quantity,
          image_url: product.image_url,
          created_at: product.lastUpdated,
          updated_at: product.lastUpdated
        }));
        setProducts(formattedProducts);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchProducts();
    }
  }, [sellerId]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return false;
    }
    if (parseInt(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return false;
    }
    if (parseFloat(formData.quantity_per_unit) <= 0) {
      toast.error('Quantity per unit must be greater than 0');
      return false;
    }
    if (parseInt(formData.min_stock_level) < 0) {
      toast.error('Minimum stock level cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock),
        category: formData.category,
        image_url: formData.image_url.trim(),
        sku: formData.sku.trim(),
        unit: formData.unit,
        quantityPerUnit: parseFloat(formData.quantity_per_unit),
        minStockLevel: parseInt(formData.min_stock_level)
      };

      if (editingProduct) {
        console.log(productData);
        await axios.put(
          `http://localhost:5000/seller/inventory/${sellerId}/product/${editingProduct._id}`,
          productData
        );
        toast.success('Product updated successfully');
      } else {
        await axios.post(
          `http://localhost:5000/seller/inventory/${sellerId}`,
          productData
        );
        toast.success('Product added successfully');
      }

      // Fetch updated inventory after successful operation
      const response = await axios.get(`http://localhost:5000/seller/inventory/${sellerId}`);
      const formattedProducts = response.data.products.map((product: any) => ({
        ...product,
        id: product._id,
        stock: product.quantity,
        image_url: product.image_url,
        created_at: product.lastUpdated,
        updated_at: product.lastUpdated
      }));
      setProducts(formattedProducts);

      handleCloseModal();
    } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Please fill in all required fields');
      } else if (error.response?.status === 404) {
        toast.error('Seller not found');
      } else {
        toast.error(error.response?.data?.message || error.message || 'An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: (product.price || 0).toString(),
      stock: (product.stock || 0).toString(),
      category: product.category || 'Groceries',
      image_url: product.image_url || '',
      sku: product.sku || '',
      unit: product.unit || 'piece',
      quantity_per_unit: (product.quantity_per_unit || 1).toString(),
      min_stock_level: (product.min_stock_level || 5).toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (deleteConfirmId === productId) {
      try {
        await axios.delete(`http://localhost:5000/seller/inventory/${sellerId}/product/${productId}`);
        
        // Fetch updated inventory after successful deletion
        const response = await axios.get(`http://localhost:5000/seller/inventory/${sellerId}`);
        const formattedProducts = response.data.products.map((product: any) => ({
          ...product,
          id: product._id,
          stock: product.quantity,
          image_url: product.image_url,
          created_at: product.lastUpdated,
          updated_at: product.lastUpdated
        }));
        setProducts(formattedProducts);
        
        toast.success('Product deleted successfully');
        setDeleteConfirmId(null);
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    } else {
      setDeleteConfirmId(productId);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesStock = !showLowStock || product.stock <= product.min_stock_level;
      return matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your store's products</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitting}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <Button
          variant={showLowStock ? 'primary' : 'outline'}
          onClick={() => setShowLowStock(!showLowStock)}
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          Low Stock
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'price') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('price');
                      setSortDirection('asc');
                    }
                  }}
                >
                  <div className="flex items-center">
                    Price
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortField === 'stock') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('stock');
                      setSortDirection('asc');
                    }
                  }}
                >
                  <div className="flex items-center">
                    Stock
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/40';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.sku && (
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{product.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">per {product.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      product.stock <= product.min_stock_level
                        ? 'text-red-600 font-medium'
                        : 'text-gray-900'
                    }`}>
                      {product.stock} {product.unit}s
                    </div>
                    {product.stock <= product.min_stock_level && (
                      <div className="text-sm text-red-500">Low stock</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {deleteConfirmId === product.id ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelDelete}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {showLowStock 
                  ? 'No products with low stock'
                  : selectedCategory 
                    ? `No products found in ${selectedCategory} category`
                    : 'No products found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {showLowStock 
                  ? 'All your products are well stocked'
                  : 'Get started by adding some products to your inventory'}
              </p>
              {!showLowStock && (
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="block w-full pl-7 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      disabled={isSubmitting}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      disabled={isSubmitting}
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity per Unit</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.quantity_per_unit}
                    onChange={(e) => setFormData({ ...formData, quantity_per_unit: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Example: 500 for 500g per kg, 12 for pieces per dozen
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)  (Optional)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You'll be notified when stock falls below this level
                  </p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingProduct ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingProduct ? 'Update Product' : 'Add Product'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}