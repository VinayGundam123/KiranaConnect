const mongoose = require("mongoose");

// Email validation regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex patterns
const passwordRegex = {
  minLength: /.{6,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

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
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending", // Default status
  },
  orderDate: { type: Date, default: Date.now }, // Timestamp of the order
  deliveryAddress: { type: String, required: true }, // Address for delivery
});

// Enhanced notification schema to match controller functionality
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "cart_abandonment",
      "ai_cart_reminder",
      "order_update",
      "promotion",
      "reminder",
    ], // Added ai_cart_reminder
    required: true,
  },
  message: { type: String, required: true },
  // Enhanced items array to match controller usage
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      quantity: { type: Number },
    },
  ],
  // Additional fields used by controller
  itemId: { type: mongoose.Schema.Types.ObjectId }, // For single item notifications
  itemName: { type: String }, // For single item notifications
  notificationCount: { type: Number }, // Track which notification this is (1st, 2nd, 3rd)
  sentAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed"],
    default: "sent",
  },
  channel: {
    type: String,
    enum: ["email", "sms", "push", "in_app"],
    default: "in_app",
  },
  readAt: { type: Date }, // When notification was read
});

const buyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return emailRegex.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return (
            passwordRegex.minLength.test(v) &&
            passwordRegex.hasUpperCase.test(v) &&
            passwordRegex.hasLowerCase.test(v) &&
            passwordRegex.hasNumber.test(v) &&
            passwordRegex.hasSpecialChar.test(v)
          );
        },
        message: props => 
          'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      }
    },
    address: { type: String },
    phone: { type: String, required: true }, // For SMS notifications

    // Enhanced notification preferences
    notificationPreferences: {
      cartAbandonment: { type: Boolean, default: true },
      aiReminders: { type: Boolean, default: true }, // Added for AI notifications
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      maxNotificationsPerItem: { type: Number, default: 3 }, // Match controller's MAX_NOTIFICATIONS_PER_ITEM
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
      frequentlyAbandonedItems: [
        {
          // Track items that are often abandoned
          itemId: { type: mongoose.Schema.Types.ObjectId },
          name: { type: String },
          abandonmentCount: { type: Number, default: 0 },
        },
      ],
    },

    token: { type: String },
  },
  { timestamps: true }
);

// Remove any explicit index creation if it exists
// buyerSchema.index({ email: 1 });  // Remove this if it exists

const Buyer = mongoose.model("Buyer", buyerSchema);

module.exports = { Buyer };
