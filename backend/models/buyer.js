// const mongoose = require('mongoose');

// const itemSchema = new mongoose.Schema({
//   itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to product/item collection
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, default: 1 },
//   image: { type: String }, // Optional: Image URL for display
//   unit: { type: String, required: true }, // E.g., 'kg', 'pcs'
//   storeName: { type: String, required: true }, // Store display name
//   storeId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to store collection
//   // New fields for smart cart functionality
//   addedAt: { type: Date, default: Date.now }, // When item was first added to cart
//   lastUpdated: { type: Date, default: Date.now }, // Last time item was modified
//   notificationSent: { type: Boolean, default: false }, // Track if abandonment notification was sent
//   notificationCount: { type: Number, default: 0 }, // Count of notifications sent for this item
//   lastNotificationSent: { type: Date }, // Timestamp of the last notification sent
//   notificationsPaused: { type: Boolean, default: false }, // Flag to pause notifications for this item
// });

// const orderSchema = new mongoose.Schema({
//   orderId: { type: String, required: true }, // Unique identifier for the order
//   items: [], // List of items in the order
//   totalAmount: { type: Number, required: true }, // Total cost of the order
//   status: {
//     type: String,
//     enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
//     default: 'Pending', // Default status
//   },
//   orderDate: { type: Date, default: Date.now }, // Timestamp of the order
//   deliveryAddress: { type: String, required: true }, // Address for delivery
// });

// // Enhanced notification schema to match controller functionality
// const notificationSchema = new mongoose.Schema({
//   type: { 
//     type: String, 
//     enum: ['cart_abandonment', 'ai_cart_reminder', 'order_update', 'promotion', 'reminder'], // Added ai_cart_reminder
//     required: true 
//   },
//   message: { type: String, required: true },
//   // Enhanced items array to match controller usage
//   items: [{ 
//     itemId: { type: mongoose.Schema.Types.ObjectId },
//     name: { type: String },
//     quantity: { type: Number }
//   }],
//   // Additional fields used by controller
//   itemId: { type: mongoose.Schema.Types.ObjectId }, // For single item notifications
//   itemName: { type: String }, // For single item notifications
//   notificationCount: { type: Number }, // Track which notification this is (1st, 2nd, 3rd)
//   sentAt: { type: Date, default: Date.now },
//   status: { 
//     type: String, 
//     enum: ['sent', 'delivered', 'read', 'failed'], 
//     default: 'sent' 
//   },
//   channel: { 
//     type: String, 
//     enum: ['email', 'sms', 'push', 'in_app'], 
//     default: 'in_app' 
//   },
//   readAt: { type: Date }, // When notification was read
// });

// const buyerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // Store hashed passwords
//   address: { type: String },
//   phone: { type: String }, // For SMS notifications
  
//   // Notification preferences
//   notificationPreferences: {
//     cartAbandonment: { type: Boolean, default: true },
//     email: { type: Boolean, default: true },
//     sms: { type: Boolean, default: false },
//     push: { type: Boolean, default: true }
//   },
  
//   wishlist: {
//     type: [itemSchema],
//     default: [], // Default to an empty array
//   },
  
//   cart: {
//     items: {
//       type: [itemSchema],
//       default: [], // Default to an empty array
//     },
//     totalQuantity: { type: Number, default: 0 }, // Defaults to 0
//     totalPrice: { type: Number, default: 0 }, // Defaults to 0
//     lastActivity: { type: Date, default: Date.now }, // Track last cart activity
//     abandonmentNotificationSent: { type: Boolean, default: false }, // Global cart abandonment flag
//   },
  
//   orders: {
//     type: [orderSchema],
//     default: [], // Default to an empty array
//   },
  
//   // Store notifications history
//   notifications: {
//     type: [notificationSchema],
//     default: [],
//   },
  
//   // Smart cart analytics
//   cartAnalytics: {
//     totalItemsAdded: { type: Number, default: 0 },
//     totalItemsRemoved: { type: Number, default: 0 },
//     averageCartValue: { type: Number, default: 0 },
//     longestCartDuration: { type: Number, default: 0 }, // in minutes
//     completionRate: { type: Number, default: 0 }, // percentage of carts that led to orders
//     lastCartAbandonmentDate: { type: Date },
//     frequentlyAbandonedItems: [{ // Track items that are often abandoned
//       itemId: { type: mongoose.Schema.Types.ObjectId },
//       name: { type: String },
//       abandonmentCount: { type: Number, default: 0 }
//     }]
//   },
  
