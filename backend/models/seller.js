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

// Schema for inventory items
const inventoryItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0
  },
  unit: { 
    type: String, 
    required: true,
    enum: ['kg', 'g', 'L', 'ml', 'piece', 'pack', 'dozen']
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Household']
  },
  image_url: { 
    type: String,
    trim: true
  },
  sku: { 
    type: String,
    trim: true
  },
  quantity_per_unit: { 
    type: Number,
    required: true,
    min: 0.01
  },
  min_stock_level: { 
    type: Number,
    required: true,
    min: 0,
    default: 5
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Schema for notifications
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["inventory_low", "order_received", "order_update", "system"],
    required: true,
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const sellerSchema = new mongoose.Schema(
  {
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
    name: {type: String,required: true,},
    phone: {type: String,required: true,},
    storeAddress: {type: String,required: true,},
    storeType: {type: String,required: true,},
    openingTime: {type: Date,required: true,},
    closingTime: {type: Date,required: true,},
    gstNumber: {type: String,},
    inventory: {type: [inventoryItemSchema],default: [],},
    notifications: {type: [notificationSchema],default: [],},
    isVerified: {type: Boolean,default: false,},
    rating: {type: Number,default: 0,min: 0,max: 5,},
    totalRatings: {type: Number,default: 0,},
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    token: {type: String,},
  },
  { timestamps: true }
);

// // Indexes for better query performance
// sellerSchema.index({ email: 1 });
// sellerSchema.index({ storeName: 1 });
// sellerSchema.index({ "inventory.name": 1 });
// sellerSchema.index({ "inventory.category": 1 });

// Pre-save middleware coto ensure opening time is before closing time
sellerSchema.pre("save", function (next) {
  if (this.openingTime >= this.closingTime) {
    next(new Error("Opening time must be before closing time"));
  }
  next();
});

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