//   token: { type: String },
// }, { timestamps: true });

// // Indexes for better query performance
// buyerSchema.index({ 'cart.lastActivity': 1 });
// buyerSchema.index({ 'cart.items.addedAt': 1 });
// buyerSchema.index({ 'cart.items.notificationSent': 1 });
// buyerSchema.index({ email: 1 });

// // Pre-save middleware to update cart analytics
// buyerSchema.pre('save', function(next) {
//   if (this.isModified('cart.items')) {
//     // Update analytics when cart is modified
//     const cartItems = this.cart.items || [];
//     this.cartAnalytics.totalItemsAdded = Math.max(
//       this.cartAnalytics.totalItemsAdded || 0,
//       cartItems.length
//     );
    
//     if (cartItems.length > 0) {
//       this.cartAnalytics.averageCartValue = this.cart.totalPrice;
//     }
//   }
//   next();
// });

// // Method to mark notification as read
// buyerSchema.methods.markNotificationAsRead = function(notificationId) {
//   const notification = this.notifications.id(notificationId);
//   if (notification) {
//     notification.status = 'read';
//     notification.readAt = new Date();
//   }
//   return this.save();
// };

// // Method to get unread notifications
// buyerSchema.methods.getUnreadNotifications = function() {
//   return this.notifications.filter(notification => 
//     notification.status === 'sent' || notification.status === 'delivered'
//   );
// };

// // Method to get cart abandonment insights
// buyerSchema.methods.getCartInsights = function() {
//   const currentTime = new Date();
//   const cartItems = this.cart.items || [];
  
//   const insights = {
//     totalItems: cartItems.length,
//     totalValue: this.cart.totalPrice || 0,
//     oldestItemAge: 0,
//     itemsOlderThan30Min: 0,
//     averageItemAge: 0,
//     riskLevel: 'low' // low, medium, high
//   };
  
//   if (cartItems.length > 0) {
//     const itemAges = cartItems.map(item => {
//       const addedTime = item.addedAt || item.lastUpdated || this.createdAt;
//       return Math.floor((currentTime - addedTime) / (1000 * 60)); // age in minutes
//     });
    
//     insights.oldestItemAge = Math.max(...itemAges);
//     insights.averageItemAge = Math.floor(itemAges.reduce((sum, age) => sum + age, 0) / itemAges.length);
//     insights.itemsOlderThan30Min = itemAges.filter(age => age > 30).length;
    
//     // Determine risk level
//     if (insights.oldestItemAge > 60 && insights.totalValue > 500) {
//       insights.riskLevel = 'high';
//     } else if (insights.oldestItemAge > 30 || insights.totalValue > 200) {
//       insights.riskLevel = 'medium';
//     }
//   }
  
//   return insights;
// };

// // Static method to find buyers with abandoned carts
// buyerSchema.statics.findAbandonedCarts = function(minutesThreshold = 30) {
//   const cutoffTime = new Date(Date.now() - (minutesThreshold * 60 * 1000));
  
//   return this.find({
//     'cart.items': { $exists: true, $ne: [] },
//     $or: [
//       { 'cart.lastActivity': { $lt: cutoffTime } },
//       { 'cart.lastActivity': { $exists: false } }
//     ]
//   });
// };

// exports.Buyer = mongoose.model('Buyer', buyerSchema);



const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to product/item collection
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String }, // Optional: Image URL for display
  unit: { type: String, required: true }, // E.g., 'kg', 'pcs'
  storeName: { type: String, required: true }, // Store display name
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to store collection
  // Enhanced fields for smart cart functionality
  addedAt: { type: Date, default: Date.now }, // When item was first added to cart
  lastUpdated: { type: Date, default: Date.now }, // Last time item was modified
  notificationSent: { type: Boolean, default: false }, // Track if abandonment notification was sent
  notificationCount: { type: Number, default: 0 }, // Count of notifications sent for this item
  lastNotificationSent: { type: Date }, // Changed from String to Date for proper timestamp handling
  notificationsPaused: { type: Boolean, default: false }, // Flag to pause notifications for this item
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true }, // Unique identifier for the order
  items: [], // List of items in the order
  totalAmount: { type: Number, required: true }, // Total cost of the order
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending', // Default status
  },
  orderDate: { type: Date, default: Date.now }, // Timestamp of the order
  deliveryAddress: { type: String, required: true }, // Address for delivery
});

// Enhanced notification schema to match controller functionality
const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['cart_abandonment', 'ai_cart_reminder', 'order_update', 'promotion', 'reminder'], // Added ai_cart_reminder
    required: true 
  },
  message: { type: String, required: true },
  // Enhanced items array to match controller usage
  items: [{ 
    itemId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    quantity: { type: Number }
  }],
  // Additional fields used by controller
  itemId: { type: mongoose.Schema.Types.ObjectId }, // For single item notifications
  itemName: { type: String }, // For single item notifications
  notificationCount: { type: Number }, // Track which notification this is (1st, 2nd, 3rd)
  sentAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read', 'failed'], 
    default: 'sent' 
  },
  channel: { 
    type: String, 
    enum: ['email', 'sms', 'push', 'in_app'], 
    default: 'in_app' 
  },
  readAt: { type: Date }, // When notification was read
});

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords
  address: { type: String },
  phone: { type: String }, // For SMS notifications
  
  // Enhanced notification preferences
  notificationPreferences: {
    cartAbandonment: { type: Boolean, default: true },
    aiReminders: { type: Boolean, default: true }, // Added for AI notifications
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    maxNotificationsPerItem: { type: Number, default: 3 } // Match controller's MAX_NOTIFICATIONS_PER_ITEM
  },
  
  wishlist: {
    type: [itemSchema],
    default: [], // Default to an empty array
  },
  
  cart: {
    items: {
      type: [itemSchema],
      default: [], // Default to an empty array
    },
    totalQuantity: { type: Number, default: 0 }, // Defaults to 0
    totalPrice: { type: Number, default: 0 }, // Defaults to 0
    lastActivity: { type: Date, default: Date.now }, // Track last cart activity
    abandonmentNotificationSent: { type: Boolean, default: false }, // Global cart abandonment flag
  },
  
  orders: {
    type: [orderSchema],
    default: [], // Default to an empty array
  },
  
  // Store notifications history - matches controller usage
  notifications: {
    type: [notificationSchema],
    default: [],
  },
  
  // Enhanced smart cart analytics
  cartAnalytics: {
    totalItemsAdded: { type: Number, default: 0 },
    totalItemsRemoved: { type: Number, default: 0 },
    averageCartValue: { type: Number, default: 0 },
    longestCartDuration: { type: Number, default: 0 }, // in minutes
    completionRate: { type: Number, default: 0 }, // percentage of carts that led to orders
    lastCartAbandonmentDate: { type: Date },
    totalNotificationsSent: { type: Number, default: 0 }, // Track total AI notifications sent
    notificationResponseRate: { type: Number, default: 0 }, // Track how often notifications lead to purchases
    frequentlyAbandonedItems: [{ // Track items that are often abandoned
      itemId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      abandonmentCount: { type: Number, default: 0 }
    }]
  },
  
  token: { type: String },
}, { timestamps: true });

// Enhanced indexes for better query performance
buyerSchema.index({ 'cart.lastActivity': 1 });
buyerSchema.index({ 'cart.items.addedAt': 1 });
buyerSchema.index({ 'cart.items.notificationSent': 1 });
buyerSchema.index({ 'cart.items.notificationCount': 1 });
buyerSchema.index({ 'cart.items.lastNotificationSent': 1 });
buyerSchema.index({ 'notifications.type': 1 });
buyerSchema.index({ 'notifications.sentAt': -1 });
buyerSchema.index({ email: 1 });

// Enhanced pre-save middleware to update cart analytics
buyerSchema.pre('save', function(next) {
  if (this.isModified('cart.items')) {
    // Update analytics when cart is modified
    const cartItems = this.cart.items || [];
    this.cartAnalytics.totalItemsAdded = Math.max(
      this.cartAnalytics.totalItemsAdded || 0,
      cartItems.length
    );
    
    if (cartItems.length > 0) {
      this.cartAnalytics.averageCartValue = this.cart.totalPrice;
    }
  }
  
  // Update notification analytics
  if (this.isModified('notifications')) {
    const aiNotifications = this.notifications.filter(n => n.type === 'ai_cart_reminder');
    this.cartAnalytics.totalNotificationsSent = aiNotifications.length;
  }
  
  next();
});

// Method to mark notification as read
buyerSchema.methods.markNotificationAsRead = function(notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.status = 'read';
    notification.readAt = new Date();
  }
  return this.save();
};

// Method to get unread notifications
buyerSchema.methods.getUnreadNotifications = function() {
  return this.notifications.filter(notification => 
    notification.status === 'sent' || notification.status === 'delivered'
  );
};

// Method to get AI notifications (matches controller function)
buyerSchema.methods.getAINotifications = function(limit = 10) {
  return this.notifications
    .filter(notification => notification.type === 'ai_cart_reminder')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, limit);
};

// Enhanced method to get cart abandonment insights (matches controller logic)
buyerSchema.methods.getCartInsights = function() {
  const currentTime = new Date();
  const cartItems = this.cart.items || [];
  
  const insights = {
    totalItems: cartItems.length,
    totalValue: this.cart.totalPrice || 0,
    oldestItem: null,
    newestItem: null,
    itemsNeedingAttention: [],
    timeSinceLastActivity: null,
    recommendedAction: 'none',
    oldestItemAge: 0,
    itemsOlderThan30Min: 0,
    averageItemAge: 0,
    riskLevel: 'low' // low, medium, high
  };
  
  if (cartItems.length > 0) {
    let oldest = cartItems[0];
    let newest = cartItems[0];
    
    const itemAges = cartItems.map(item => {
      const itemTime = item.addedAt || item.lastUpdated || this.createdAt;
      const age = Math.floor((currentTime - itemTime) / (1000 * 60)); // age in minutes
      
      // Find oldest and newest items
      const oldestTime = oldest.addedAt || oldest.lastUpdated || this.createdAt;
      const newestTime = newest.addedAt || newest.lastUpdated || this.createdAt;
      
      if (itemTime < oldestTime) oldest = item;
      if (itemTime > newestTime) newest = item;
      
      // Check if item needs attention (matches controller logic)
      const CART_ABANDONMENT_TIME = 30 * 60 * 1000; // 30 minutes
      if (currentTime - itemTime > CART_ABANDONMENT_TIME && !item.notificationSent) {
        insights.itemsNeedingAttention.push({
          name: item.name,
          addedAgo: age
        });
      }
      
      return age;
    });
    
    insights.oldestItem = {
      name: oldest.name,
      addedAgo: Math.floor((currentTime - (oldest.addedAt || oldest.lastUpdated)) / (1000 * 60))
    };
    
    insights.newestItem = {
      name: newest.name,
      addedAgo: Math.floor((currentTime - (newest.addedAt || newest.lastUpdated)) / (1000 * 60))
    };
    
    insights.oldestItemAge = Math.max(...itemAges);
    insights.averageItemAge = Math.floor(itemAges.reduce((sum, age) => sum + age, 0) / itemAges.length);
    insights.itemsOlderThan30Min = itemAges.filter(age => age > 30).length;
    
    // Time since last activity
    if (this.cart.lastActivity) {
      insights.timeSinceLastActivity = Math.floor((currentTime - this.cart.lastActivity) / (1000 * 60));
    }
    
    // Determine recommended action (matches controller logic)
    if (insights.itemsNeedingAttention.length > 0) {
      insights.recommendedAction = 'send_notification';
    } else if (insights.totalValue > 1000) {
      insights.recommendedAction = 'offer_discount';
    } else if (insights.timeSinceLastActivity > 15) {
      insights.recommendedAction = 'gentle_reminder';
    }
    
    // Determine risk level
    if (insights.oldestItemAge > 60 && insights.totalValue > 500) {
      insights.riskLevel = 'high';
    } else if (insights.oldestItemAge > 30 || insights.totalValue > 200) {
      insights.riskLevel = 'medium';
    }
  }
  
  return insights;
};

// Enhanced static method to find buyers with abandoned carts (matches controller usage)
buyerSchema.statics.findAbandonedCarts = function(minutesThreshold = 30) {
  const cutoffTime = new Date(Date.now() - (minutesThreshold * 60 * 1000));
  
  return this.find({
    'cart.items': { $exists: true, $ne: [] },
    $or: [
      { 'cart.lastActivity': { $lt: cutoffTime } },
      { 'cart.lastActivity': { $exists: false } }
    ]
  });
};

// Method to check if item notifications are paused
buyerSchema.methods.areItemNotificationsPaused = function(itemId) {
  const item = this.cart.items.find(item => item.itemId.toString() === itemId);
  return item ? item.notificationsPaused : false;
};

// Method to get notification count for an item
buyerSchema.methods.getItemNotificationCount = function(itemId) {
  const item = this.cart.items.find(item => item.itemId.toString() === itemId);
  return item ? (item.notificationCount || 0) : 0;
};

exports.Buyer = mongoose.model('Buyer', buyerSchema);